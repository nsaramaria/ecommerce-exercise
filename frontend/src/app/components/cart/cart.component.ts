import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2 class="mb-4">Your Cart</h2>

    @if (cart.items().length === 0) {
      <div class="alert alert-info">
        Your cart is empty. <a routerLink="/products">Browse products</a>.
      </div>
    } @else {
      <div class="card">
        <table class="table mb-0">
          <thead class="table-light">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th style="width: 150px;">Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (item of cart.items(); track item.product.id) {
              <tr>
                <td>{{ item.product.name }}</td>
                <td>{{ item.product.price | currency:'USD' }}</td>
                <td>
                  <input type="number" class="form-control form-control-sm" min="1"
                         [ngModel]="item.quantity"
                         (ngModelChange)="updateQty(item.product.id, $event)">
                </td>
                <td>{{ item.product.price * item.quantity | currency:'USD' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger"
                          (click)="cart.removeFromCart(item.product.id)">Remove</button>
                </td>
              </tr>
            }
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td colspan="3" class="text-end fw-bold">Total (estimated):</td>
              <td colspan="2" class="fw-bold">{{ cart.displayedTotal() | currency:'USD' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <small class="text-muted d-block mt-2">
        * Final total is calculated and confirmed by the server at checkout.
      </small>

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" (click)="cart.clear()">Clear cart</button>
        <button class="btn btn-success" (click)="proceed()">Proceed to checkout</button>
      </div>
    }
  `
})
export class CartComponent {
  cart = inject(CartService);
  private auth = inject(AuthService);
  private router = inject(Router);

  updateQty(productId: number, quantity: number): void {
    this.cart.updateQuantity(productId, quantity);
  }

  proceed(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
