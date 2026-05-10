import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { OrderResponse } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="checkout-page">
      <div class="page-container">
        @if (orderResult(); as order) {
          <div class="success-card fade-up">
            <div class="check">✓</div>
            <h1 class="success-title">order placed.</h1>
            <p class="success-line">
              order #{{ order.orderId }} — total confirmed by server:
              <em>{{ order.totalAmount | currency:'USD':'symbol':'1.2-2' }}</em>
            </p>
            <a routerLink="/shop" class="btn btn-primary">keep shopping</a>
          </div>
        } @else if (cart.items().length === 0) {
          <div class="empty fade-up">
            <p class="empty-line">your bag is empty.</p>
            <a routerLink="/shop" class="btn btn-primary">browse the lineup</a>
          </div>
        } @else {
          <header class="header fade-up">
            <p class="eyebrow">checkout</p>
            <h1 class="title">where to?</h1>
          </header>

          <div class="checkout-grid fade-up">
            <div class="form-card">
              <h2 class="form-title">shipping address</h2>
              <form #form="ngForm" (ngSubmit)="placeOrder(form)">
                <div class="field">
                  <label>address</label>
                  <input name="shippingAddress" [(ngModel)]="model.shippingAddress" required>
                </div>
                <div class="row-2">
                  <div class="field">
                    <label>city</label>
                    <input name="city" [(ngModel)]="model.city" required>
                  </div>
                  <div class="field">
                    <label>country</label>
                    <input name="country" [(ngModel)]="model.country" required>
                  </div>
                </div>
                <div class="field">
                  <label>zip code</label>
                  <input name="zipCode" [(ngModel)]="model.zipCode" required>
                </div>

                @if (errorMessage()) {
                  <div class="alert alert-error">{{ errorMessage() }}</div>
                }

                <button type="submit" class="btn btn-primary place-btn"
                        [disabled]="!form.valid || submitting()">
                  {{ submitting() ? 'placing order…' : 'place order' }}
                </button>
              </form>
            </div>

            <aside class="summary-card">
              <h2 class="form-title">your bag</h2>
              <ul class="lines">
                @for (item of cart.items(); track item.product.id) {
                  <li>
                    <span class="line-name">{{ item.product.name | lowercase }} × {{ item.quantity }}</span>
                    <span>{{ item.product.price * item.quantity | currency:'USD':'symbol':'1.0-0' }}</span>
                  </li>
                }
              </ul>
              <div class="divider"></div>
              <div class="row total">
                <span>estimated total</span>
                <span>{{ cart.displayedTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              <p class="note">server will recalculate the final total.</p>
            </aside>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .checkout-page { padding: 60px 0 100px; }

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

    .checkout-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 32px;
      align-items: start;
    }

    .form-card, .summary-card {
      background: var(--surface);
      border-radius: var(--radius-card);
      padding: 32px;
    }
    .summary-card { position: sticky; top: 96px; }

    .form-title {
      font-family: var(--font-serif);
      font-size: 22px;
      margin: 0 0 20px;
    }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .place-btn { width: 100%; margin-top: 12px; }

    .lines {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
    }
    .lines li {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
      color: var(--text-muted);
    }
    .line-name { font-family: var(--font-serif); }
    .divider { height: 1px; background: var(--border); margin: 8px 0 12px; }
    .row.total {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 500;
    }
    .note {
      margin: 14px 0 0;
      font-size: 12px;
      font-style: italic;
      font-family: var(--font-serif);
      color: var(--text-muted);
      text-align: center;
    }

    .empty {
      text-align: center;
      padding: 80px 0;
    }
    .empty-line {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 22px;
      color: var(--text-muted);
      margin: 0 0 24px;
    }

    /* Success */
    .success-card {
      max-width: 540px;
      margin: 80px auto;
      background: var(--surface);
      padding: 56px 40px;
      border-radius: var(--radius-card);
      text-align: center;
    }
    .check {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .success-title {
      font-size: 40px;
      margin: 0 0 12px;
    }
    .success-line {
      color: var(--text-muted);
      margin: 0 0 28px;
    }
    .success-line em {
      color: var(--text);
      font-family: var(--font-serif);
      font-size: 20px;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .summary-card { position: static; }
      .row-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService);
  private checkoutService = inject(CheckoutService);

  model = { shippingAddress: '', city: '', country: '', zipCode: '' };
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  orderResult = signal<OrderResponse | null>(null);

  placeOrder(form: NgForm): void {
    if (!form.valid) return;
    this.submitting.set(true);
    this.errorMessage.set(null);

    const request = {
      ...this.model,
      items: this.cart.items().map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      }))
    };

    this.checkoutService.checkout(request).subscribe({
      next: (order) => {
        this.orderResult.set(order);
        this.cart.clear();
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'failed to place order. please try again.');
        this.submitting.set(false);
      }
    });
  }
}
