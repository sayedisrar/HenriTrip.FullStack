import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../../../core/services/user.service';

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
        <span class="material-symbols">person_add</span> Add New User
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
                  <div class="avatar">{{ user.name.charAt(0) }}</div>
                  <div>
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-id">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" [ngClass]="user.role === 'admin' ? 'badge-primary' : 'badge-success'">
                  {{ user.role | titlecase }}
                </span>
              </td>
              <td>
                <span class="badge badge-warning" *ngIf="user.role === 'admin'">All Guides</span>
                <span *ngIf="user.role === 'user'">{{ user.invitedGuideIds.length || 0 }} Guides</span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <a [routerLink]="['/dashboard/users', user.id, 'edit']" class="btn-icon">
                    <span class="material-symbols">edit</span>
                  </a>
                  <button class="btn-icon text-danger" (click)="deleteUser(user)" [disabled]="user.role === 'admin'">
                    <span class="material-symbols">delete</span>
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
      border-radius: 50%;
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
    }
    
    .user-id {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    
    .text-right {
      text-align: right;
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    
    .btn-icon {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      display: inline-flex;
    }
    
    .btn-icon:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
    }
    
    .btn-icon.text-danger:hover:not(:disabled) {
      color: var(--danger);
      background: rgba(239, 68, 68, 0.1);
    }
    
    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class UserListComponent {
  userService = inject(UserService);

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id);
    }
  }
}
