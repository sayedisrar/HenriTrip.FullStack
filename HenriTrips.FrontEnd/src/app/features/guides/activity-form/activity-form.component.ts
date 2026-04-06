// \app\features\guides\activity-form\activity-form.component.ts
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
      <div class="form-header">
        <h3>{{ activityToEdit ? '✏️ Edit Activity' : '➕ Add New Activity' }}</h3>
        <button type="button" class="close-btn" (click)="onCancel()">×</button>
      </div>
      
      <form [formGroup]="activityForm" (ngSubmit)="onSubmit()">
        <!-- Title & Category Row -->
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label">Title *</label>
            <input type="text" class="form-control" formControlName="title" placeholder="E.g., Louvre Museum" required>
            <div class="error-text" *ngIf="activityForm.get('title')?.invalid && activityForm.get('title')?.touched">
              Title is required
            </div>
          </div>
          
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Category *</label>
            <select class="form-control" formControlName="category" required>
              <option value="" disabled>Select Category</option>
              <option value="museum">🏛️ Museum</option>
              <option value="castle">🏰 Castle</option>
              <option value="activity">🎯 Activity</option>
              <option value="park">🌳 Park</option>
              <option value="cave">🪨 Cave</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description *</label>
          <textarea class="form-control" formControlName="description" rows="3" 
                    placeholder="Describe what makes this place special..." required></textarea>
          <div class="error-text" *ngIf="activityForm.get('description')?.invalid && activityForm.get('description')?.touched">
            Description is required
          </div>
        </div>

        <!-- Address -->
        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" class="form-control" formControlName="address" 
                 placeholder="Full address for navigation">
        </div>

        <!-- Phone & Opening Hours Row -->
        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Phone</label>
            <input type="tel" class="form-control" formControlName="phone" 
                   placeholder="+33 1 23 45 67 89">
          </div>
          
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Opening Hours</label>
            <input type="text" class="form-control" formControlName="openingHours" 
                   placeholder="Mon-Sun: 9:00-18:00">
          </div>
        </div>

        <!-- Website & Order Row -->
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label">Website</label>
            <input type="url" class="form-control" formControlName="website" 
                   placeholder="https://example.com">
          </div>
          
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Visit Order *</label>
            <input type="number" class="form-control" formControlName="order" 
                   min="1" max="99" required>
            <div class="error-text" *ngIf="activityForm.get('order')?.invalid && activityForm.get('order')?.touched">
              Order is required (1-99)
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="onCancel()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="activityForm.invalid || isSubmitting">
            <span class="spinner" *ngIf="isSubmitting"></span>
            <span *ngIf="!isSubmitting">{{ activityToEdit ? 'Update Activity' : 'Add Activity' }}</span>
            <span *ngIf="isSubmitting">Saving...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .activity-form-container {
      padding: 1.5rem;
      margin-top: 1rem;
      border: 1px solid rgba(99, 102, 241, 0.3);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-md);
    }
    
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }
    
    .form-header h3 {
      font-size: 1.1rem;
      color: var(--primary);
      margin: 0;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0 0.5rem;
      transition: color 0.2s;
    }
    
    .close-btn:hover {
      color: var(--danger);
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0;
    }
    
    .form-group {
      margin-bottom: 1rem;
      flex: 1;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #000000;   
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 0.875rem;
  transition: all 0.2s;
}
    select.form-control option {
  background: #000000;   
  color: var(--text-main);
}
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    select.form-control {
      cursor: pointer;
    }
    
    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }
    
    .error-text {
      color: var(--danger, #ef4444);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }
    
    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark, #7c3aed));
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px var(--primary);
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid var(--surface-border);
      color: var(--text-muted);
    }
    
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.6s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 640px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ActivityFormComponent implements OnInit {
  @Input() guideId!: string;
  @Input() dayNumber!: number;
  @Input() activityToEdit: Activity | null = null;

  @Output() formClosed = new EventEmitter<{ success?: boolean }>();

  private fb = inject(FormBuilder);
  private activityService = inject(ActivityService);

  isSubmitting = false;

  activityForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['', Validators.required],  // Changed: removed default 'activity'
    address: [''],
    phone: [''],
    openingHours: [''],
    website: ['', Validators.pattern('https?://.+')],
    order: [1, [Validators.required, Validators.min(1), Validators.max(99)]]
  });

  ngOnInit() {
    console.log('ActivityFormComponent - activityToEdit:', this.activityToEdit);

    if (this.activityToEdit) {
      // FIXED: Make sure category value is set correctly
      const categoryValue = this.activityToEdit.category;
      console.log('Setting category to:', categoryValue);

      this.activityForm.patchValue({
        title: this.activityToEdit.title,
        description: this.activityToEdit.description,
        category: categoryValue,  // This should be 'museum', 'castle', etc.
        address: this.activityToEdit.address || '',
        phone: this.activityToEdit.phone || '',
        openingHours: this.activityToEdit.openingHours || '',
        website: this.activityToEdit.website || '',
        order: this.activityToEdit.order
      });

      // Debug: Log the form value after patch
      console.log('Form value after patch:', this.activityForm.value);
    }
  }

  onSubmit() {
    if (this.activityForm.invalid) {
      Object.keys(this.activityForm.controls).forEach(key => {
        this.activityForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.activityForm.value;
    console.log('Submitting form values:', formValue);

    if (this.activityToEdit) {
      // UPDATE EXISTING ACTIVITY
      this.activityService.updateActivity(this.activityToEdit.id, {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        address: formValue.address,
        phone: formValue.phone,
        openingHours: formValue.openingHours,
        website: formValue.website,
        order: formValue.order,
        day: this.dayNumber
      }).subscribe({
        next: (updatedActivity) => {
          console.log('Activity updated successfully:', updatedActivity);
          this.isSubmitting = false;
          this.formClosed.emit({ success: true });
        },
        error: (error) => {
          console.error('Failed to update activity:', error);
          this.isSubmitting = false;
          alert(`Failed to update activity: ${error.error?.message || error.message}`);
        }
      });
    } else {
      // CREATE NEW ACTIVITY
      this.activityService.addActivity({
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        address: formValue.address || '',
        phone: formValue.phone || '',
        openingHours: formValue.openingHours || '',
        website: formValue.website || '',
        order: formValue.order,
        day: this.dayNumber,
        guideId: parseInt(this.guideId, 10)
      }).subscribe({
        next: (createdActivity) => {
          console.log('Activity created successfully:', createdActivity);
          this.isSubmitting = false;
          this.formClosed.emit({ success: true });
        },
        error: (error) => {
          console.error('Failed to create activity:', error);
          this.isSubmitting = false;
          alert(`Failed to create activity: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  onCancel() {
    this.formClosed.emit({ success: false });
  }
}

//import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
//import { ActivityService, Activity } from '../../../core/services/activity.service';

//@Component({
//  selector: 'app-activity-form',
//  standalone: true,
//  imports: [CommonModule, ReactiveFormsModule],
//  template: `
//    <div class="glass-card slide-up activity-form-container">
//      <div class="form-header">
//        <h3>{{ activityToEdit ? '✏️ Edit Activity' : '➕ Add New Activity' }}</h3>
//        <button type="button" class="close-btn" (click)="onCancel()">×</button>
//      </div>
      
//      <form [formGroup]="activityForm" (ngSubmit)="onSubmit()">
//        <!-- Title & Category Row -->
//        <div class="form-row">
//          <div class="form-group" style="flex: 2;">
//            <label class="form-label">Title *</label>
//            <input type="text" class="form-control" formControlName="title" placeholder="E.g., Louvre Museum" required>
//            <div class="error-text" *ngIf="activityForm.get('title')?.invalid && activityForm.get('title')?.touched">
//              Title is required
//            </div>
//          </div>
          
//          <div class="form-group" style="flex: 1;">
//            <label class="form-label">Category *</label>
//            <select class="form-control" formControlName="category" required>
//              <option value="museum">🏛️ Museum</option>
//              <option value="castle">🏰 Castle</option>
//              <option value="activity">🎯 Activity</option>
//              <option value="park">🌳 Park</option>
//              <option value="cave">🪨 Cave</option>
//            </select>
//          </div>
//        </div>

//        <!-- Description -->
//        <div class="form-group">
//          <label class="form-label">Description *</label>
//          <textarea class="form-control" formControlName="description" rows="3" 
//                    placeholder="Describe what makes this place special..." required></textarea>
//          <div class="error-text" *ngIf="activityForm.get('description')?.invalid && activityForm.get('description')?.touched">
//            Description is required
//          </div>
//        </div>

//        <!-- Address -->
//        <div class="form-group">
//          <label class="form-label">Address</label>
//          <input type="text" class="form-control" formControlName="address" 
//                 placeholder="Full address for navigation">
//        </div>

//        <!-- Phone & Opening Hours Row -->
//        <div class="form-row">
//          <div class="form-group" style="flex: 1;">
//            <label class="form-label">Phone</label>
//            <input type="tel" class="form-control" formControlName="phone" 
//                   placeholder="+33 1 23 45 67 89">
//          </div>
          
//          <div class="form-group" style="flex: 1;">
//            <label class="form-label">Opening Hours</label>
//            <input type="text" class="form-control" formControlName="openingHours" 
//                   placeholder="Mon-Sun: 9:00-18:00">
//          </div>
//        </div>

//        <!-- Website & Order Row -->
//        <div class="form-row">
//          <div class="form-group" style="flex: 2;">
//            <label class="form-label">Website</label>
//            <input type="url" class="form-control" formControlName="website" 
//                   placeholder="https://example.com">
//          </div>
          
//          <div class="form-group" style="flex: 1;">
//            <label class="form-label">Visit Order *</label>
//            <input type="number" class="form-control" formControlName="order" 
//                   min="1" max="99" required>
//            <div class="error-text" *ngIf="activityForm.get('order')?.invalid && activityForm.get('order')?.touched">
//              Order is required (1-99)
//            </div>
//          </div>
//        </div>

//        <!-- Form Actions -->
//        <div class="form-actions">
//          <button type="button" class="btn btn-outline" (click)="onCancel()">
//            Cancel
//          </button>
//          <button type="submit" class="btn btn-primary" [disabled]="activityForm.invalid || isSubmitting">
//            <span class="spinner" *ngIf="isSubmitting"></span>
//            <span *ngIf="!isSubmitting">{{ activityToEdit ? 'Update Activity' : 'Add Activity' }}</span>
//            <span *ngIf="isSubmitting">Saving...</span>
//          </button>
//        </div>
//      </form>
//    </div>
//  `,
//  styles: [`
//    .activity-form-container {
//      padding: 1.5rem;
//      margin-top: 1rem;
//      border: 1px solid rgba(99, 102, 241, 0.3);
//      background: rgba(15, 23, 42, 0.6);
//      backdrop-filter: blur(10px);
//      border-radius: var(--radius-md);
//    }
    
//    .form-header {
//      display: flex;
//      justify-content: space-between;
//      align-items: center;
//      margin-bottom: 1.5rem;
//      padding-bottom: 1rem;
//      border-bottom: 1px solid var(--surface-border);
//    }
    
//    .form-header h3 {
//      font-size: 1.1rem;
//      color: var(--primary);
//      margin: 0;
//    }
    
//    .close-btn {
//      background: none;
//      border: none;
//      color: var(--text-muted);
//      font-size: 1.5rem;
//      cursor: pointer;
//      padding: 0 0.5rem;
//      transition: color 0.2s;
//    }
    
//    .close-btn:hover {
//      color: var(--danger);
//    }
    
//    .form-row {
//      display: flex;
//      gap: 1rem;
//      margin-bottom: 0;
//    }
    
//    .form-group {
//      margin-bottom: 1rem;
//      flex: 1;
//    }
    
//    .form-label {
//      display: block;
//      margin-bottom: 0.5rem;
//      font-weight: 500;
//      color: var(--text-muted);
//      font-size: 0.875rem;
//    }
    
//    .form-control {
//      width: 100%;
//      padding: 0.75rem 1rem;
//      background: rgba(0, 0, 0, 0.3);
//      border: 1px solid var(--surface-border);
//      border-radius: var(--radius-md);
//      color: var(--text-main);
//      font-size: 0.875rem;
//      transition: all 0.2s;
//    }
    
//    .form-control:focus {
//      outline: none;
//      border-color: var(--primary);
//      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
//    }
    
//    textarea.form-control {
//      resize: vertical;
//      font-family: inherit;
//    }
    
//    .error-text {
//      color: var(--danger, #ef4444);
//      font-size: 0.75rem;
//      margin-top: 0.5rem;
//    }
    
//    .form-actions {
//      display: flex;
//      justify-content: flex-end;
//      gap: 1rem;
//      margin-top: 1.5rem;
//      padding-top: 1rem;
//      border-top: 1px solid var(--surface-border);
//    }
    
//    .btn {
//      padding: 0.6rem 1.2rem;
//      border-radius: var(--radius-md);
//      font-weight: 500;
//      cursor: pointer;
//      transition: all 0.2s;
//      border: none;
//    }
    
//    .btn-primary {
//      background: linear-gradient(135deg, var(--primary), var(--primary-dark, #7c3aed));
//      color: white;
//    }
    
//    .btn-primary:hover:not(:disabled) {
//      transform: translateY(-2px);
//      box-shadow: 0 10px 20px -10px var(--primary);
//    }
    
//    .btn-outline {
//      background: transparent;
//      border: 1px solid var(--surface-border);
//      color: var(--text-muted);
//    }
    
//    .btn-outline:hover {
//      background: rgba(255, 255, 255, 0.05);
//      color: var(--text-main);
//    }
    
//    .btn:disabled {
//      opacity: 0.6;
//      cursor: not-allowed;
//    }
    
//    .spinner {
//      display: inline-block;
//      width: 16px;
//      height: 16px;
//      border: 2px solid rgba(255, 255, 255, 0.3);
//      border-radius: 50%;
//      border-top-color: white;
//      animation: spin 0.6s linear infinite;
//      margin-right: 8px;
//    }
    
//    @keyframes spin {
//      to { transform: rotate(360deg); }
//    }
    
//    @media (max-width: 640px) {
//      .form-row {
//        flex-direction: column;
//        gap: 0;
//      }
//    }
//  `]
//})
//export class ActivityFormComponent implements OnInit {
//  @Input() guideId!: string;
//  @Input() dayNumber!: number;
//  @Input() activityToEdit: Activity | null = null;

//  @Output() formClosed = new EventEmitter<{ success?: boolean }>();

//  private fb = inject(FormBuilder);
//  private activityService = inject(ActivityService);

//  isSubmitting = false;

//  activityForm: FormGroup = this.fb.group({
//    title: ['', [Validators.required, Validators.minLength(3)]],
//    description: ['', [Validators.required, Validators.minLength(10)]],
//    category: ['activity', Validators.required],
//    address: [''],
//    phone: [''],           // NEW FIELD
//    openingHours: [''],    // NEW FIELD (maps to backend 'schedule')
//    website: ['', Validators.pattern('https?://.+')],
//    order: [1, [Validators.required, Validators.min(1), Validators.max(99)]]  // NEW FIELD
//  });

//  ngOnInit() {
//    if (this.activityToEdit) {
//      this.activityForm.patchValue({
//        title: this.activityToEdit.title,
//        description: this.activityToEdit.description,
//        category: this.activityToEdit.category,
//        address: this.activityToEdit.address || '',
//        phone: this.activityToEdit.phone || '',
//        openingHours: this.activityToEdit.openingHours || '',
//        website: this.activityToEdit.website || '',
//        order: this.activityToEdit.order
//      });
//    }
//  }

//  onSubmit() {
//    if (this.activityForm.invalid) {
//      Object.keys(this.activityForm.controls).forEach(key => {
//        this.activityForm.get(key)?.markAsTouched();
//      });
//      return;
//    }

//    this.isSubmitting = true;
//    const formValue = this.activityForm.value;

//    if (this.activityToEdit) {
//      // UPDATE EXISTING ACTIVITY
//      this.activityService.updateActivity(this.activityToEdit.id, {
//        title: formValue.title,
//        description: formValue.description,
//        category: formValue.category,
//        address: formValue.address,
//        phone: formValue.phone,
//        openingHours: formValue.openingHours,
//        website: formValue.website,
//        order: formValue.order,
//        day: this.dayNumber
//      }).subscribe({
//        next: (updatedActivity) => {
//          console.log('Activity updated successfully:', updatedActivity);
//          this.isSubmitting = false;
//          this.formClosed.emit({ success: true });
//        },
//        error: (error) => {
//          console.error('Failed to update activity:', error);
//          this.isSubmitting = false;
//          alert(`Failed to update activity: ${error.error?.message || error.message}`);
//        }
//      });
//    } else {
//      // CREATE NEW ACTIVITY
//      this.activityService.addActivity({
//        title: formValue.title,
//        description: formValue.description,
//        category: formValue.category,
//        address: formValue.address || '',
//        phone: formValue.phone || '',
//        openingHours: formValue.openingHours || '',
//        website: formValue.website || '',
//        order: formValue.order,
//        day: this.dayNumber,
//        guideId: parseInt(this.guideId, 10)
//      }).subscribe({
//        next: (createdActivity) => {
//          console.log('Activity created successfully:', createdActivity);
//          this.isSubmitting = false;
//          this.formClosed.emit({ success: true });
//        },
//        error: (error) => {
//          console.error('Failed to create activity:', error);
//          this.isSubmitting = false;
//          alert(`Failed to create activity: ${error.error?.message || error.message}`);
//        }
//      });
//    }
//  }

//  onCancel() {
//    this.formClosed.emit({ success: false });
//  }
//}

