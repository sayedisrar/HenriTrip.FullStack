// \app\features\guides\activity-list\activity-list.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activities-container">
      <div *ngFor="let act of activities; let j = index" 
           class="activity-card-modern" 
           [style.animation-delay]="j * 0.05 + 's'">
        
        <!-- Card Header with Order Badge -->
        <div class="card-header">
          <div class="order-badge">
            <span class="order-number">{{ act.order }}</span>
          </div>
          <div class="header-content">
            <h3 class="activity-title">{{ act.title }}</h3>
            <span class="category-tag" [ngClass]="getCategoryClass(act.category)">
              {{ getCategoryIcon(act.category) }} {{ act.category | titlecase }}
            </span>
          </div>
        </div>

        <!-- Description Section -->
        <div class="description-section">
          <p class="activity-description">{{ act.description }}</p>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
          <div class="detail-item" *ngIf="act.address">
            <div class="detail-icon location">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Location</span>
              <span class="detail-value">{{ act.address }}</span>
            </div>
          </div>

          <div class="detail-item" *ngIf="act.phone">
            <div class="detail-icon phone">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Phone</span>
              <a [href]="'tel:' + act.phone" class="detail-value link">{{ act.phone }}</a>
            </div>
          </div>

          <div class="detail-item" *ngIf="act.openingHours">
            <div class="detail-icon hours">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Opening Hours</span>
              <span class="detail-value">{{ act.openingHours }}</span>
            </div>
          </div>

          <div class="detail-item" *ngIf="act.website">
            <div class="detail-icon website">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Website</span>
              <a [href]="act.website" target="_blank" rel="noopener noreferrer" class="detail-value link">Visit Website →</a>
            </div>
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="card-actions" *ngIf="auth.isAdmin()">
          <button class="action-btn edit" (click)="editActivity(act)" title="Edit Activity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
              <path d="M4 20h16"/>
            </svg>
            <span>Edit</span>
          </button>
          <button class="action-btn delete" (click)="deleteActivity(act)" title="Delete Activity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7h16"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
              <path d="M9 3h6"/>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activities-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* Modern Activity Card */
    .activity-card-modern {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.4s ease backwards;
    }

    .activity-card-modern:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .order-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary), #7c3aed);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .order-number {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .header-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .activity-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-main);
      margin: 0;
    }

    /* Category Tag */
    .category-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.875rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .category-tag.badge-museum {
      background: rgba(139, 92, 246, 0.15);
      color: #c084fc;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .category-tag.badge-castle {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .category-tag.badge-activity {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .category-tag.badge-park {
      background: rgba(6, 182, 212, 0.15);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .category-tag.badge-cave {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    /* Description Section */
    .description-section {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .activity-description {
      color: var(--text-muted);
      line-height: 1.6;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .detail-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .detail-icon.location {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
    }

    .detail-icon.phone {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }

    .detail-icon.hours {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }

    .detail-icon.website {
      background: rgba(139, 92, 246, 0.15);
      color: #c084fc;
    }

    .detail-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      opacity: 0.7;
    }

    .detail-value {
      font-size: 0.85rem;
      color: var(--text-main);
      word-break: break-word;
    }

    .detail-value.link {
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .detail-value.link:hover {
      text-decoration: underline;
      color: #a5b4fc;
    }

    /* Card Actions */
    .card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .action-btn.move-up:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .action-btn.move-down:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .action-btn.edit:hover:not(:disabled) {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .action-btn.delete:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        text-align: center;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .card-actions {
        flex-wrap: wrap;
        justify-content: center;
      }

      .action-btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class ActivityListComponent {
  auth = inject(AuthService);

  @Input() activities: Activity[] = [];
  @Output() edit = new EventEmitter<Activity>();
  @Output() delete = new EventEmitter<Activity>();
  @Output() reorder = new EventEmitter<{ activity: Activity; newOrder: number }>();

  getCategoryClass(category: string): string {
    return `badge-${category}`;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      museum: '🏛️',
      castle: '🏰',
      activity: '🎯',
      park: '🌳',
      cave: '🪨'
    };
    return icons[category] || '📍';
  }

  editActivity(act: Activity) {
    this.edit.emit(act);
  }

  deleteActivity(act: Activity) {
    if (confirm(`Delete "${act.title}"? This action cannot be undone.`)) {
      this.delete.emit(act);
    }
  }

  //moveUp(act: Activity, currentIndex: number) {
  //  if (currentIndex > 0) {
  //    const prevActivity = this.activities[currentIndex - 1];
  //    this.reorder.emit({
  //      activity: act,
  //      newOrder: prevActivity.order
  //    });
  //  }
  //}

  //moveDown(act: Activity, currentIndex: number) {
  //  if (currentIndex < this.activities.length - 1) {
  //    const nextActivity = this.activities[currentIndex + 1];
  //    this.reorder.emit({
  //      activity: act,
  //      newOrder: nextActivity.order
  //    });
  //  }
  //}
}//// \app\features\guides\activity-list\activity-list.component.ts
//import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { Activity } from '../../../core/services/activity.service';
//import { AuthService } from '../../../core/services/auth.service';

//@Component({
//  selector: 'app-activity-list',
//  standalone: true,
//  imports: [CommonModule],
//  template: `
//    <div class="activities-timeline">
//      <div *ngFor="let act of activities; let j = index" 
//           class="activity-item fade-in" 
//           [style.animation-delay]="j * 0.1 + 's'">
        
//        <div class="activity-marker">
//          <div class="marker-dot"></div>
//          <div class="marker-line" *ngIf="j < activities.length - 1"></div>
//        </div>
        
//        <div class="glass-card activity-card">
//          <div class="activity-card-content">
//            <div class="activity-header">
//              <div class="activity-title-section">
//                <span class="activity-order">#{{ act.order }}</span>
//                <h4>{{ act.title }}</h4>
//              </div>
//              <span class="badge" [ngClass]="getCategoryClass(act.category)">
//                {{ getCategoryIcon(act.category) }} {{ act.category | titlecase }}
//              </span>
//            </div>
            
//            <p>{{ act.description }}</p>
            
//            <div class="activity-meta">
//              <div class="meta-item" *ngIf="act.address">
//                <span class="material-symbols">location_on</span>
//                {{ act.address }}
//              </div>
              
//              <div class="meta-item" *ngIf="act.phone">
//                <span class="material-symbols">phone</span>
//                <a [href]="'tel:' + act.phone">{{ act.phone }}</a>
//              </div>
              
//              <div class="meta-item" *ngIf="act.openingHours">
//                <span class="material-symbols">schedule</span>
//                {{ act.openingHours }}
//              </div>
              
//              <div class="meta-item" *ngIf="act.website">
//                <span class="material-symbols">language</span>
//                <a [href]="act.website" target="_blank" rel="noopener noreferrer">Visit Website</a>
//              </div>
//            </div>
//          </div>
          
//          <div class="admin-actions-vertical" *ngIf="auth.isAdmin()">
//            <button class="btn-icon" title="Move Up" (click)="moveUp(act, j)" [disabled]="j === 0">
//              <span class="material-symbols">arrow_upward</span>
//            </button>
//            <button class="btn-icon" title="Move Down" (click)="moveDown(act, j)" [disabled]="j === activities.length - 1">
//              <span class="material-symbols">arrow_downward</span>
//            </button>
//            <button class="btn-icon" title="Edit Activity" (click)="editActivity(act)">
//              <span class="material-symbols">edit</span>
//            </button>
//            <button class="btn-icon text-danger" title="Delete Activity" (click)="deleteActivity(act)">
//              <span class="material-symbols">delete</span>
//            </button>
//          </div>
//        </div>
//      </div>
//    </div>
//  `,
//  styles: [`
//     .activities-timeline {
//       display: flex;
//       flex-direction: column;
//       gap: 1.5rem;
//     }
    
//     .activity-item {
//       display: flex;
//       gap: 1.5rem;
//     }
    
//     .activity-marker {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       width: 24px;
//       padding-top: 1.5rem;
//     }
    
//     .marker-dot {
//       width: 12px;
//       height: 12px;
//       border-radius: 50%;
//       background: var(--primary);
//       box-shadow: 0 0 10px var(--primary);
//       z-index: 1;
//     }
    
//     .marker-line {
//       width: 2px;
//       flex: 1;
//       background: var(--surface-border);
//       margin-top: 0.5rem;
//       margin-bottom: -2rem; /* Extend to next item */
//     }
    
//     .activity-card {
//       flex: 1;
//       display: flex;
//       background: rgba(30, 41, 59, 0.4);
//       overflow: hidden;
//     }

//     .activity-card-content {
//       flex: 1;
//       padding: 1.5rem;
//     }

//     .admin-actions-vertical {
//       display: flex;
//       flex-direction: column;
//       border-left: 1px solid var(--surface-border);
//       background: rgba(15, 23, 42, 0.2);
//     }

//     .btn-icon {
//       flex: 1;
//       border: none;
//       background: transparent;
//       color: var(--text-muted);
//       cursor: pointer;
//       padding: 1rem;
//       transition: all 0.2s;
//       border-bottom: 1px solid var(--surface-border);
//     }
    
//     .btn-icon:last-child {
//       border-bottom: none;
//     }

//     .btn-icon:hover {
//       background: rgba(255, 255, 255, 0.05);
//       color: var(--text-main);
//     }
    
//     .btn-icon.text-danger:hover {
//       background: rgba(239, 68, 68, 0.1);
//       color: var(--danger);
//     }
    
//     .activity-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 1rem;
//       gap: 1rem;
//     }
    
//     .activity-header h4 {
//       margin: 0;
//       color: var(--text-main);
//     }
    
//     .activity-meta {
//       display: flex;
//       flex-direction: column;
//       gap: 0.5rem;
//       margin-top: 1rem;
//       padding-top: 1rem;
//       border-top: 1px solid var(--surface-border);
//     }
    
//     .meta-item {
//       display: flex;
//       align-items: center;
//       gap: 0.5rem;
//       font-size: 0.875rem;
//       color: var(--text-muted);
//     }
    
//     .meta-item a {
//       color: var(--primary);
//       text-decoration: none;
//     }
    
//     .meta-item a:hover {
//       text-decoration: underline;
//     }
    
//     .material-symbols {
//       font-size: 1.25rem;
//     }
    
//     @media (max-width: 640px) {
//       .activity-card { flex-direction: column; }
//       .admin-actions-vertical { flex-direction: row; border-left: none; border-top: 1px solid var(--surface-border); }
//       .btn-icon { border-bottom: none; border-right: 1px solid var(--surface-border); }
//       .btn-icon:last-child { border-right: none; }
//     }
//   `]
//})
//export class ActivityListComponent {
//  auth = inject(AuthService);

//  @Input() activities: Activity[] = [];
//  @Output() edit = new EventEmitter<Activity>();
//  @Output() delete = new EventEmitter<Activity>();
//  @Output() reorder = new EventEmitter<{ activity: Activity; newOrder: number }>();

//  getCategoryClass(category: string): string {
//    return `badge-${category}`;
//  }

//  getCategoryIcon(category: string): string {
//    const icons: Record<string, string> = {
//      museum: '🏛️',
//      castle: '🏰',
//      activity: '🎯',
//      park: '🌳',
//      cave: '🪨'
//    };
//    return icons[category] || '📍';
//  }

//  editActivity(act: Activity) {
//    this.edit.emit(act);
//  }

//  deleteActivity(act: Activity) {
//    if (confirm(`Delete "${act.title}"? This action cannot be undone.`)) {
//      this.delete.emit(act);
//    }
//  }

//  // FIXED: These methods now emit the correct object type
//  moveUp(act: Activity, currentIndex: number) {
//    if (currentIndex > 0) {
//      const prevActivity = this.activities[currentIndex - 1];
//      this.reorder.emit({
//        activity: act,
//        newOrder: prevActivity.order
//      });
//    }
//  }

//  moveDown(act: Activity, currentIndex: number) {
//    if (currentIndex < this.activities.length - 1) {
//      const nextActivity = this.activities[currentIndex + 1];
//      this.reorder.emit({
//        activity: act,
//        newOrder: nextActivity.order
//      });
//    }
//  }
//}

