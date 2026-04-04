import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GuideService, Guide } from '../../../core/services/guide.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-guide-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="guide-list-header slide-up">
      <div>
        <h1 style="margin-bottom: 0.5rem;">Available Guides</h1>
        <p>Select a guide to view detailed itineraries and activities.</p>
      </div>
      
      <div class="actions-group">
        <div class="search-box">
          <input type="text" class="form-control" placeholder="Search guides..." (input)="onSearch($event)">
        </div>
        <a routerLink="/dashboard/guides/new" class="btn-primary" *ngIf="auth.isAdmin()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Create Guide
        </a>
      </div>
    </div>

    <div class="guides-grid">
      <div *ngFor="let guide of filteredGuides; let i = index" 
           class="glass-card guide-card slide-up" 
           [style.animation-delay]="i * 0.1 + 's'">
        
        <div class="guide-card-content" [routerLink]="['/dashboard/guides', guide.id]">
          <div class="guide-image" [style.background-image]="'url(' + (guide.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14ebb40?auto=format&fit=crop&q=80&w=600') + ')'">
            <div class="guide-duration">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ guide.days }} Days
            </div>
          </div>
          
          <div class="guide-content">
            <h3>{{ guide.title }}</h3>
            <p class="description">{{ guide.description }}</p>
            
            <div class="tags">
              <span class="badge badge-primary" *ngFor="let mod of guide.mobility">{{ mod }}</span>
              <span class="badge badge-success" *ngFor="let target of guide.targetAudience">{{ target }}</span>
            </div>
          </div>
        </div>

        <div class="admin-actions" *ngIf="auth.isAdmin()">
          <button class="btn-edit" [routerLink]="['/dashboard/guides', guide.id, 'edit']">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
              <path d="M4 20h16"/>
            </svg>
            Edit
          </button>
          <button class="btn-delete" (click)="deleteGuide(guide.id, $event)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/>
              <path d="M9 3h6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="filteredGuides.length === 0" class="glass-panel empty-state slide-up">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 1rem;">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h3>No guides found</h3>
      <p>Try adjusting your search criteria or contact an admin if you believe you should have access.</p>
    </div>
  `,
  styles: [`
    .guide-list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 3rem;
      gap: 2rem;
      flex-wrap: wrap;
    }
    
    .actions-group {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex: 1;
      justify-content: flex-end;
    }

    .search-box {
      max-width: 300px;
      min-width: 250px;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    /* Master Primary Button */
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
      border: none;
      cursor: pointer;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px var(--primary);
    }
    
    .guides-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    
    .guide-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .guide-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.3);
    }
    
    .guide-card-content {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .guide-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .guide-duration {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .guide-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .guide-content h3 {
      margin-bottom: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .description {
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
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

    /* Master Admin Actions Buttons */
    .admin-actions {
      display: flex;
      border-top: 1px solid var(--surface-border);
      background: rgba(15, 23, 42, 0.2);
    }

    .btn-edit, .btn-delete {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      background: transparent;
      text-decoration: none;
    }
    
    .btn-edit {
      color: #60a5fa;
      border-right: 1px solid var(--surface-border);
    }

    .btn-edit:hover {
      background: rgba(96, 165, 250, 0.1);
    }
    
    .btn-delete {
      color: #f87171;
    }

    .btn-delete:hover {
      background: rgba(248, 113, 113, 0.1);
    }

    /* Empty State */
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }

    .empty-state p {
      color: var(--text-muted);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .guide-list-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .actions-group {
        justify-content: stretch;
      }
      
      .search-box {
        max-width: none;
        min-width: auto;
      }
      
      .guides-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GuideListComponent implements OnInit {
  private guideService = inject(GuideService);
  auth = inject(AuthService);

  guides: Guide[] = [];
  filteredGuides: Guide[] = [];
  searchQuery = '';

  ngOnInit() {
    this.loadGuides();
  }

  loadGuides() {
    this.guideService.getGuides().subscribe({
      next: (guides) => {
        this.guides = guides;
        this.filteredGuides = guides;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading guides:', error);
      }
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value.toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredGuides = this.guides;
      return;
    }

    this.filteredGuides = this.guides.filter(g =>
      g.title.toLowerCase().includes(this.searchQuery) ||
      g.description.toLowerCase().includes(this.searchQuery)
    );
  }

  deleteGuide(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this guide and all its activities?')) {
      this.guideService.deleteGuide(id).subscribe({
        next: () => {
          this.loadGuides();
        },
        error: (error) => {
          console.error('Error deleting guide:', error);
          alert('Failed to delete guide. Please try again.');
        }
      });
    }
  }
}
