import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <section class="shop">
      <div class="page-container">
        <div class="header fade-up">
          <p class="eyebrow">the lineup</p>
          <h1 class="title">five flavors,<br><em>one</em> obsession.</h1>
          <p class="sub">peptide-rich, hydrating sheers. 0.3 fl oz / 10 ml.</p>
        </div>

        @if (loading()) {
          <div class="loading"><div class="spinner"></div></div>
        } @else if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        } @else {
          <div class="grid">
            @for (p of products(); track p.id; let i = $index) {
              <app-product-card
                [product]="p"
                (added)="onAdded($event)"
                class="fade-up"
                [style.animation-delay.s]="i * 0.06">
              </app-product-card>
            }
          </div>
        }
      </div>
    </section>

    @if (toast()) {
      <div class="toast">✓ {{ toast() }} added to cart</div>
    }
  `,
  styles: [`
    .shop { padding: 60px 0 100px; }
    .header {
      text-align: center;
      margin-bottom: 64px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 16px;
      font-weight: 500;
    }
    .title {
      font-size: clamp(40px, 6vw, 64px);
      line-height: 1;
      margin: 0 0 18px;
    }
    .title em {
      color: var(--accent);
      font-style: italic;
    }
    .sub {
      color: var(--text-muted);
      font-size: 16px;
      margin: 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
    }
    .loading { display: flex; justify-content: center; padding: 60px 0; }

    @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: data => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('couldn\'t load products. is the backend running?');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onAdded(name: string): void {
    this.toast.set(name);
    setTimeout(() => this.toast.set(null), 2200);
  }
}
