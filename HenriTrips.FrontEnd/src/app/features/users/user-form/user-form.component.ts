// src/app/features/users/user-form/user-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { GuideService, Guide } from '../../../core/services/guide.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="breadcrumb slide-up">
      <a routerLink="/dashboard/users" class="breadcrumb-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Users
      </a>
      <div class="breadcrumb-divider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
      <span class="breadcrumb-current">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {{ isEditMode ? 'Edit User' : 'Create New User' }}
      </span>
    </div>

    <div class="form-container slide-up">
      <div class="glass-panel form-card">
        <h2 style="margin-bottom: 2rem;">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h2>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" formControlName="name" placeholder="E.g., Jane Doe" required>
            <div class="error-text" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
              Name is required and must be at least 3 characters.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" formControlName="email" placeholder="user@example.com" required>
            <div class="error-text" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
              Valid email address is required.
            </div>
          </div>

          <div class="form-group" *ngIf="!isEditMode">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="Min 6 characters" required>
            <div class="error-text" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
              Password is required and must be at least 6 characters.
            </div>
          </div>

          <div class="form-group" *ngIf="isEditMode">
            <label class="form-label">Password (Leave blank to keep unchanged)</label>
            <input type="password" class="form-control" formControlName="password" placeholder="Enter new password to change">
            <div class="helper-text" style="color: var(--text-muted); font-size: 0.8rem;">
              Only fill this if you want to change the password.
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ isEditMode ? 'Save Changes' : 'Create User' }}
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
      gap: 0.75rem;
      margin-bottom: 2rem;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.4);
      border-radius: var(--radius-md);
      backdrop-filter: blur(10px);
      border: 1px solid var(--surface-border);
      width: fit-content;
    }

    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.03);
    }

    .breadcrumb-link:hover {
      color: var(--primary);
      background: rgba(99, 102, 241, 0.1);
      transform: translateX(-4px);
    }

    .breadcrumb-link:hover svg {
      transform: translateX(-2px);
    }

    .breadcrumb-link svg {
      transition: transform 0.2s ease;
    }

    .breadcrumb-divider {
      color: var(--text-muted);
      opacity: 0.5;
      display: inline-flex;
      align-items: center;
    }

    .breadcrumb-current {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-main);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
      border-radius: var(--radius-sm);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .breadcrumb-current svg {
      color: var(--primary);
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

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

    .badge-primary {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
      color: #a5b4fc;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
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
  isLoading = false;

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    role: ['user', Validators.required],
    invitedGuideIds: [[] as string[]]
  });

  ngOnInit() {
    // Load available guides
    this.guideService.getGuides().subscribe({
      next: (guides) => {
        this.availableGuides = guides;
      },
      error: (error) => {
        console.error('Failed to load guides:', error);
        this.availableGuides = [];
      }
    });

    // Check if editing existing user
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        // IMPORTANT: Use getUserWithInvites to load user WITH their invited guides
        this.loadUserData(id);
      } else {
        // Create mode - password is required
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  private loadUserData(id: string) {
    this.isLoading = true;

    // FIXED: Use getUserWithInvites instead of getUserByIdFromApi
    // This loads both user info AND their invited guides from GuideUsers table
    this.userService.getUserWithInvites(id).subscribe({
      next: (user) => {
        console.log('Loaded user with invites:', user);
        console.log('Invited guide IDs from database:', user.invitedGuideIds);

        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          invitedGuideIds: user.invitedGuideIds || []  // This now has the guide IDs from database!
        });

        // Password not required for edit
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

        if (user.role === 'admin') {
          this.userForm.get('role')?.disable();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load user with invites:', error);
        this.isLoading = false;

        // Fallback: Try to load just basic user info
        this.userService.getUserByIdFromApi(id).subscribe({
          next: (user) => {
            this.userForm.patchValue({
              name: user.name,
              email: user.email,
              role: user.role,
              invitedGuideIds: []
            });
            this.userForm.get('password')?.clearValidators();
            if (user.role === 'admin') {
              this.userForm.get('role')?.disable();
            }
          },
          error: () => {
            this.router.navigate(['/dashboard/users']);
          }
        });
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
      if (!currentList.includes(guideId)) {
        currentList.push(guideId);
      }
    } else {
      const idx = currentList.indexOf(guideId);
      if (idx > -1) currentList.splice(idx, 1);
    }

    this.userForm.patchValue({ invitedGuideIds: currentList });
    this.userForm.get('invitedGuideIds')?.markAsDirty();
  }
  onSubmit() {
    if (this.userForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (this.isEditMode && this.userId) {
      // UPDATE MODE - Step 1: Update user basic info
      const updateData: Partial<User> = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role
      };

      const newPassword = formValue.password && formValue.password.trim() !== ''
        ? formValue.password
        : undefined;

      console.log('Step 1: Updating user basic info...', updateData);

      // Update user basic info (name, email, role, password)
      this.userService.updateUser(this.userId, updateData, newPassword).subscribe({
        next: (updatedUser) => {
          console.log('User basic info updated successfully:', updatedUser);

          // Step 2: Update guide invitations (THIS IS WHAT WAS MISSING!)
          const invitedGuideIds = formValue.invitedGuideIds || [];

          console.log('Step 2: Updating guide invitations for user:', this.userId);
          console.log('Guide IDs to save:', invitedGuideIds);

          // Only update invitations if user is not admin
          if (formValue.role !== 'admin') {
            // CALL THE FUNCTION THAT SAVES GUIDE INVITATIONS TO DATABASE
            this.userService.updateUserGuideInvitations(this.userId!, invitedGuideIds).subscribe({
              next: (result) => {
                console.log('Guide invitations saved successfully to GuideUsers table!', result);
                this.userService.refreshUsers();
                this.router.navigate(['/dashboard/users']);
              },
              error: (error) => {
                console.error('Failed to update guide invitations:', error);
                alert('User updated but guide invitations failed to save. Check console for details.');
                this.userService.refreshUsers();
                this.router.navigate(['/dashboard/users']);
              }
            });
          } else {
            // Admin users - clear any guide invitations
            console.log('Admin user - clearing guide invitations');
            this.userService.updateUserGuideInvitations(this.userId!, []).subscribe({
              next: () => {
                console.log('Cleared guide invitations for admin');
                this.userService.refreshUsers();
                this.router.navigate(['/dashboard/users']);
              },
              error: () => {
                this.userService.refreshUsers();
                this.router.navigate(['/dashboard/users']);
              }
            });
          }
        },
        error: (error) => {
          console.error('Failed to update user:', error);
          alert(`Failed to update user: ${error.message || 'Please try again.'}`);
        }
      });
    } else {
      // CREATE MODE
      const userData = {
        email: formValue.email,
        password: formValue.password,
        role: formValue.role === 'admin' ? 'Admin' : 'User'
      };

      console.log('Creating new user:', userData);

      this.userService.addUser(userData).subscribe({
        next: (response: any) => {
          console.log('User created successfully:', response);
          const newUserId = response.userId || response.id;

          // If user is not admin and has guide invitations, save them
          if (formValue.role !== 'admin' && formValue.invitedGuideIds?.length > 0 && newUserId) {
            console.log('Saving guide invitations for new user:', formValue.invitedGuideIds);

            this.userService.updateUserGuideInvitations(newUserId, formValue.invitedGuideIds).subscribe({
              next: () => {
                console.log('Guide invitations saved successfully');
                this.userService.refreshUsers();
                this.router.navigate(['/dashboard/users']);
              },
              error: (error) => {
                console.error('Failed to save guide invitations:', error);
                alert('User created but failed to save guide invitations.');
                this.userService.refreshUsers();
                this.router.navigate(['/dashboard/users']);
              }
            });
          } else {
            this.userService.refreshUsers();
            this.router.navigate(['/dashboard/users']);
          }
        },
        error: (error) => {
          console.error('Failed to create user:', error);
          let errorMessage = 'Failed to create user. ';
          if (error.error?.message) errorMessage += error.error.message;
          else if (error.error?.errors) {
            const errors = Object.values(error.error.errors).flat();
            errorMessage += errors.join(', ');
          }
          alert(errorMessage);
        }
      });
    }
  }
  //onSubmit() {
  //  if (this.userForm.invalid) {
  //    Object.keys(this.userForm.controls).forEach(key => {
  //      this.userForm.get(key)?.markAsTouched();
  //    });
  //    return;
  //  }

  //  const formValue = this.userForm.getRawValue();
  //  this.isLoading = true;

  //  if (this.isEditMode && this.userId) {
  //    // UPDATE MODE - Update user info AND guide invitations
  //    const updateData: Partial<User> = {
  //      name: formValue.name,
  //      email: formValue.email,
  //      role: formValue.role
  //    };

  //    const newPassword = formValue.password && formValue.password.trim() !== ''
  //      ? formValue.password
  //      : undefined;

  //    console.log('Updating user:', this.userId);
  //    console.log('Update data:', updateData);
  //    console.log('Guide IDs to save:', formValue.invitedGuideIds);

  //    // First update user basic info (name, email, role, password)
  //    this.userService.updateUser(this.userId, updateData, newPassword).subscribe({
  //      next: (updatedUser) => {
  //        console.log('User updated successfully:', updatedUser);

  //        // IMPORTANT: Then update guide invitations
  //        const invitedGuideIds = formValue.invitedGuideIds || [];

  //        // Only update invitations if user is not admin
  //        if (formValue.role !== 'admin') {
  //          console.log('Saving guide invitations to database:', invitedGuideIds);

  //          this.userService.updateUserGuideInvitations(this.userId!, invitedGuideIds).subscribe({
  //            next: (result) => {
  //              console.log('Guide invitations updated successfully in GuideUsers table:', result);
  //              this.userService.refreshUsers();
  //              this.router.navigate(['/dashboard/users']);
  //            },
  //            error: (error) => {
  //              console.error('Failed to update guide invitations:', error);
  //              alert('User updated but failed to update guide invitations. Check console for details.');
  //              this.userService.refreshUsers();
  //              this.router.navigate(['/dashboard/users']);
  //            }
  //          });
  //        } else {
  //          // Admin users - clear any existing guide invitations
  //          console.log('Admin user - clearing any guide invitations');
  //          this.userService.updateUserGuideInvitations(this.userId!, []).subscribe({
  //            next: () => {
  //              this.userService.refreshUsers();
  //              this.router.navigate(['/dashboard/users']);
  //            },
  //            error: () => {
  //              this.userService.refreshUsers();
  //              this.router.navigate(['/dashboard/users']);
  //            }
  //          });
  //        }
  //      },
  //      error: (error) => {
  //        console.error('Failed to update user:', error);
  //        this.isLoading = false;
  //        alert(`Failed to update user: ${error.message || 'Please try again.'}`);
  //      }
  //    });
  //  } else {
  //    // CREATE MODE
  //    const userData = {
  //      email: formValue.email,
  //      password: formValue.password,
  //      role: formValue.role === 'admin' ? 'Admin' : 'User'
  //    };

  //    console.log('Creating user:', userData);

  //    this.userService.addUser(userData).subscribe({
  //      next: (response: any) => {
  //        console.log('User created:', response);
  //        const newUserId = response.userId || response.id;

  //        // If user is not admin and has guide invitations, save them
  //        if (formValue.role !== 'admin' && formValue.invitedGuideIds?.length > 0 && newUserId) {
  //          console.log('Saving guide invitations for new user:', formValue.invitedGuideIds);

  //          this.userService.updateUserGuideInvitations(newUserId, formValue.invitedGuideIds).subscribe({
  //            next: () => {
  //              console.log('Guide invitations saved successfully');
  //              this.userService.refreshUsers();
  //              this.router.navigate(['/dashboard/users']);
  //            },
  //            error: (error) => {
  //              console.error('Failed to save guide invitations:', error);
  //              alert('User created but failed to save guide invitations.');
  //              this.userService.refreshUsers();
  //              this.router.navigate(['/dashboard/users']);
  //            }
  //          });
  //        } else {
  //          this.userService.refreshUsers();
  //          this.router.navigate(['/dashboard/users']);
  //        }
  //      },
  //      error: (error) => {
  //        console.error('Failed to create user:', error);
  //        this.isLoading = false;
  //        let errorMessage = 'Failed to create user. ';
  //        if (error.error?.message) errorMessage += error.error.message;
  //        else if (error.error?.errors) {
  //          const errors = Object.values(error.error.errors).flat();
  //          errorMessage += errors.join(', ');
  //        }
  //        alert(errorMessage);
  //      }
  //    });
  //  }
  //}
}

