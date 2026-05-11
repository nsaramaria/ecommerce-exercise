import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';
import { ProductImageComponent } from '../product-image/product-image.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ProductImageComponent],
  template: `
    <article class="card">
      <div class="visual" [style.background]="product.cardBgColor">
        <div class="img-frame">
          <app-product-image
            [imageUrl]="product.imageUrl"
            [fallbackColor]="product.tubeColor"
            [alt]="product.name"
            [height]="220"
            [scale]="0.85"></app-product-image>
        </div>
      </div>
      <div class="meta">
        <h3 class="name">{{ product.name | lowercase }}</h3>
        <p class="desc">{{ product.description }}</p>
        <div class="bottom-row">
          <span class="price">{{ product.price | currency:'USD':'symbol':'1.0-0' }}</span>
          <button class="add"
                  (click)="add()"
                  [disabled]="product.stockQuantity === 0"
                  [class.added]="justAdded"
                  [attr.aria-label]="'add ' + product.name + ' to cart'">
            @if (justAdded) {
              <span>added</span>
              <span class="check">✓</span>
            } @else if (product.stockQuantity === 0) {
              <span>sold out</span>
            } @else {
              <span>add</span>
              <span class="plus">+</span>
            }
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .card {
      background: var(--surface);
      border-radius: var(--radius-card);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      padding: 0;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
    }
    .card:hover .img-frame { transform: rotate(-4deg) scale(1.04); }

    .visual {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
      overflow: hidden;
    }
    .img-frame { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

    .meta { padding: 22px 24px 24px; }
    .name {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 400;
      letter-spacing: -0.01em;
      margin: 0 0 4px;
    }
    .desc {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 18px;
    }
    .bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price { font-size: 18px; font-weight: 500; letter-spacing: -0.01em; }
    .add {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      background: var(--text);
      color: var(--bg);
      border-radius: var(--radius-pill);
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s ease, transform 0.15s ease;
    }
    .add:hover:not(:disabled) {
      background: var(--accent);
      transform: scale(1.05);
    }
    .add:disabled {
      background: var(--text-muted);
      cursor: not-allowed;
    }
    .add.added { background: var(--accent); }
    .plus { font-size: 16px; line-height: 0; margin-top: -2px; }
    .check { font-size: 12px; }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() added = new EventEmitter<string>();

  private cart = inject(CartService);
  justAdded = false;

  add(): void {
    this.cart.addToCart(this.product);
    this.added.emit(this.product.name);
    this.justAdded = true;
    setTimeout(() => this.justAdded = false, 1400);
  }
}
