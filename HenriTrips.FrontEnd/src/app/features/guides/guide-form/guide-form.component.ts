import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GuideService, Guide } from '../../../core/services/guide.service';

@Component({
  selector: 'app-guide-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="breadcrumb slide-up">
      <a routerLink="/dashboard" class="btn btn-outline btn-sm">
        <span class="material-symbols">arrow_back</span> Back to Guides
      </a>
    </div>

    <div class="form-container slide-up">
      <div class="glass-panel form-card">
        <h2 style="margin-bottom: 2rem;">{{ isEditMode ? 'Edit Guide' : 'Create New Guide' }}</h2>

        <form [formGroup]="guideForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label class="form-label">Guide Title</label>
            <input type="text" class="form-control" formControlName="title" placeholder="E.g., Paris Weekend Gateway" required>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" formControlName="description" rows="4" placeholder="Brief description of the guide..." required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Duration (Days)</label>
              <input type="number" class="form-control" formControlName="days" min="1" max="14" required>
            </div>
            
            <div class="form-group" style="flex: 2;">
              <label class="form-label">Cover Image URL</label>
              <input type="url" class="form-control" formControlName="imageUrl" placeholder="https://images.unsplash.com/...">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mobility Options</label>
            <div class="checkbox-group">
              <label class="checkbox-inline" *ngFor="let opt of ['car', 'bike', 'walking', 'motorcycle']">
                <input type="checkbox" [checked]="isMobilitySelected(opt)" (change)="toggleMobility(opt, $event)">
                {{ opt | titlecase }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Seasons</label>
            <div class="checkbox-group">
              <label class="checkbox-inline" *ngFor="let opt of ['spring', 'summer', 'autumn', 'winter']">
                <input type="checkbox" [checked]="isSeasonSelected(opt)" (change)="toggleSeason(opt, $event)">
                {{ opt | titlecase }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Target Audience</label>
            <div class="checkbox-group">
              <label class="checkbox-inline" *ngFor="let opt of ['family', 'solo', 'group', 'friends']">
                <input type="checkbox" [checked]="isAudienceSelected(opt)" (change)="toggleAudience(opt, $event)">
                {{ opt | titlecase }}
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="guideForm.invalid">
              <span class="material-symbols">save</span>
              {{ isEditMode ? 'Save Changes' : 'Create Guide' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .breadcrumb { margin-bottom: 2rem; }
    .btn-sm { padding: 0.5rem 1rem; }
    
    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-card {
      padding: 2.5rem;
    }
    
    .form-row {
      display: flex;
      gap: 1.5rem;
    }
    
    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 0.5rem 0;
    }
    
    .checkbox-inline {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: var(--text-main);
    }
    
    .checkbox-inline input {
      accent-color: var(--primary);
      width: 1.2rem;
      height: 1.2rem;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
    }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class GuideFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private guideService = inject(GuideService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  guideId: string | null = null;
  
  guideForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    days: [1, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    mobility: [[] as string[]],
    seasons: [[] as string[]],
    targetAudience: [[] as string[]]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.guideId = id;
        this.guideService.getGuideById(id).subscribe(guide => {
          if (guide) {
            this.guideForm.patchValue(guide);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  // Checkbox helpers
  isMobilitySelected(opt: string) { return this.guideForm.value.mobility.includes(opt); }
  isSeasonSelected(opt: string) { return this.guideForm.value.seasons.includes(opt); }
  isAudienceSelected(opt: string) { return this.guideForm.value.targetAudience.includes(opt); }

  toggleMobility(opt: string, event: any) { this.toggleArrayItem('mobility', opt, event.target.checked); }
  toggleSeason(opt: string, event: any) { this.toggleArrayItem('seasons', opt, event.target.checked); }
  toggleAudience(opt: string, event: any) { this.toggleArrayItem('targetAudience', opt, event.target.checked); }

  private toggleArrayItem(controlName: string, item: string, isChecked: boolean) {
    const list = [...this.guideForm.get(controlName)?.value];
    if (isChecked) {
      list.push(item);
    } else {
      const idx = list.indexOf(item);
      if (idx > -1) list.splice(idx, 1);
    }
    this.guideForm.patchValue({ [controlName]: list });
    this.guideForm.get(controlName)?.markAsDirty();
  }

  onSubmit() {
    if (this.guideForm.invalid) return;

    if (this.isEditMode && this.guideId) {
      this.guideService.updateGuide(this.guideId, this.guideForm.value);
    } else {
      this.guideService.addGuide(this.guideForm.value);
    }

    this.router.navigate(['/dashboard']);
  }
}
