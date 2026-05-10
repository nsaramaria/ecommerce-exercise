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
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <a class="navbar-brand" routerLink="/products">🛒 ECommerce</a>
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link" routerLink="/products" routerLinkActive="active">Products</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/cart" routerLinkActive="active">
            Cart
            @if (cart.itemCount() > 0) {
              <span class="badge bg-danger cart-badge">{{ cart.itemCount() }}</span>
            }
          </a>
        </li>
      </ul>
      <ul class="navbar-nav">
        @if (auth.isLoggedIn()) {
          <li class="nav-item">
            <span class="navbar-text me-3">Hello, {{ auth.currentUser()?.firstName }}</span>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
          </li>
        } @else {
          <li class="nav-item">
            <a class="nav-link" routerLink="/login">Login</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/register">Register</a>
          </li>
        }
      </ul>
    </nav>
  `
})
export class NavbarComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/products']);
  }
}
