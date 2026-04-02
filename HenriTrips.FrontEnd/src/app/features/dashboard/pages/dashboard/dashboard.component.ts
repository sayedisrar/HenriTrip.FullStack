import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
      <router-outlet></router-outlet>
    </main>
  `
})
export class DashboardComponent {}
