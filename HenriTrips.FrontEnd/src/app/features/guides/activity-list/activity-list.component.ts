import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activities-timeline">
      <div *ngFor="let act of activities; let j = index" 
           class="activity-item fade-in" 
           [style.animation-delay]="j * 0.1 + 's'">
        
        <div class="activity-marker">
          <div class="marker-dot"></div>
          <div class="marker-line" *ngIf="j < activities.length - 1"></div>
        </div>
        
        <div class="glass-card activity-card">
          <div class="activity-card-content">
            <div class="activity-header">
              <h4>{{ act.title }}</h4>
              <span class="badge badge-warning">{{ act.category }}</span>
            </div>
            
            <p>{{ act.description }}</p>
            
            <div class="activity-meta">
              <div class="meta-item" *ngIf="act.address">
                <span class="material-symbols">location_on</span>
                {{ act.address }}
              </div>
              
              <div class="meta-item" *ngIf="act.website">
                <span class="material-symbols">language</span>
                <a [href]="act.website" target="_blank" rel="noopener noreferrer">Website</a>
              </div>
            </div>
          </div>
          
          <div class="admin-actions-vertical" *ngIf="auth.isAdmin()">
            <button class="btn-icon" title="Edit Activity" (click)="editActivity(act)">
              <span class="material-symbols">edit</span>
            </button>
            <button class="btn-icon text-danger" title="Delete Activity" (click)="deleteActivity(act)">
              <span class="material-symbols">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activities-timeline {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .activity-item {
      display: flex;
      gap: 1.5rem;
    }
    
    .activity-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 24px;
      padding-top: 1.5rem;
    }
    
    .marker-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
      z-index: 1;
    }
    
    .marker-line {
      width: 2px;
      flex: 1;
      background: var(--surface-border);
      margin-top: 0.5rem;
      margin-bottom: -2rem; /* Extend to next item */
    }
    
    .activity-card {
      flex: 1;
      display: flex;
      background: rgba(30, 41, 59, 0.4);
      overflow: hidden;
    }

    .activity-card-content {
      flex: 1;
      padding: 1.5rem;
    }

    .admin-actions-vertical {
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--surface-border);
      background: rgba(15, 23, 42, 0.2);
    }

    .btn-icon {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      padding: 1rem;
      transition: all 0.2s;
      border-bottom: 1px solid var(--surface-border);
    }
    
    .btn-icon:last-child {
      border-bottom: none;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }
    
    .btn-icon.text-danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }
    
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }
    
    .activity-header h4 {
      margin: 0;
      color: var(--text-main);
    }
    
    .activity-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .meta-item a {
      color: var(--primary);
      text-decoration: none;
    }
    
    .meta-item a:hover {
      text-decoration: underline;
    }
    
    .material-symbols {
      font-size: 1.25rem;
    }
    
    @media (max-width: 640px) {
      .activity-card { flex-direction: column; }
      .admin-actions-vertical { flex-direction: row; border-left: none; border-top: 1px solid var(--surface-border); }
      .btn-icon { border-bottom: none; border-right: 1px solid var(--surface-border); }
      .btn-icon:last-child { border-right: none; }
    }
  `]
})
export class ActivityListComponent {
  auth = inject(AuthService);
  
  @Input() activities: Activity[] = [];
  @Output() edit = new EventEmitter<Activity>();
  @Output() delete = new EventEmitter<Activity>();

  editActivity(act: Activity) {
    this.edit.emit(act);
  }

  deleteActivity(act: Activity) {
    if (confirm(`Are you sure you want to delete '${act.title}'?`)) {
      this.delete.emit(act);
    }
  }
}
