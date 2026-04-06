// \app\features\guides\guide-detail\guide-detail.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { GuideService, Guide } from '../../../core/services/guide.service';
import { ActivityService, Activity } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ActivityFormComponent],
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
            
            <!-- Activities List with Inline Edit -->
            <div class="activities-container">
              <div *ngFor="let act of getActivitiesForDay(day); let j = index" class="activity-wrapper">
                <!-- Activity Card with BLACK BACKGROUND -->
                <div class="activity-card-modern">
                  <!-- Card Header with Order Badge -->
                  <div class="card-header">
                    <div class="order-badge">
                      <span class="order-number">{{ act.order }}</span>
                    </div>
                    <div class="header-content">
                      <h3 class="activity-title">{{ act.title }}</h3>
                      <!-- FIXED: Category displays correctly with icon and color -->
                      <span class="category-tag" [ngClass]="'category-' + act.category">
                        {{ getCategoryIcon(act.category) }} {{ getCategoryName(act.category) }}
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

                <!-- EDIT FORM - Appears right UNDER this specific activity -->
                <div *ngIf="editingActivityId === act.id" class="edit-form-container">
                  <app-activity-form
                    [guideId]="guide.id"
                    [dayNumber]="day"
                    [activityToEdit]="editingActivityData"
                    (formClosed)="closeActivityForm($event)">
                  </app-activity-form>
                </div>
              </div>
            </div>

            <!-- ADD FORM - Appears at the bottom of the day -->
            <div *ngIf="addingActivityForDay === day" class="add-form-container">
              <app-activity-form
                [guideId]="guide.id"
                [dayNumber]="day"
                (formClosed)="closeActivityForm($event)">
              </app-activity-form>
            </div>
            
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
    
    /* Activities Container */
    .activities-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .activity-wrapper {
      margin-bottom: 0.5rem;
    }

    /* Modern Activity Card - BLACK BACKGROUND */
    .activity-card-modern {
      background: #0a0a0a;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .activity-card-modern:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
      background: #0d0d0d;
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.03));
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
      color: #ffffff;
      margin: 0;
    }

    /* Category Tags - Fixed Display */
    .category-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.875rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .category-museum {
      background: rgba(139, 92, 246, 0.2);
      color: #c084fc;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .category-castle {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .category-activity {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .category-park {
      background: rgba(6, 182, 212, 0.2);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .category-cave {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    /* Description Section */
    .description-section {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .activity-description {
      color: #9ca3af;
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
      background: rgba(0, 0, 0, 0.3);
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
      color: #6b7280;
      opacity: 0.7;
    }

    .detail-value {
      font-size: 0.85rem;
      color: #d1d5db;
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
      background: rgba(0, 0, 0, 0.4);
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
      color: #9ca3af;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn.edit:hover {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .action-btn.delete:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    /* Edit/Add Form Containers */
    .edit-form-container,
    .add-form-container {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Empty Day State */
    .empty-day { 
      padding: 2rem; 
      text-align: center; 
      color: #6b7280; 
      border-style: dashed;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.3);
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
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--primary); 
      border-radius: 50%; 
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
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
export class GuideDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guideService = inject(GuideService);
  private activityService = inject(ActivityService);
  auth = inject(AuthService);

  guide: Guide | undefined;
  activities: Activity[] = [];

  addingActivityForDay: number | null = null;

  // Track edit by activity ID
  editingActivityId: number | null = null;
  editingActivityData: Activity | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadGuideDetails(id);
      }
    });
  }

  loadGuideDetails(id: string) {
    this.guideService.getGuideById(id).subscribe({
      next: (guide) => {
        this.guide = guide;
        if (guide) {
          this.loadActivities(guide.id);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading guide:', error);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadActivities(guideId: string) {
    this.activityService.getActivitiesForGuide(guideId).subscribe({
      next: (acts) => {
        console.log('Activities loaded:', acts);
        this.activities = acts;
      },
      error: (error) => {
        console.error('Failed to load activities:', error);
        this.activities = [];
      }
    });
  }

  getDaysArray(): number[] {
    if (!this.guide) return [];
    return Array.from({ length: this.guide.days }, (_, i) => i + 1);
  }

  getActivitiesForDay(dayNumber: number): Activity[] {
    return this.activities.filter(a => a.day === dayNumber);
  }

  // Get category display name (capitalized)
  getCategoryName(category: string): string {
    const names: Record<string, string> = {
      museum: 'Museum',
      castle: 'Castle',
      activity: 'Activity',
      park: 'Park',
      cave: 'Cave'
    };
    return names[category] || category;
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

  editActivity(activity: Activity) {
    console.log('📝 EDIT ACTIVITY CALLED:', activity);
    this.addingActivityForDay = null;
    this.editingActivityId = activity.id;
    this.editingActivityData = activity;
    console.log('📝 editingActivityId set to:', this.editingActivityId);
  }

  deleteActivity(activity: Activity) {
    if (confirm(`Delete "${activity.title}"? This action cannot be undone.`)) {
      this.activityService.deleteActivity(activity.id).subscribe({
        next: () => {
          console.log('Activity deleted successfully');
          if (this.guide) {
            this.loadActivities(this.guide.id);
          }
        },
        error: (error) => {
          console.error('Failed to delete activity:', error);
          alert(`Failed to delete activity: ${error.error?.message || error.message}`);
        }
      });
    }
  }

  closeActivityForm(event?: { success?: boolean }) {
    console.log('🔵 Closing form, event:', event);
    this.addingActivityForDay = null;
    this.editingActivityId = null;
    this.editingActivityData = null;
    if (event?.success && this.guide) {
      console.log('🔵 Reloading activities...');
      this.loadActivities(this.guide.id);
    }
  }
}

//// \app\features\guides\guide-detail\guide-detail.component.ts
//import { Component, inject, OnInit } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { ActivatedRoute, RouterModule, Router } from '@angular/router';
//import { GuideService, Guide } from '../../../core/services/guide.service';
//import { ActivityService, Activity } from '../../../core/services/activity.service';
//import { AuthService } from '../../../core/services/auth.service';
//import { ActivityFormComponent } from '../activity-form/activity-form.component';

//@Component({
//  selector: 'app-guide-detail',
//  standalone: true,
//  imports: [CommonModule, RouterModule, ActivityFormComponent],
//  template: `
//    <div *ngIf="guide" class="slide-up">
//      <!-- Master Breadcrumb Style -->
//      <div class="breadcrumb">
//        <a routerLink="/dashboard" class="breadcrumb-link">
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//            <path d="M19 12H5M12 19l-7-7 7-7"/>
//          </svg>
//          Back to Guides
//        </a>
//        <div class="breadcrumb-divider">
//          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//            <path d="M9 18l6-6-6-6"/>
//          </svg>
//        </div>
//        <span class="breadcrumb-current">
//          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//            <path d="M4 4v16h16V4H4z M8 9h8M8 13h6M8 17h4"/>
//          </svg>
//          {{ guide.title }}
//        </span>
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
//        <div class="section-header">
//          <div class="section-title">
//            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
//              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//              <circle cx="12" cy="10" r="3"/>
//            </svg>
//            <h2>Full Itinerary</h2>
//          </div>
//        </div>
        
//        <div class="days-container">
//          <div *ngFor="let day of getDaysArray(); let i = index" class="day-block fade-in" [style.animation-delay]="i * 0.15 + 's'">
//            <div class="day-header">
//              <div class="day-number">
//                <span>Day {{ day }}</span>
//              </div>
//              <div class="day-line"></div>
              
//              <button class="btn-add-activity" *ngIf="auth.isAdmin() && addingActivityForDay !== day" (click)="addingActivityForDay = day">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                  <path d="M12 5v14M5 12h14"/>
//                </svg>
//                Add Activity
//              </button>
//            </div>
            
//            <!-- Activities List with Inline Edit -->
//            <div class="activities-container">
//              <div *ngFor="let act of getActivitiesForDay(day); let j = index" class="activity-wrapper">
//                <!-- Activity Card -->
//                <div class="activity-card-modern">
//                  <!-- Card Header with Order Badge -->
//                  <div class="card-header">
//                    <div class="order-badge">
//                      <span class="order-number">{{ act.order }}</span>
//                    </div>
//                    <div class="header-content">
//                      <h3 class="activity-title">{{ act.title }}</h3>
//                      <span class="category-tag" [ngClass]="getCategoryClass(act.category)">
//                        {{ getCategoryIcon(act.category) }} {{ act.category | titlecase }}
//                      </span>
//                    </div>
//                  </div>

//                  <!-- Description Section -->
//                  <div class="description-section">
//                    <p class="activity-description">{{ act.description }}</p>
//                  </div>

//                  <!-- Details Grid -->
//                  <div class="details-grid">
//                    <div class="detail-item" *ngIf="act.address">
//                      <div class="detail-icon location">
//                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                          <circle cx="12" cy="10" r="3"/>
//                        </svg>
//                      </div>
//                      <div class="detail-content">
//                        <span class="detail-label">Location</span>
//                        <span class="detail-value">{{ act.address }}</span>
//                      </div>
//                    </div>

//                    <div class="detail-item" *ngIf="act.phone">
//                      <div class="detail-icon phone">
//                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
//                        </svg>
//                      </div>
//                      <div class="detail-content">
//                        <span class="detail-label">Phone</span>
//                        <a [href]="'tel:' + act.phone" class="detail-value link">{{ act.phone }}</a>
//                      </div>
//                    </div>

//                    <div class="detail-item" *ngIf="act.openingHours">
//                      <div class="detail-icon hours">
//                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                          <circle cx="12" cy="12" r="10"/>
//                          <polyline points="12 6 12 12 16 14"/>
//                        </svg>
//                      </div>
//                      <div class="detail-content">
//                        <span class="detail-label">Opening Hours</span>
//                        <span class="detail-value">{{ act.openingHours }}</span>
//                      </div>
//                    </div>

//                    <div class="detail-item" *ngIf="act.website">
//                      <div class="detail-icon website">
//                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                          <circle cx="12" cy="12" r="10"/>
//                          <line x1="2" y1="12" x2="22" y2="12"/>
//                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
//                        </svg>
//                      </div>
//                      <div class="detail-content">
//                        <span class="detail-label">Website</span>
//                        <a [href]="act.website" target="_blank" rel="noopener noreferrer" class="detail-value link">Visit Website →</a>
//                      </div>
//                    </div>
//                  </div>

//                  <!-- Admin Actions -->
//                  <div class="card-actions" *ngIf="auth.isAdmin()">
//                    <button class="action-btn edit" (click)="editActivity(act)" title="Edit Activity">
//                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                        <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
//                        <path d="M4 20h16"/>
//                      </svg>
//                      <span>Edit</span>
//                    </button>
//                    <button class="action-btn delete" (click)="deleteActivity(act)" title="Delete Activity">
//                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                        <path d="M4 7h16"/>
//                        <path d="M10 11v6"/>
//                        <path d="M14 11v6"/>
//                        <path d="M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
//                        <path d="M9 3h6"/>
//                      </svg>
//                      <span>Delete</span>
//                    </button>
//                  </div>
//                </div>

//                <!-- EDIT FORM - Appears right UNDER this specific activity -->
//                <div *ngIf="editingActivityId === act.id" class="edit-form-container">
//                  <app-activity-form
//                    [guideId]="guide.id"
//                    [dayNumber]="day"
//                    [activityToEdit]="editingActivityData"
//                    (formClosed)="closeActivityForm($event)">
//                  </app-activity-form>
//                </div>
//              </div>
//            </div>

//            <!-- ADD FORM - Appears at the bottom of the day -->
//            <div *ngIf="addingActivityForDay === day" class="add-form-container">
//              <app-activity-form
//                [guideId]="guide.id"
//                [dayNumber]="day"
//                (formClosed)="closeActivityForm($event)">
//              </app-activity-form>
//            </div>
            
//            <div *ngIf="getActivitiesForDay(day).length === 0 && addingActivityForDay !== day" class="empty-day glass-card">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                <circle cx="12" cy="12" r="10"/>
//                <line x1="12" y1="8" x2="12" y2="12"/>
//                <line x1="12" y1="16" x2="12.01" y2="16"/>
//              </svg>
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
//    /* Master Breadcrumb Styles */
//    .breadcrumb {
//      display: flex;
//      align-items: center;
//      gap: 0.75rem;
//      margin-bottom: 2rem;
//      padding: 0.75rem 1rem;
//      background: rgba(15, 23, 42, 0.4);
//      border-radius: var(--radius-md);
//      backdrop-filter: blur(10px);
//      border: 1px solid var(--surface-border);
//      width: fit-content;
//    }

//    .breadcrumb-link {
//      display: inline-flex;
//      align-items: center;
//      gap: 0.5rem;
//      color: var(--text-muted);
//      text-decoration: none;
//      font-size: 0.875rem;
//      font-weight: 500;
//      padding: 0.5rem 1rem;
//      border-radius: var(--radius-sm);
//      transition: all 0.2s ease;
//      background: rgba(255, 255, 255, 0.03);
//    }

//    .breadcrumb-link:hover {
//      color: var(--primary);
//      background: rgba(99, 102, 241, 0.1);
//      transform: translateX(-4px);
//    }

//    .breadcrumb-link:hover svg {
//      transform: translateX(-2px);
//    }

//    .breadcrumb-link svg {
//      transition: transform 0.2s ease;
//    }

//    .breadcrumb-divider {
//      color: var(--text-muted);
//      opacity: 0.5;
//      display: inline-flex;
//      align-items: center;
//    }

//    .breadcrumb-current {
//      display: inline-flex;
//      align-items: center;
//      gap: 0.5rem;
//      color: var(--text-main);
//      font-size: 0.875rem;
//      font-weight: 600;
//      padding: 0.5rem 1rem;
//      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
//      border-radius: var(--radius-sm);
//      border: 1px solid rgba(99, 102, 241, 0.3);
//    }

//    .breadcrumb-current svg {
//      color: var(--primary);
//    }

//    /* Guide Header Styles */
//    .guide-header { 
//      overflow: hidden; 
//      margin-bottom: 3rem; 
//    }
    
//    .hero-image { 
//      height: 300px; 
//      background-size: cover; 
//      background-position: center; 
//      position: relative; 
//    }
    
//    .overlay { 
//      position: absolute; 
//      inset: 0; 
//      background: linear-gradient(to top, var(--surface), transparent); 
//    }
    
//    .hero-content { 
//      position: absolute; 
//      bottom: 0; 
//      left: 0; 
//      right: 0; 
//      padding: 2rem; 
//      z-index: 1; 
//    }
    
//    .hero-content h1 { 
//      font-size: 2.5rem; 
//      margin-bottom: 1rem; 
//      text-shadow: 0 2px 4px rgba(0,0,0,0.5); 
//    }
    
//    .tags { 
//      display: flex; 
//      flex-wrap: wrap; 
//      gap: 0.5rem; 
//    }
    
//    /* Master Badge Styles */
//    .badge {
//      display: inline-flex;
//      align-items: center;
//      padding: 0.25rem 0.75rem;
//      border-radius: 20px;
//      font-size: 0.75rem;
//      font-weight: 500;
//    }
    
//    .badge-primary {
//      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
//      color: #a5b4fc;
//      border: 1px solid rgba(99, 102, 241, 0.3);
//    }
    
//    .badge-success {
//      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
//      color: #4ade80;
//      border: 1px solid rgba(34, 197, 94, 0.3);
//    }
    
//    .badge-warning {
//      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 146, 60, 0.2));
//      color: #fbbf24;
//      border: 1px solid rgba(245, 158, 11, 0.3);
//    }
    
//    .guide-info { 
//      padding: 2rem; 
//    }
    
//    .guide-info h2 {
//      margin-bottom: 1rem;
//      font-size: 1.5rem;
//    }
    
//    .lead { 
//      font-size: 1.125rem; 
//      color: var(--text-main); 
//      margin-bottom: 2rem; 
//      line-height: 1.6; 
//    }
    
//    .meta-section {
//      display: grid;
//      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//      gap: 2rem;
//      padding-top: 2rem;
//      border-top: 1px solid var(--surface-border);
//    }
    
//    .meta-block h3 { 
//      font-size: 1rem; 
//      color: var(--text-muted); 
//      margin-bottom: 1rem; 
//    }
    
//    /* Itinerary Section Styles */
//    .itinerary-section { 
//      padding: 1rem 0; 
//    }
    
//    .section-header {
//      margin-bottom: 2rem;
//    }
    
//    .section-title {
//      display: flex;
//      align-items: center;
//      gap: 0.75rem;
//    }
    
//    .section-title h2 {
//      margin: 0;
//      font-size: 1.75rem;
//      font-weight: 600;
//    }
    
//    .days-container { 
//      display: flex; 
//      flex-direction: column; 
//      gap: 3rem; 
//    }
    
//    .day-header {
//      display: flex;
//      align-items: center;
//      gap: 1rem;
//      margin-bottom: 2rem;
//    }
    
//    .day-number {
//      display: flex;
//      align-items: center;
//      justify-content: center;
//      min-width: 100px;
//      background: linear-gradient(135deg, var(--primary), var(--primary-dark, #7c3aed));
//      color: white;
//      padding: 0.5rem 1.5rem;
//      border-radius: 999px;
//      font-weight: 600;
//      font-size: 0.875rem;
//      letter-spacing: 0.5px;
//    }
    
//    .day-line {
//      flex: 1;
//      height: 1px;
//      background: linear-gradient(to right, var(--primary), transparent);
//      opacity: 0.3;
//    }
    
//    /* Master Add Activity Button */
//    .btn-add-activity {
//      display: inline-flex;
//      align-items: center;
//      gap: 0.5rem;
//      background: rgba(255, 255, 255, 0.05);
//      color: var(--text-main);
//      padding: 0.5rem 1rem;
//      border-radius: var(--radius-md);
//      font-weight: 500;
//      font-size: 0.875rem;
//      transition: all 0.2s;
//      border: 1px solid var(--surface-border);
//      cursor: pointer;
//    }
    
//    .btn-add-activity:hover {
//      background: rgba(99, 102, 241, 0.1);
//      color: var(--primary);
//      border-color: rgba(99, 102, 241, 0.3);
//      transform: translateY(-2px);
//    }
    
//    /* Activities Container */
//    .activities-container {
//      display: flex;
//      flex-direction: column;
//      gap: 1.25rem;
//    }

//    .activity-wrapper {
//      margin-bottom: 0.5rem;
//    }

//    /* Modern Activity Card */
//    .activity-card-modern {
//      background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
//      backdrop-filter: blur(10px);
//      border-radius: 20px;
//      border: 1px solid rgba(255, 255, 255, 0.05);
//      overflow: hidden;
//      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//    }

//    .activity-card-modern:hover {
//      transform: translateY(-2px);
//      border-color: rgba(99, 102, 241, 0.3);
//      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
//    }

//    /* Card Header */
//    .card-header {
//      display: flex;
//      align-items: center;
//      gap: 1rem;
//      padding: 1.25rem 1.5rem;
//      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
//      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
//    }

//    .order-badge {
//      width: 48px;
//      height: 48px;
//      background: linear-gradient(135deg, var(--primary), #7c3aed);
//      border-radius: 16px;
//      display: flex;
//      align-items: center;
//      justify-content: center;
//      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
//    }

//    .order-number {
//      font-size: 1.25rem;
//      font-weight: 700;
//      color: white;
//    }

//    .header-content {
//      flex: 1;
//      display: flex;
//      justify-content: space-between;
//      align-items: center;
//      flex-wrap: wrap;
//      gap: 0.75rem;
//    }

//    .activity-title {
//      font-size: 1.125rem;
//      font-weight: 600;
//      color: var(--text-main);
//      margin: 0;
//    }

//    /* Category Tag */
//    .category-tag {
//      display: inline-flex;
//      align-items: center;
//      gap: 0.375rem;
//      padding: 0.375rem 0.875rem;
//      border-radius: 50px;
//      font-size: 0.75rem;
//      font-weight: 500;
//    }

//    .category-tag.badge-museum {
//      background: rgba(139, 92, 246, 0.15);
//      color: #c084fc;
//      border: 1px solid rgba(139, 92, 246, 0.3);
//    }

//    .category-tag.badge-castle {
//      background: rgba(245, 158, 11, 0.15);
//      color: #fbbf24;
//      border: 1px solid rgba(245, 158, 11, 0.3);
//    }

//    .category-tag.badge-activity {
//      background: rgba(34, 197, 94, 0.15);
//      color: #4ade80;
//      border: 1px solid rgba(34, 197, 94, 0.3);
//    }

//    .category-tag.badge-park {
//      background: rgba(6, 182, 212, 0.15);
//      color: #22d3ee;
//      border: 1px solid rgba(6, 182, 212, 0.3);
//    }

//    .category-tag.badge-cave {
//      background: rgba(168, 85, 247, 0.15);
//      color: #c084fc;
//      border: 1px solid rgba(168, 85, 247, 0.3);
//    }

//    /* Description Section */
//    .description-section {
//      padding: 1.25rem 1.5rem;
//      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
//    }

//    .activity-description {
//      color: var(--text-muted);
//      line-height: 1.6;
//      font-size: 0.9rem;
//      margin: 0;
//    }

//    /* Details Grid */
//    .details-grid {
//      display: grid;
//      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
//      gap: 1rem;
//      padding: 1.25rem 1.5rem;
//      background: rgba(0, 0, 0, 0.2);
//    }

//    .detail-item {
//      display: flex;
//      align-items: flex-start;
//      gap: 0.75rem;
//    }

//    .detail-icon {
//      width: 32px;
//      height: 32px;
//      border-radius: 10px;
//      display: flex;
//      align-items: center;
//      justify-content: center;
//      flex-shrink: 0;
//    }

//    .detail-icon.location {
//      background: rgba(59, 130, 246, 0.15);
//      color: #60a5fa;
//    }

//    .detail-icon.phone {
//      background: rgba(16, 185, 129, 0.15);
//      color: #34d399;
//    }

//    .detail-icon.hours {
//      background: rgba(245, 158, 11, 0.15);
//      color: #fbbf24;
//    }

//    .detail-icon.website {
//      background: rgba(139, 92, 246, 0.15);
//      color: #c084fc;
//    }

//    .detail-content {
//      flex: 1;
//      display: flex;
//      flex-direction: column;
//      gap: 0.25rem;
//    }

//    .detail-label {
//      font-size: 0.7rem;
//      font-weight: 600;
//      text-transform: uppercase;
//      letter-spacing: 0.5px;
//      color: var(--text-muted);
//      opacity: 0.7;
//    }

//    .detail-value {
//      font-size: 0.85rem;
//      color: var(--text-main);
//      word-break: break-word;
//    }

//    .detail-value.link {
//      color: var(--primary);
//      text-decoration: none;
//      transition: color 0.2s;
//    }

//    .detail-value.link:hover {
//      text-decoration: underline;
//      color: #a5b4fc;
//    }

//    /* Card Actions */
//    .card-actions {
//      display: flex;
//      gap: 0.5rem;
//      padding: 1rem 1.5rem;
//      background: rgba(0, 0, 0, 0.3);
//      border-top: 1px solid rgba(255, 255, 255, 0.05);
//    }

//    .action-btn {
//      display: inline-flex;
//      align-items: center;
//      gap: 0.5rem;
//      padding: 0.5rem 1rem;
//      background: rgba(255, 255, 255, 0.03);
//      border: 1px solid rgba(255, 255, 255, 0.08);
//      border-radius: 12px;
//      color: var(--text-muted);
//      font-size: 0.8rem;
//      font-weight: 500;
//      cursor: pointer;
//      transition: all 0.2s ease;
//    }

//    .action-btn.edit:hover {
//      background: rgba(245, 158, 11, 0.15);
//      border-color: rgba(245, 158, 11, 0.3);
//      color: #fbbf24;
//    }

//    .action-btn.delete:hover {
//      background: rgba(239, 68, 68, 0.15);
//      border-color: rgba(239, 68, 68, 0.3);
//      color: #f87171;
//    }

//    /* Edit/Add Form Containers */
//    .edit-form-container,
//    .add-form-container {
//      margin-top: 1rem;
//      margin-bottom: 0.5rem;
//      animation: slideDown 0.3s ease;
//    }

//    @keyframes slideDown {
//      from {
//        opacity: 0;
//        transform: translateY(-10px);
//      }
//      to {
//        opacity: 1;
//        transform: translateY(0);
//      }
//    }

//    /* Empty Day State */
//    .empty-day { 
//      padding: 2rem; 
//      text-align: center; 
//      color: var(--text-muted); 
//      border-style: dashed;
//      display: flex;
//      flex-direction: column;
//      align-items: center;
//      gap: 0.5rem;
//    }
    
//    .empty-day svg {
//      opacity: 0.5;
//    }
    
//    /* Loading State */
//    .loading-state { 
//      padding: 4rem; 
//      display: flex; 
//      flex-direction: column; 
//      align-items: center; 
//      justify-content: center; 
//      gap: 1rem; 
//    }
    
//    .spinner {
//      width: 40px; 
//      height: 40px; 
//      border: 3px solid var(--surface-border);
//      border-top-color: var(--primary); 
//      border-radius: 50%; 
//      animation: spin 1s linear infinite;
//    }
    
//    @keyframes spin { 
//      to { transform: rotate(360deg); } 
//    }
    
//    /* Responsive Design */
//    @media (max-width: 768px) {
//      .breadcrumb {
//        width: 100%;
//        overflow-x: auto;
//      }
      
//      .hero-content h1 {
//        font-size: 1.5rem;
//      }
      
//      .guide-info {
//        padding: 1.5rem;
//      }
      
//      .day-header {
//        flex-wrap: wrap;
//      }
      
//      .day-line {
//        order: 3;
//        width: 100%;
//      }

//      .card-header {
//        flex-direction: column;
//        text-align: center;
//      }

//      .header-content {
//        flex-direction: column;
//        text-align: center;
//      }

//      .details-grid {
//        grid-template-columns: 1fr;
//      }

//      .card-actions {
//        flex-wrap: wrap;
//        justify-content: center;
//      }

//      .action-btn {
//        flex: 1;
//        justify-content: center;
//      }
//    }
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

//  // NEW: Track edit by activity ID (not just day)
//  editingActivityId: number | null = null;
//  editingActivityData: Activity | null = null;

//  ngOnInit() {
//    this.route.paramMap.subscribe(params => {
//      const id = params.get('id');
//      if (id) {
//        this.loadGuideDetails(id);
//      }
//    });
//  }

//  loadGuideDetails(id: string) {
//    this.guideService.getGuideById(id).subscribe({
//      next: (guide) => {
//        this.guide = guide;
//        if (guide) {
//          this.loadActivities(guide.id);
//        } else {
//          this.router.navigate(['/dashboard']);
//        }
//      },
//      error: (error) => {
//        console.error('Error loading guide:', error);
//        this.router.navigate(['/dashboard']);
//      }
//    });
//  }

//  loadActivities(guideId: string) {
//    this.activityService.getActivitiesForGuide(guideId).subscribe({
//      next: (acts) => {
//        console.log('Activities loaded:', acts);
//        this.activities = acts;
//      },
//      error: (error) => {
//        console.error('Failed to load activities:', error);
//        this.activities = [];
//      }
//    });
//  }

//  getDaysArray(): number[] {
//    if (!this.guide) return [];
//    return Array.from({ length: this.guide.days }, (_, i) => i + 1);
//  }

//  getActivitiesForDay(dayNumber: number): Activity[] {
//    return this.activities.filter(a => a.day === dayNumber);
//  }

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

//  // FIXED: Edit activity - track by ID for inline editing
//  editActivity(activity: Activity) {
//    console.log('📝 EDIT ACTIVITY CALLED:', activity);
//    this.addingActivityForDay = null; // Close any open add form
//    this.editingActivityId = activity.id; // Track by ID
//    this.editingActivityData = activity; // Store the data
//    console.log('📝 editingActivityId set to:', this.editingActivityId);
//  }

//  deleteActivity(activity: Activity) {
//    if (confirm(`Delete "${activity.title}"? This action cannot be undone.`)) {
//      this.activityService.deleteActivity(activity.id).subscribe({
//        next: () => {
//          console.log('Activity deleted successfully');
//          if (this.guide) {
//            this.loadActivities(this.guide.id);
//          }
//        },
//        error: (error) => {
//          console.error('Failed to delete activity:', error);
//          alert(`Failed to delete activity: ${error.error?.message || error.message}`);
//        }
//      });
//    }
//  }

//  // FIXED: Close form and clear edit tracking
//  closeActivityForm(event?: { success?: boolean }) {
//    console.log('🔵 Closing form, event:', event);
//    this.addingActivityForDay = null;
//    this.editingActivityId = null; // Clear by ID
//    this.editingActivityData = null;
//    if (event?.success && this.guide) {
//      console.log('🔵 Reloading activities...');
//      this.loadActivities(this.guide.id);
//    }
//  }
//}
