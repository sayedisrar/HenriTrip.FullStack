import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService, User } from '../../../../../core/services/user.service';
import { GuideService, Guide } from '../../../../../core/services/guide.service';


@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="breadcrumb slide-up">
      <a routerLink="/dashboard/users" class="btn btn-outline btn-sm">
        <span class="material-symbols">arrow_back</span> Back to UsersAA
      </a>
    </div>

    <div class="form-container slide-up">
      <div class="glass-panel form-card">
        <h2 style="margin-bottom: 2rem;">{{ isEditMode ? 'Edit User' : 'Create New UserA' }}</h2>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" formControlName="name" placeholder="E.g., Jane Doe" required>
            <div class="error-text" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
              Name is required and must be at least 3 characters.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">System Role</label>
            <select class="form-control" formControlName="role">
              <option value="user">Regular User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div class="form-group" *ngIf="userForm.get('role')?.value === 'user'">
            <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
              <span>Guide Access (Invitations)</span>
              <span class="badge badge-primary">{{ availableGuides.length }} Available</span>
            </label>
            
            <div class="guides-permissions glass-card">
              <div *ngIf="availableGuides.length === 0" style="padding: 1rem; color: var(--text-muted); text-align: center;">
                No guides exist in the system yet.
              </div>
              
              <label class="checkbox-container" *ngFor="let guide of availableGuides">
                <input type="checkbox" [checked]="isGuideSelected(guide.id)" (change)="toggleGuide(guide.id, $event)">
                <span class="checkmark"></span>
                <div class="guide-info">
                  <strong>{{ guide.title }}</strong>
                  <span>{{ guide.days }} Days • {{ guide.targetAudience.join(', ') | titlecase }}</span>
                </div>
              </label>
            </div>
            <p class="helper-text" style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
              Select the guides this user will be able to view. Admins automatically see all guides.
            </p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid">
              <span class="material-symbols">save</span>
              {{ isEditMode ? 'Save Changes' : 'Create User' }}
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
      max-width: 600px;
      margin: 0 auto;
    }
    
    .form-card {
      padding: 2.5rem;
    }
    
    .error-text {
      color: var(--danger);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .guides-permissions {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.4);
    }
    
    /* Custom Checkbox implementation */
    .checkbox-container {
      display: flex;
      align-items: flex-start;
      position: relative;
      padding: 1rem 1rem 1rem 3rem;
      cursor: pointer;
      font-size: 1rem;
      border-bottom: 1px solid var(--surface-border);
      transition: background 0.2s;
    }
    .checkbox-container:last-child {
      border-bottom: none;
    }
    .checkbox-container:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    
    .checkmark {
      position: absolute;
      top: 1.25rem;
      left: 1rem;
      height: 20px;
      width: 20px;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .checkbox-container:hover input ~ .checkmark {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .checkbox-container input:checked ~ .checkmark {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }
    
    .guide-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .guide-info span {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
    }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private guideService = inject(GuideService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  userId: string | null = null;
  availableGuides: Guide[] = [];
  
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    role: ['user', Validators.required],
    invitedGuideIds: [[] as string[]] // Store array directly
  });

  ngOnInit() {
    // We fetch all guides blindly because Admin is using this form
    this.guideService.getGuides().subscribe(guides => {
      this.availableGuides = guides;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        const user = this.userService.getUserById(id);
        if (user) {
          this.userForm.patchValue({
            name: user.name,
            role: user.role,
            invitedGuideIds: user.invitedGuideIds || []
          });
          
          if (user.role === 'admin') {
            this.userForm.get('role')?.disable(); // Prevent demoting the only admin easily
          }
        } else {
          this.router.navigate(['/dashboard/users']);
        }
      }
    });
  }

  isGuideSelected(guideId: string): boolean {
    const currentList = this.userForm.get('invitedGuideIds')?.value || [];
    return currentList.includes(guideId);
  }

  toggleGuide(guideId: string, event: any) {
    const isChecked = event.target.checked;
    const currentList: string[] = [...(this.userForm.get('invitedGuideIds')?.value || [])];
    
    if (isChecked) {
       currentList.push(guideId);
    } else {
       const idx = currentList.indexOf(guideId);
       if (idx > -1) currentList.splice(idx, 1);
    }
    
    this.userForm.patchValue({ invitedGuideIds: currentList });
    this.userForm.get('invitedGuideIds')?.markAsDirty();
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    // Reactivate form controls if disabled previously
    const rawValue = this.userForm.getRawValue();

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, rawValue);
    } else {
      this.userService.addUser(rawValue);
    }

    this.router.navigate(['/dashboard/users']);
  }
}
