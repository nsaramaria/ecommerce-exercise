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
    <h2 class="mb-4">Checkout</h2>

    @if (orderResult(); as order) {
      <div class="alert alert-success">
        <h4>✓ Order placed successfully!</h4>
        <p>Order #{{ order.orderId }} — Total confirmed by server:
           <strong>{{ order.totalAmount | currency:'USD' }}</strong></p>
        <a routerLink="/products" class="btn btn-primary btn-sm">Continue shopping</a>
      </div>
    } @else if (cart.items().length === 0) {
      <div class="alert alert-warning">
        Your cart is empty. <a routerLink="/products">Add some products first</a>.
      </div>
    } @else {
      <div class="row">
        <div class="col-md-7">
          <div class="card">
            <div class="card-body">
              <h5>Shipping address</h5>
              <form #form="ngForm" (ngSubmit)="placeOrder(form)">
                <div class="mb-3">
                  <label class="form-label">Address</label>
                  <input class="form-control" name="shippingAddress"
                         [(ngModel)]="model.shippingAddress" required>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">City</label>
                    <input class="form-control" name="city" [(ngModel)]="model.city" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Country</label>
                    <input class="form-control" name="country" [(ngModel)]="model.country" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Zip code</label>
                  <input class="form-control" name="zipCode" [(ngModel)]="model.zipCode" required>
                </div>

                @if (errorMessage()) {
                  <div class="alert alert-danger">{{ errorMessage() }}</div>
                }

                <button type="submit" class="btn btn-success" [disabled]="!form.valid || submitting()">
                  {{ submitting() ? 'Placing order...' : 'Place Order' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="card">
            <div class="card-body">
              <h5>Order summary</h5>
              <ul class="list-unstyled">
                @for (item of cart.items(); track item.product.id) {
                  <li class="d-flex justify-content-between mb-1">
                    <span>{{ item.product.name }} × {{ item.quantity }}</span>
                    <span>{{ item.product.price * item.quantity | currency:'USD' }}</span>
                  </li>
                }
              </ul>
              <hr>
              <div class="d-flex justify-content-between fw-bold">
                <span>Estimated total:</span>
                <span>{{ cart.displayedTotal() | currency:'USD' }}</span>
              </div>
              <small class="text-muted">Server will recalculate the final total.</small>
            </div>
          </div>
        </div>
      </div>
    }
  `
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
        this.errorMessage.set(err.error?.message ?? 'Failed to place order. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}
