import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LipstickTubeComponent } from '../lipstick-tube/lipstick-tube.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LipstickTubeComponent],
  template: `
    <section class="cart-page">
      <div class="page-container">
        <header class="header fade-up">
          <p class="eyebrow">your bag</p>
          <h1 class="title">a few <em>good</em> things.</h1>
        </header>

        @if (cart.items().length === 0) {
          <div class="empty fade-up">
            <p class="empty-line">your bag is empty.</p>
            <a routerLink="/shop" class="btn btn-primary">browse the lineup</a>
          </div>
        } @else {
          <div class="cart-grid fade-up">
            <!-- Items -->
            <div class="items">
              @for (item of cart.items(); track item.product.id) {
                <article class="item">
                  <div class="thumb" [style.background]="item.product.cardBgColor">
                    <app-lipstick-tube [color]="item.product.tubeColor" [scale]="0.55"></app-lipstick-tube>
                  </div>
                  <div class="info">
                    <h3 class="name">{{ item.product.name | lowercase }}</h3>
                    <p class="desc">{{ item.product.description }}</p>
                    <button class="remove" (click)="cart.removeFromCart(item.product.id)">remove</button>
                  </div>
                  <div class="qty">
                    <button class="qty-btn" (click)="dec(item.product.id, item.quantity)" aria-label="decrease">−</button>
                    <span class="qty-num">{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="inc(item.product.id, item.quantity)" aria-label="increase">+</button>
                  </div>
                  <div class="line-total">
                    {{ item.product.price * item.quantity | currency:'USD':'symbol':'1.0-0' }}
                  </div>
                </article>
              }
            </div>

            <!-- Summary -->
            <aside class="summary">
              <div class="summary-card">
                <h2 class="summary-title">summary</h2>
                <div class="row">
                  <span>subtotal</span>
                  <span>{{ cart.displayedTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <div class="row">
                  <span>shipping</span>
                  <span class="muted-italic">calculated at checkout</span>
                </div>
                <div class="divider"></div>
                <div class="row total">
                  <span>total <span class="est">(estimated)</span></span>
                  <span>{{ cart.displayedTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <p class="note">final total is confirmed by the server at checkout.</p>
                <button class="btn btn-primary checkout-btn" (click)="proceed()">
                  proceed to checkout
                </button>
                <button class="btn btn-ghost clear-btn" (click)="cart.clear()">clear bag</button>
              </div>
            </aside>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .cart-page { padding: 60px 0 100px; }

    .header { text-align: center; margin-bottom: 56px; }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 14px;
      font-weight: 500;
    }
    .title {
      font-size: clamp(40px, 6vw, 60px);
      line-height: 1;
      margin: 0;
    }
    .title em { color: var(--accent); font-style: italic; }

    /* Empty */
    .empty {
      text-align: center;
      padding: 60px 0;
    }
    .empty-line {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 22px;
      color: var(--text-muted);
      margin: 0 0 24px;
    }

    /* Grid */
    .cart-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 40px;
      align-items: start;
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item {
      background: var(--surface);
      border-radius: var(--radius-card);
      padding: 18px;
      display: grid;
      grid-template-columns: 90px 1fr auto auto;
      align-items: center;
      gap: 20px;
      transition: box-shadow 0.2s ease;
    }
    .item:hover { box-shadow: var(--shadow-sm); }

    .thumb {
      width: 90px;
      height: 90px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .name {
      font-family: var(--font-serif);
      font-size: 18px;
      margin: 0 0 2px;
    }
    .desc {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 13px;
      color: var(--text-muted);
      margin: 0 0 8px;
    }
    .remove {
      font-size: 12px;
      color: var(--text-muted);
      text-decoration: underline;
      text-underline-offset: 3px;
      padding: 0;
    }
    .remove:hover { color: var(--accent); }

    .qty {
      display: flex;
      align-items: center;
      gap: 4px;
      background: white;
      padding: 4px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border);
    }
    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: var(--text);
      font-size: 16px;
      transition: background 0.15s;
    }
    .qty-btn:hover { background: var(--surface); }
    .qty-num {
      min-width: 24px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }

    .line-total {
      font-size: 16px;
      font-weight: 500;
      min-width: 60px;
      text-align: right;
    }

    /* Summary */
    .summary { position: sticky; top: 96px; }
    .summary-card {
      background: var(--surface);
      border-radius: var(--radius-card);
      padding: 28px;
    }
    .summary-title {
      font-family: var(--font-serif);
      font-size: 22px;
      margin: 0 0 20px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
      color: var(--text-muted);
    }
    .row.total {
      font-size: 18px;
      color: var(--text);
      font-weight: 500;
    }
    .est {
      font-style: italic;
      font-family: var(--font-serif);
      font-weight: 400;
      color: var(--text-muted);
      font-size: 13px;
    }
    .muted-italic { font-style: italic; font-family: var(--font-serif); }
    .divider {
      height: 1px;
      background: var(--border);
      margin: 12px 0;
    }
    .note {
      font-size: 12px;
      color: var(--text-muted);
      font-style: italic;
      font-family: var(--font-serif);
      margin: 12px 0 18px;
      text-align: center;
    }
    .checkout-btn { width: 100%; }
    .clear-btn { width: 100%; margin-top: 8px; }

    @media (max-width: 768px) {
      .cart-grid { grid-template-columns: 1fr; }
      .summary { position: static; }
      .item { grid-template-columns: 70px 1fr; gap: 14px; }
      .item .qty, .item .line-total { grid-column: 1 / -1; justify-self: end; }
      .thumb { width: 70px; height: 70px; }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  private auth = inject(AuthService);
  private router = inject(Router);

  inc(id: number, current: number): void {
    this.cart.updateQuantity(id, current + 1);
  }
  dec(id: number, current: number): void {
    this.cart.updateQuantity(id, current - 1);
  }

  proceed(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
