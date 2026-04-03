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
    <a routerLink="/dashboard" class="breadcrumb-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Guides
    </a>
    <div class="breadcrumb-divider">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
    <span class="breadcrumb-current">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4v16h16V4H4z M8 9h8M8 13h6M8 17h4"/>
      </svg>
      {{ isEditMode ? 'Edit Guide' : 'Create Guide' }}
    </span>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isEditMode ? 'Save Changes' : 'Create Guide' }}
          </button>
        </div>
      </form>
    </div>
  </div>
`,
  styles: [`
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.875rem;
    transition: all 0.2s;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
  }
  
  .breadcrumb-link:hover {
    color: var(--primary);
    background: rgba(99, 102, 241, 0.1);
  }
  
  .breadcrumb-divider {
    display: inline-flex;
    align-items: center;
    color: var(--text-muted);
  }
  
  .breadcrumb-current {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-main);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark, #7c3aed));
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px var(--primary);
  }
  
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
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
      this.guideService.updateGuide(this.guideId, this.guideForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error updating guide:', error);
          // Add user feedback here
        }
      });
    } else {
      this.guideService.addGuide(this.guideForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error creating guide:', error);
          // Add user feedback here
        }
      });
    }

  }

}
