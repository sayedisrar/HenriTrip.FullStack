import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivityService, Activity } from '../../../core/services/activity.service';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card slide-up activity-form-container">
      <h3>{{ activityToEdit ? 'Edit Activity' : 'Add New Activity' }}</h3>
      
      <form [formGroup]="activityForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label">Title</label>
            <input type="text" class="form-control" formControlName="title" required>
          </div>
          
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Category</label>
            <select class="form-control" formControlName="category" required>
              <option value="museum">Museum</option>
              <option value="castle">Castle</option>
              <option value="activity">Activity</option>
              <option value="park">Park</option>
              <option value="cave">Cave</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-control" formControlName="description" rows="3" required></textarea>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Address (Optional)</label>
            <input type="text" class="form-control" formControlName="address">
          </div>
          
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Website (Optional)</label>
            <input type="url" class="form-control" formControlName="website">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline btn-sm" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" [disabled]="activityForm.invalid">
            {{ activityToEdit ? 'Update' : 'Add' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .activity-form-container {
      padding: 1.5rem;
      margin-top: 1rem;
      border: 1px solid var(--primary);
      background: rgba(99, 102, 241, 0.05); /* subtle highlight */
    }
    .activity-form-container h3 {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      color: var(--primary);
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--surface-border);
    }
    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class ActivityFormComponent implements OnInit {
  @Input() guideId!: string;
  @Input() dayNumber!: number;
  @Input() activityToEdit: Activity | null = null;
  @Output() formClosed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private activityService = inject(ActivityService);

  activityForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['activity', Validators.required],
    address: [''],
    website: ['']
  });

  ngOnInit() {
    if (this.activityToEdit) {
      this.activityForm.patchValue(this.activityToEdit);
    }
  }

  onSubmit() {
    if (this.activityForm.invalid) return;

    if (this.activityToEdit) {
      this.activityService.updateActivity(this.activityToEdit.id, this.activityForm.value);
    } else {
      this.activityService.addActivity({
        ...this.activityForm.value,
        guideId: this.guideId,
        dayNumber: this.dayNumber,
        order: 99 // Placeholder sorting logic
      });
    }

    this.formClosed.emit();
  }

  onCancel() {
    this.formClosed.emit();
  }
}
