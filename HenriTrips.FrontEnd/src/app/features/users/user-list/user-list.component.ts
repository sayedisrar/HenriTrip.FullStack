import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-list-header slide-up">
      <div>
        <h1 style="margin-bottom: 0.5rem;">User Management</h1>
        <p>Manage application access, user roles, and guide invitations.</p>
      </div>
      
      <a routerLink="/dashboard/users/new" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        Add New User
      </a>
    </div>

    <div class="glass-panel slide-up" style="animation-delay: 0.1s; overflow: hidden;">
      <div class="table-responsive">
        <table class="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>System Role</th>
              <th>Accessible Guides</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of userService.getUsers()">
              <td>
                <div class="user-info">
                  <div class="avatar" [style.background]="getAvatarColor(user.name)">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="user-name">{{ user.name }}</div>
                    
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" [ngClass]="user.role === 'admin' ? 'badge-primary' : 'badge-success'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  {{ user.role | titlecase }}
                </span>
              </td>
              <td>
                <span class="badge badge-warning" *ngIf="user.role === 'admin'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  All Guides
                </span>
                <span *ngIf="user.role === 'user'" class="guide-count">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  {{ user.invitedGuideIds.length || 0 }} Guide{{ (user.invitedGuideIds.length !== 1) ? 's' : '' }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <a [routerLink]="['/dashboard/users', user.id, 'edit']" class="btn-icon btn-edit" title="Edit User">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
                      <path d="M4 20h16"/>
                    </svg>
                  </a>
                  <button class="btn-icon btn-delete" 
                          (click)="deleteUser(user)" 
                          [disabled]="isDeleting === user.id || user.role === 'admin'"
                          title="Delete User">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" *ngIf="isDeleting !== user.id">
                      <path d="M4 7h16"/>
                      <path d="M10 11v6"/>
                      <path d="M14 11v6"/>
                      <path d="M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
                      <path d="M9 3h6"/>
                    </svg>
                    <div class="spinner" *ngIf="isDeleting === user.id"></div>
                  </button>
                </div>
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
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px var(--primary);
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
    
    .user-id {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-family: monospace;
    }
    
    .text-right {
      text-align: right;
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
export class UserListComponent {
  userService = inject(UserService);
  isDeleting: string | null = null;

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
      alert('Cannot delete admin users');
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      this.isDeleting = user.id;

      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('User deleted successfully:', response);
          this.isDeleting = null;
          this.userService.refreshUsers();
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
          alert(errorMessage);
        }
      });
    }
  }
}
