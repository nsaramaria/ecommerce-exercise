import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="nav-wrap">
      <div class="page-container nav">
        <a routerLink="/" class="logo">
          <span class="logo-mark">g</span>
          <span class="logo-name">glow</span>
        </a>

        <nav class="nav-links">
          <a routerLink="/shop" routerLinkActive="active">shop</a>
          <a routerLink="/about" routerLinkActive="active">about</a>
          <a routerLink="/journal" routerLinkActive="active">journal</a>
        </nav>

        <div class="nav-right">
          @if (auth.isLoggedIn()) {
            <span class="hi">hi, {{ auth.currentUser()?.firstName?.toLowerCase() }}</span>
            <button class="btn-text" (click)="logout()">log out</button>
          } @else {
            <a routerLink="/login" class="btn-text">log in</a>
            <a routerLink="/register" class="btn-text">sign up</a>
          }
          <a routerLink="/cart" class="cart-pill" aria-label="cart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>cart</span>
            @if (cart.itemCount() > 0) {
              <span class="count">{{ cart.itemCount() }}</span>
            }
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nav-wrap {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(244, 237, 228, 0.85);
      backdrop-filter: saturate(140%) blur(12px);
      -webkit-backdrop-filter: saturate(140%) blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }

    .logo {
      display: flex;
      align-items: baseline;
      gap: 4px;
      text-decoration: none;
    }

    .logo-mark {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 500;
      font-size: 28px;
      color: var(--accent);
      line-height: 1;
    }

    .logo-name {
      font-family: var(--font-serif);
      font-weight: 500;
      font-size: 20px;
      color: var(--text);
      letter-spacing: -0.02em;
    }

    .nav-links {
      display: flex;
      gap: 32px;
    }

    .nav-links a {
      color: var(--text-muted);
      font-size: 14px;
      letter-spacing: 0.01em;
      position: relative;
      padding: 4px 0;
    }

    .nav-links a:hover { color: var(--text); }
    .nav-links a.active { color: var(--text); }
    .nav-links a.active::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -2px;
      width: 4px;
      height: 4px;
      background: var(--accent);
      border-radius: 50%;
      transform: translateX(-50%);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .hi {
      font-size: 13px;
      color: var(--text-muted);
      font-style: italic;
      font-family: var(--font-serif);
    }

    .btn-text {
      font-size: 13px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 0;
    }
    .btn-text:hover { color: var(--accent); }

    .cart-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      background: var(--text);
      color: var(--bg);
      border-radius: var(--radius-pill);
      font-size: 13px;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .cart-pill:hover {
      background: var(--accent);
      color: white;
      transform: translateY(-1px);
    }
    .cart-pill .count {
      background: var(--accent);
      color: white;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pop {
      0% { transform: scale(0.5); }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hi, .btn-text { display: none; }
      .cart-pill .count { font-size: 10px; }
    }
  `]
})
export class NavbarComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
