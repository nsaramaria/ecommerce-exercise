import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer class="site-footer">
      <div class="page-container">
        <p>© {{ year }} glow — peptide lip tints</p>
        <p class="footer-meta">made with care, never tested on the wrong people</p>
      </div>
    </footer>
  `,
  styles: [`
    main { min-height: calc(100vh - 220px); }
    .site-footer {
      padding: 60px 0 40px;
      margin-top: 80px;
      background: var(--text);
      color: var(--bg);
      font-size: 13px;
    }
    .site-footer p { margin: 4px 0; }
    .footer-meta { color: var(--accent-soft); font-style: italic; font-family: var(--font-serif); }
  `]
})
export class AppComponent {
  year = new Date().getFullYear();
}
