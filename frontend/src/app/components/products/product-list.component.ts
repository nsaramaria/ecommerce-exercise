import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="mb-4">Products</h2>

    @if (loading()) {
      <div class="text-center py-5"><div class="spinner-border"></div></div>
    } @else if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    } @else {
      <div class="row g-3">
        @for (product of products(); track product.id) {
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 product-card">
              <img [src]="product.imageUrl" [alt]="product.name"
                   onerror="this.src='https://via.placeholder.com/220?text=No+Image'">
              <div class="card-body d-flex flex-column">
                <h6 class="card-title">{{ product.name }}</h6>
                <small class="text-muted">{{ product.brand }} — {{ product.category }}</small>
                <p class="mt-2 mb-3 fw-bold">{{ product.price | currency:'USD' }}</p>
                <button class="btn btn-primary btn-sm mt-auto"
                        (click)="addToCart(product)"
                        [disabled]="product.stockQuantity === 0">
                  {{ product.stockQuantity === 0 ? 'Out of stock' : 'Add to cart' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }

    @if (justAdded()) {
      <div class="toast show position-fixed bottom-0 end-0 m-3 bg-success text-white">
        <div class="toast-body">✓ Added "{{ justAdded() }}" to cart</div>
      </div>
    }
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cart = inject(CartService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  justAdded = signal<string | null>(null);

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: data => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load products. Make sure the backend is running.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  addToCart(product: Product): void {
    this.cart.addToCart(product);
    this.justAdded.set(product.name);
    setTimeout(() => this.justAdded.set(null), 2000);
  }
}
