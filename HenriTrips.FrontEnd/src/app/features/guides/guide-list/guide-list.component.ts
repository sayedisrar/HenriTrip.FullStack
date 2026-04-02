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
        <a routerLink="/dashboard/guides/new" class="btn btn-primary" *ngIf="auth.isAdmin()">
          <span class="material-symbols">add</span> Create Guide
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
              <span class="material-symbols">schedule</span> {{ guide.days }} Days
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
          <button class="btn btn-outline btn-sm action-btn" [routerLink]="['/dashboard/guides', guide.id, 'edit']">
            <span class="material-symbols">edit</span> Edit
          </button>
          <button class="btn btn-outline btn-sm action-btn danger" (click)="deleteGuide(guide.id, $event)">
            <span class="material-symbols">delete</span> Delete
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="filteredGuides.length === 0" class="glass-panel empty-state slide-up">
      <span class="material-symbols" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;">search_off</span>
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
    
    .description {
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .admin-actions {
      display: flex;
      border-top: 1px solid var(--surface-border);
      background: rgba(15, 23, 42, 0.2);
    }

    .action-btn {
      flex: 1;
      border: none;
      border-radius: 0;
      border-right: 1px solid var(--surface-border);
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      background: transparent;
      padding: 1rem;
    }
    
    .action-btn:last-child {
      border-right: none;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .action-btn.danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
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
    this.guideService.getGuides().subscribe(guides => {
      this.guides = guides;
      this.filteredGuides = guides;
      // Re-apply search filter
      this.applyFilter();
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
    event.stopPropagation(); // prevent navigating to guide details
    if (confirm('Are you sure you want to delete this guide and all its activities?')) {
      this.guideService.deleteGuide(id);
      this.loadGuides(); // refresh list
    }
  }
}
