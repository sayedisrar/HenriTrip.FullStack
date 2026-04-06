import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ConnectionService } from '../../core/services/connection.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="glass-panel" style="border-radius: 0; border-bottom-width: 1px; border-top: none; border-left: none; border-right: none;">
      <div class="container header-content">
        <div class="header-left">
          <div class="logo fade-in" routerLink="/dashboard" style="cursor: pointer;">
            <h2>Henri Trips</h2>
            <span class="badge badge-primary" *ngIf="auth.isAdmin()">Admin</span>
          </div>
          
          <nav class="nav-links" *ngIf="auth.isAdmin()">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Guides</a>
            <a routerLink="/dashboard/users" routerLinkActive="active">Users</a>
          </nav>
        </div>
        
        <div class="user-actions">
          <!-- OFFLINE STATUS INDICATOR -->
          <div class="offline-indicator" *ngIf="!connectionService.isOnline()">
            <span class="offline-dot"></span>
            <span class="offline-text">Offline Mode</span>
          </div>
          
          <!-- RECONNECTED MESSAGE -->
          <div class="reconnected-toast" *ngIf="connectionService.wasOffline() && connectionService.isOnline()">
            <span>✅ Connection restored!</span>
          </div>
          
          <span class="user-name">{{ auth.currentUser()?.name }}</span>
          <button class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 3rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo h2 {
      margin: 0;
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--text-main), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      position: relative;
      padding-bottom: 0.5rem;
      transition: color 0.2s;
    }
    .nav-links a:hover {
      color: var(--text-main);
    }
    .nav-links a.active {
      color: var(--primary);
    }
    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
    }
    
    .user-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }
    
    /* OFFLINE INDICATOR STYLES */
    .offline-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(245, 158, 11, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    .offline-dot {
      width: 8px;
      height: 8px;
      background-color: #f59e0b;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    
    .offline-text {
      font-size: 0.75rem;
      font-weight: 500;
      color: #fbbf24;
    }
    
    /* RECONNECTED TOAST */
    .reconnected-toast {
      position: absolute;
      top: -40px;
      right: 0;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.75rem;
      animation: slideDown 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      white-space: nowrap;
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
    
    @keyframes fadeOut {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }
    
    .user-name {
      font-weight: 500;
      color: var(--text-muted);
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    @media (max-width: 768px) {
      .header-left { gap: 1rem; flex-direction: column; align-items: flex-start; }
      .nav-links { margin-top: 0.5rem; }
      .reconnected-toast { white-space: normal; font-size: 0.7rem; top: -50px; right: -20px; }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  connectionService = inject(ConnectionService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

//import { Component, inject } from '@angular/core';
//import { Router, RouterModule } from '@angular/router';
//import { CommonModule } from '@angular/common';
//import { AuthService } from '../../core/services/auth.service';

//@Component({
//  selector: 'app-header',
//  standalone: true,
//  imports: [CommonModule, RouterModule],
//  template: `
//    <header class="glass-panel" style="border-radius: 0; border-bottom-width: 1px; border-top: none; border-left: none; border-right: none;">
//      <div class="container header-content">
//        <div class="header-left">
//          <div class="logo fade-in" routerLink="/dashboard" style="cursor: pointer;">
//            <h2>Henri Trips</h2>
//            <span class="badge badge-primary" *ngIf="auth.isAdmin()">Admin</span>
//          </div>
          
//          <nav class="nav-links" *ngIf="auth.isAdmin()">
//            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Guides</a>
//            <a routerLink="/dashboard/users" routerLinkActive="active">Users</a>
//          </nav>
//        </div>
        
//        <div class="user-actions">
//          <span class="user-name">{{ auth.currentUser()?.name }}</span>
//          <button class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
//        </div>
//      </div>
//    </header>
//  `,
//  styles: [`
//    .header-content {
//      display: flex;
//      justify-content: space-between;
//      align-items: center;
//      padding-top: 1rem;
//      padding-bottom: 1rem;
//    }
//    .header-left {
//      display: flex;
//      align-items: center;
//      gap: 3rem;
//    }
//    .logo {
//      display: flex;
//      align-items: center;
//      gap: 1rem;
//    }
//    .logo h2 {
//      margin: 0;
//      font-size: 1.5rem;
//      background: linear-gradient(135deg, var(--text-main), var(--primary));
//      -webkit-background-clip: text;
//      -webkit-text-fill-color: transparent;
//    }
    
//    .nav-links {
//      display: flex;
//      gap: 1.5rem;
//    }
//    .nav-links a {
//      color: var(--text-muted);
//      text-decoration: none;
//      font-weight: 500;
//      position: relative;
//      padding-bottom: 0.5rem;
//      transition: color 0.2s;
//    }
//    .nav-links a:hover {
//      color: var(--text-main);
//    }
//    .nav-links a.active {
//      color: var(--primary);
//    }
//    .nav-links a.active::after {
//      content: '';
//      position: absolute;
//      bottom: 0;
//      left: 0;
//      right: 0;
//      height: 2px;
//      background: var(--primary);
//      border-radius: 2px;
//    }
    
//    .user-actions {
//      display: flex;
//      align-items: center;
//      gap: 1.5rem;
//    }
//    .user-name {
//      font-weight: 500;
//      color: var(--text-muted);
//    }
//    .btn-sm {
//      padding: 0.5rem 1rem;
//      font-size: 0.875rem;
//    }
//    @media (max-width: 768px) {
//      .header-left { gap: 1rem; flex-direction: column; align-items: flex-start; }
//      .nav-links { margin-top: 0.5rem; }
//    }
//  `]
//})
//export class HeaderComponent {
//  auth = inject(AuthService);
//  private router = inject(Router);

//  logout() {
//    this.auth.logout();
//    this.router.navigate(['/login']);
//  }
//}
