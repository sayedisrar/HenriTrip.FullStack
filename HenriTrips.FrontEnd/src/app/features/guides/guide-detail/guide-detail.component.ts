import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { GuideService, Guide } from '../../../core/services/guide.service';
import { ActivityService, Activity } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivityListComponent } from '../activity-list/activity-list.component';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ActivityListComponent, ActivityFormComponent],
  template: `
    <div *ngIf="guide" class="slide-up">
      <!-- Master Breadcrumb Style -->
      <div class="breadcrumb">
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
          {{ guide.title }}
        </span>
      </div>

      <div class="guide-header glass-panel">
        <div class="hero-image" [style.background-image]="'url(' + (guide.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14ebb40?auto=format&fit=crop&q=80&w=600') + ')'">
          <div class="overlay"></div>
          <div class="hero-content">
            <h1>{{ guide.title }}</h1>
            <div class="tags">
              <span class="badge badge-success">{{ guide.days }} Days</span>
              <span class="badge badge-primary" *ngFor="let s of guide.seasons">{{ s }}</span>
            </div>
          </div>
        </div>
        
        <div class="guide-info">
          <h2>About this Guide</h2>
          <p class="lead">{{ guide.description }}</p>
          
          <div class="meta-section">
            <div class="meta-block">
              <h3>Mobility</h3>
              <div class="tags">
                <span class="badge badge-warning" *ngFor="let m of guide.mobility">{{ m }}</span>
              </div>
            </div>
            
            <div class="meta-block">
              <h3>Best For</h3>
              <div class="tags">
                <span class="badge badge-primary" *ngFor="let t of guide.targetAudience">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="itinerary-section">
        <div class="section-header">
          <div class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <h2>Full Itinerary</h2>
          </div>
        </div>
        
        <div class="days-container">
          <div *ngFor="let day of getDaysArray(); let i = index" class="day-block fade-in" [style.animation-delay]="i * 0.15 + 's'">
            <div class="day-header">
              <div class="day-number">
                <span>Day {{ day }}</span>
              </div>
              <div class="day-line"></div>
              
              <button class="btn-add-activity" *ngIf="auth.isAdmin() && addingActivityForDay !== day" (click)="addingActivityForDay = day">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add Activity
              </button>
            </div>
            
            <app-activity-list 
              [activities]="getActivitiesForDay(day)"
              (edit)="editActivity($event)"
              (delete)="deleteActivity($event)">
            </app-activity-list>
            
            <app-activity-form 
              *ngIf="addingActivityForDay === day"
              [guideId]="guide.id"
              [dayNumber]="day"
              (formClosed)="closeActivityForm()">
            </app-activity-form>

            <app-activity-form 
              *ngIf="editingActivity?.dayNumber === day"
              [guideId]="guide.id"
              [dayNumber]="day"
              [activityToEdit]="editingActivity"
              (formClosed)="closeActivityForm()">
            </app-activity-form>
            
            <div *ngIf="getActivitiesForDay(day).length === 0 && addingActivityForDay !== day" class="empty-day glass-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>No specific activities planned for this day. Free time to explore!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="!guide" class="loading-state glass-panel">
      <div class="spinner"></div>
      <p>Loading guide details...</p>
    </div>
  `,
  styles: [`
    /* Master Breadcrumb Styles */
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

    /* Guide Header Styles */
    .guide-header { 
      overflow: hidden; 
      margin-bottom: 3rem; 
    }
    
    .hero-image { 
      height: 300px; 
      background-size: cover; 
      background-position: center; 
      position: relative; 
    }
    
    .overlay { 
      position: absolute; 
      inset: 0; 
      background: linear-gradient(to top, var(--surface), transparent); 
    }
    
    .hero-content { 
      position: absolute; 
      bottom: 0; 
      left: 0; 
      right: 0; 
      padding: 2rem; 
      z-index: 1; 
    }
    
    .hero-content h1 { 
      font-size: 2.5rem; 
      margin-bottom: 1rem; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.5); 
    }
    
    .tags { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 0.5rem; 
    }
    
    /* Master Badge Styles */
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
    }
    
    .guide-info { 
      padding: 2rem; 
    }
    
    .guide-info h2 {
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    
    .lead { 
      font-size: 1.125rem; 
      color: var(--text-main); 
      margin-bottom: 2rem; 
      line-height: 1.6; 
    }
    
    .meta-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--surface-border);
    }
    
    .meta-block h3 { 
      font-size: 1rem; 
      color: var(--text-muted); 
      margin-bottom: 1rem; 
    }
    
    /* Itinerary Section Styles */
    .itinerary-section { 
      padding: 1rem 0; 
    }
    
    .section-header {
      margin-bottom: 2rem;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .section-title h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
    }
    
    .days-container { 
      display: flex; 
      flex-direction: column; 
      gap: 3rem; 
    }
    
    .day-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .day-number {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 100px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark, #7c3aed));
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.875rem;
      letter-spacing: 0.5px;
    }
    
    .day-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, var(--primary), transparent);
      opacity: 0.3;
    }
    
    /* Master Add Activity Button */
    .btn-add-activity {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;
      border: 1px solid var(--surface-border);
      cursor: pointer;
    }
    
    .btn-add-activity:hover {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateY(-2px);
    }
    
    /* Empty Day State */
    .empty-day { 
      padding: 2rem; 
      text-align: center; 
      color: var(--text-muted); 
      border-style: dashed;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .empty-day svg {
      opacity: 0.5;
    }
    
    /* Loading State */
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
      border: 3px solid var(--surface-border);
      border-top-color: var(--primary); 
      border-radius: 50%; 
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
    
    /* Responsive Design */
    @media (max-width: 640px) {
      .breadcrumb {
        width: 100%;
        overflow-x: auto;
      }
      
      .hero-content h1 {
        font-size: 1.5rem;
      }
      
      .guide-info {
        padding: 1.5rem;
      }
      
      .day-header {
        flex-wrap: wrap;
      }
      
      .day-line {
        order: 3;
        width: 100%;
      }
    }
  `]
})
export class GuideDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guideService = inject(GuideService);
  private activityService = inject(ActivityService);
  auth = inject(AuthService);

  guide: Guide | undefined;
  activities: Activity[] = [];

  addingActivityForDay: number | null = null;
  editingActivity: Activity | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadGuideDetails(id);
      }
    });
  }

  loadGuideDetails(id: string) {
    this.guideService.getGuideById(id).subscribe(guide => {
      this.guide = guide;
      if (guide) {
        this.loadActivities(guide.id);
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadActivities(guideId: string) {
    this.activityService.getActivitiesForGuide(guideId).subscribe(acts => {
      this.activities = acts;
    });
  }

  getDaysArray(): number[] {
    if (!this.guide) return [];
    return Array.from({ length: this.guide.days }, (_, i) => i + 1);
  }

  getActivitiesForDay(dayNumber: number): Activity[] {
    return this.activities.filter(a => a.dayNumber === dayNumber);
  }

  editActivity(activity: Activity) {
    this.addingActivityForDay = null; // Close any ongoing adds
    this.editingActivity = activity;
  }

  deleteActivity(activity: Activity) {
    this.activityService.deleteActivity(activity.id);
    if (this.guide) this.loadActivities(this.guide.id);
  }

  closeActivityForm() {
    this.addingActivityForDay = null;
    this.editingActivity = null;
    if (this.guide) this.loadActivities(this.guide.id);
  }
}


//import { Component, inject, OnInit } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { ActivatedRoute, RouterModule, Router } from '@angular/router';
//import { GuideService, Guide } from '../../../core/services/guide.service';
//import { ActivityService, Activity } from '../../../core/services/activity.service';
//import { AuthService } from '../../../core/services/auth.service';
//import { ActivityListComponent } from '../activity-list/activity-list.component';
//import { ActivityFormComponent } from '../activity-form/activity-form.component';

//@Component({
//  selector: 'app-guide-detail',
//  standalone: true,
//  imports: [CommonModule, RouterModule, ActivityListComponent, ActivityFormComponent],
//  template: `
//    <div *ngIf="guide" class="slide-up">
//      <div class="breadcrumb">
//        <a routerLink="/dashboard" class="btn btn-outline" style="padding: 0.5rem 1rem;">
//          <span class="material-symbols">arrow_back</span> Back to Guides
//        </a>
//      </div>

//      <div class="guide-header glass-panel">
//        <div class="hero-image" [style.background-image]="'url(' + (guide.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14ebb40?auto=format&fit=crop&q=80&w=600') + ')'">
//          <div class="overlay"></div>
//          <div class="hero-content">
//            <h1>{{ guide.title }}</h1>
//            <div class="tags">
//              <span class="badge badge-success">{{ guide.days }} Days</span>
//              <span class="badge badge-primary" *ngFor="let s of guide.seasons">{{ s }}</span>
//            </div>
//          </div>
//        </div>
        
//        <div class="guide-info">
//          <h2>About this Guide</h2>
//          <p class="lead">{{ guide.description }}</p>
          
//          <div class="meta-section">
//            <div class="meta-block">
//              <h3>Mobility</h3>
//              <div class="tags">
//                <span class="badge badge-warning" *ngFor="let m of guide.mobility">{{ m }}</span>
//              </div>
//            </div>
            
//            <div class="meta-block">
//              <h3>Best For</h3>
//              <div class="tags">
//                <span class="badge badge-primary" *ngFor="let t of guide.targetAudience">{{ t }}</span>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>

//      <div class="itinerary-section">
//        <h2 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;">
//          <span class="material-symbols" style="color: var(--primary);">map</span> 
//          Full Itinerary
//        </h2>
        
//        <div class="days-container">
//          <div *ngFor="let day of getDaysArray(); let i = index" class="day-block fade-in" [style.animation-delay]="i * 0.15 + 's'">
//            <div class="day-header">
//              <h3>Day {{ day }}</h3>
//              <div class="day-line"></div>
              
//              <button class="btn btn-outline btn-sm" *ngIf="auth.isAdmin() && addingActivityForDay !== day" (click)="addingActivityForDay = day">
//                <span class="material-symbols">add</span> Add Activity
//              </button>
//            </div>
            
//            <app-activity-list 
//              [activities]="getActivitiesForDay(day)"
//              (edit)="editActivity($event)"
//              (delete)="deleteActivity($event)">
//            </app-activity-list>
            
//            <app-activity-form 
//              *ngIf="addingActivityForDay === day"
//              [guideId]="guide.id"
//              [dayNumber]="day"
//              (formClosed)="closeActivityForm()">
//            </app-activity-form>

//            <app-activity-form 
//              *ngIf="editingActivity?.dayNumber === day"
//              [guideId]="guide.id"
//              [dayNumber]="day"
//              [activityToEdit]="editingActivity"
//              (formClosed)="closeActivityForm()">
//            </app-activity-form>
            
//            <div *ngIf="getActivitiesForDay(day).length === 0 && addingActivityForDay !== day" class="empty-day glass-card">
//              <p>No specific activities planned for this day. Free time to explore!</p>
//            </div>
//          </div>
//        </div>
//      </div>
//    </div>
    
//    <div *ngIf="!guide" class="loading-state glass-panel">
//      <div class="spinner"></div>
//      <p>Loading guide details...</p>
//    </div>
//  `,
//  styles: [`
//    .breadcrumb { margin-bottom: 2rem; }
//    .guide-header { overflow: hidden; margin-bottom: 3rem; }
//    .hero-image { height: 300px; background-size: cover; background-position: center; position: relative; }
//    .overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--surface), transparent); }
//    .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem; z-index: 1; }
//    .hero-content h1 { font-size: 2.5rem; margin-bottom: 1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
//    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
//    .guide-info { padding: 2rem; }
//    .lead { font-size: 1.125rem; color: var(--text-main); margin-bottom: 2rem; line-height: 1.6; }
    
//    .meta-section {
//      display: grid;
//      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//      gap: 2rem;
//      padding-top: 2rem;
//      border-top: 1px solid var(--surface-border);
//    }
    
//    .meta-block h3 { font-size: 1rem; color: var(--text-muted); margin-bottom: 1rem; }
//    .itinerary-section { padding: 1rem 0; }
//    .days-container { display: flex; flex-direction: column; gap: 3rem; }
    
//    .day-header {
//      display: flex;
//      align-items: center;
//      gap: 1rem;
//      margin-bottom: 2rem;
//    }
    
//    .day-header h3 {
//      margin: 0;
//      color: var(--primary);
//      background: rgba(99, 102, 241, 0.1);
//      padding: 0.5rem 1.5rem;
//      border-radius: 999px;
//      border: 1px solid rgba(99, 102, 241, 0.2);
//    }
    
//    .day-line {
//      flex: 1;
//      height: 1px;
//      background: linear-gradient(to right, var(--primary), transparent);
//      opacity: 0.3;
//    }
    
//    .empty-day { padding: 2rem; text-align: center; color: var(--text-muted); border-style: dashed; }
    
//    .loading-state { padding: 4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
//    .spinner {
//      width: 40px; height: 40px; border: 3px solid var(--surface-border);
//      border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;
//    }
//    @keyframes spin { to { transform: rotate(360deg); } }
//  `]
//})
//export class GuideDetailComponent implements OnInit {
//  private route = inject(ActivatedRoute);
//  private router = inject(Router);
//  private guideService = inject(GuideService);
//  private activityService = inject(ActivityService);
//  auth = inject(AuthService);

//  guide: Guide | undefined;
//  activities: Activity[] = [];

//  addingActivityForDay: number | null = null;
//  editingActivity: Activity | null = null;

//  ngOnInit() {
//    this.route.paramMap.subscribe(params => {
//      const id = params.get('id');
//      if (id) {
//        this.loadGuideDetails(id);
//      }
//    });
//  }

//  loadGuideDetails(id: string) {
//    this.guideService.getGuideById(id).subscribe(guide => {
//      this.guide = guide;
//      if (guide) {
//        this.loadActivities(guide.id);
//      } else {
//         this.router.navigate(['/dashboard']);
//      }
//    });
//  }
  
//  loadActivities(guideId: string) {
//    this.activityService.getActivitiesForGuide(guideId).subscribe(acts => {
//      this.activities = acts;
//    });
//  }

//  getDaysArray(): number[] {
//    if (!this.guide) return [];
//    return Array.from({length: this.guide.days}, (_, i) => i + 1);
//  }

//  getActivitiesForDay(dayNumber: number): Activity[] {
//    return this.activities.filter(a => a.dayNumber === dayNumber);
//  }

//  editActivity(activity: Activity) {
//    this.addingActivityForDay = null; // Close any ongoing adds
//    this.editingActivity = activity;
//  }

//  deleteActivity(activity: Activity) {
//    this.activityService.deleteActivity(activity.id);
//    if (this.guide) this.loadActivities(this.guide.id);
//  }

//  closeActivityForm() {
//    this.addingActivityForDay = null;
//    this.editingActivity = null;
//    if (this.guide) this.loadActivities(this.guide.id);
//  }
//}
