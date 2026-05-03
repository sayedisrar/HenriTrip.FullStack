import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
 template: `
  <!-- Header -->
  <div class="user-list-header slide-up">
    <div>
      <h1 style="margin-bottom: 0.5rem;">User Management</h1>
      <p>Manage application access, user roles, and guide invitations.</p>
    </div>

    <a routerLink="/dashboard/users/new" class="btn btn-primary">
      Add New User
    </a>
  </div>

  <!-- Loading -->
  <div *ngIf="isLoading" class="glass-panel loading-state">
    <div class="spinner"></div>
    <p>Loading users...</p>
  </div>

  <!-- Table -->
  <div *ngIf="!isLoading" class="glass-panel slide-up" style="animation-delay: 0.1s; overflow: hidden;">
    <div class="table-responsive">

      <table class="user-table">

        <!-- Header -->
        <thead>
          <tr>
            <th>Name</th>
            <th>System Role</th>
            <th>Accessible Guides</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>

          <!-- User Row -->
          <tr *ngFor="let user of users">

            <!-- Name -->
            <td>
              <div class="user-info">
                <div class="avatar" [style.background]="getAvatarColor(user.name)">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </td>

            <!-- Role -->
            <td>
              <span class="badge"
                    [ngClass]="user.role === 'admin' ? 'badge-primary' : 'badge-success'">
                {{ user.role | titlecase }}
              </span>
            </td>

            <!-- Guides -->
            <td>
              <span *ngIf="user.role === 'admin'" class="badge badge-warning">
                All Guides
              </span>

              <span *ngIf="user.role === 'user'" class="guide-count">
                {{ user.invitedGuideIds.length }}
                Guide{{ user.invitedGuideIds.length !== 1 ? 's' : '' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="text-right">
              <div class="action-buttons">

                <a [routerLink]="['/dashboard/users', user.id, 'edit']"
                   class="btn-icon btn-edit"
                   title="Edit User">
                  ✏️
                </a>

                <button class="btn-icon btn-delete"
                        (click)="deleteUser(user)"
                        [disabled]="isDeleting === user.id || user.role === 'admin'"
                        title="Delete User">

                  <span *ngIf="isDeleting !== user.id">🗑️</span>
                  <span *ngIf="isDeleting === user.id" class="spinner"></span>

                </button>

              </div>
            </td>

          </tr>

          <!-- Empty State -->
          <tr *ngIf="users.length === 0">
            <td colspan="4" class="text-center" style="padding: 3rem;">
              No users found.
            </td>
          </tr>

        </tbody>

      </table>

    </div>
  </div>
`,
  styles: [`
    .user-list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
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
      text-decoration: none;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px var(--primary);
    }

    .loading-state {
      padding: 4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .table-responsive {
      overflow-x: auto;
    }
    
    .user-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    
    .user-table th, .user-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--surface-border);
    }
    
    .user-table th {
      font-weight: 500;
      color: var(--text-muted);
      font-size: 0.875rem;
      background: rgba(15, 23, 42, 0.4);
    }
    
    .user-table tr:last-child td {
      border-bottom: none;
    }
    
    .user-table tbody tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--french-violet, #a855f7));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 1.25rem;
      text-transform: uppercase;
    }
    
    .user-name {
      font-weight: 500;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-primary {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    
    .badge-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .badge-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 146, 60, 0.2));
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      display: inline-flex;
      align-items: center;
    }
    
    .guide-count {
      display: inline-flex;
      align-items: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }
    
    .btn-edit {
      color: #60a5fa;
    }
    
    .btn-edit:hover {
      background: rgba(96, 165, 250, 0.1);
      transform: scale(1.1);
    }
    
    .btn-delete {
      color: #f87171;
    }
    
    .btn-delete:hover:not(:disabled) {
      background: rgba(248, 113, 113, 0.1);
      transform: scale(1.1);
    }
    
    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(248, 113, 113, 0.3);
      border-radius: 50%;
      border-top-color: #f87171;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class UserListComponent implements OnInit {
  userService = inject(UserService);
  private toast = inject(ToastService);
  users: User[] = [];
  isLoading = true;
  isDeleting: string | null = null;

  ngOnInit() {
    // Get initial users
    this.users = this.userService.getUsers();
    
    // If users are already loaded in the service, use them
    if (this.users.length > 0) {
      this.isLoading = false;
    }
    
    // Load users from API (the service will update the signal)
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users loaded from API:', users);
        // The service already has these users, but we need to fetch guide counts
        // The service's loadUsers() method handles guide counts automatically
        this.userService.loadUsers();
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.isLoading = false;
      }
    });
    
    // Poll for user updates (guide counts are loaded asynchronously)
    const checkUsers = setInterval(() => {
      const updatedUsers = this.userService.getUsers();
      if (updatedUsers.length > 0 && updatedUsers[0].invitedGuideIds !== undefined) {
        this.users = updatedUsers;
        this.isLoading = false;
        clearInterval(checkUsers);
      } else if (updatedUsers.length > 0 && this.users.length === 0) {
        this.users = updatedUsers;
      }
    }, 500);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkUsers);
      this.isLoading = false;
    }, 5000);
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #a855f7)',
      'linear-gradient(135deg, #06b6d4, #3b82f6)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #f59e0b, #f97316)',
      'linear-gradient(135deg, #ef4444, #ec4899)',
      'linear-gradient(135deg, #8b5cf6, #d946ef)'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  deleteUser(user: User) {
    if (user.role === 'admin') {
      this.toast.showWarning('Cannot delete admin users', 'Admin Protection');
      return;
    }

    this.toast.showConfirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`, 'Delete User').then((confirmed) => {
      if (confirmed) {
        this.isDeleting = user.id;

        this.userService.deleteUser(user.id).subscribe({
          next: (response) => {
            console.log('User deleted successfully:', response);
            this.isDeleting = null;
            // Reload users after delete
            this.userService.getAllUsers().subscribe({
              next: (users) => {
                this.userService.loadUsers();
                setTimeout(() => {
                  this.users = this.userService.getUsers();
                }, 1000);
              }
            });
          },
          error: (error) => {
            console.error('Failed to delete user:', error);
            this.isDeleting = null;

            let errorMessage = 'Failed to delete user. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else if (error.message) {
              errorMessage += error.message;
            }
            this.toast.showError(errorMessage, 'Delete Failed');
          }
        });
      }
    });
  }
}