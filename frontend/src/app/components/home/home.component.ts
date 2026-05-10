import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';
import { LipstickTubeComponent } from '../lipstick-tube/lipstick-tube.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LipstickTubeComponent, ProductCardComponent],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="page-container hero-grid">
        <div class="hero-text fade-up">
          <p class="eyebrow">peptide lip tints</p>
          <h1 class="headline">
            soft lips,<br>
            <em>softer</em> days.
          </h1>
          <p class="tagline">
            five sheer, hydrating shades. nothing sticky, nothing heavy —
            just the kind of glaze you reapply without thinking.
          </p>
          <div class="hero-ctas">
            <a routerLink="/shop" class="btn btn-primary">shop now</a>
            <a routerLink="/about" class="btn btn-outline">learn more</a>
          </div>
          <div class="reviews">
            <div class="avatars">
              <span class="av" style="background:#E89B8C"></span>
              <span class="av" style="background:#D4A89B"></span>
              <span class="av" style="background:#B85970"></span>
              <span class="av" style="background:#E8B89B"></span>
            </div>
            <span class="reviews-count">12k+ reviews</span>
            <span class="reviews-stars">★★★★★</span>
          </div>
        </div>

        <div class="hero-visual fade-up" style="animation-delay: 0.15s">
          <div class="blob" [style.background]="activeBlobColor()"></div>
          <div class="tubes">
            <div class="tube-side tube-left">
              <app-lipstick-tube [color]="sideLeftColor()" [scale]="0.7"></app-lipstick-tube>
            </div>
            <div class="tube-center">
              <app-lipstick-tube [color]="activeShade().color" [scale]="1.1"></app-lipstick-tube>
            </div>
            <div class="tube-side tube-right">
              <app-lipstick-tube [color]="sideRightColor()" [scale]="0.7"></app-lipstick-tube>
            </div>
          </div>
        </div>
      </div>

      <!-- SHADE SWATCHES -->
      <div class="page-container swatch-row">
        @for (s of shades(); track s.id; let i = $index) {
          <button
            class="swatch"
            [class.active]="activeShade().id === s.id"
            (click)="setActiveShade(i)"
            [attr.aria-label]="'select ' + s.name">
            <span class="dot" [style.background]="s.color"></span>
            <span class="swatch-name">{{ s.shortName }}</span>
          </button>
        }
      </div>
    </section>

    <!-- LINEUP -->
    <section class="lineup">
      <div class="page-container">
        <div class="lineup-head">
          <p class="eyebrow">the lineup</p>
          <h2 class="section-title">
            five flavors,<br>
            one obsession.
          </h2>
        </div>

        @if (loading()) {
          <div class="loading"><div class="spinner"></div></div>
        } @else if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        } @else {
          <div class="grid">
            @for (p of products(); track p.id) {
              <app-product-card
                [product]="p"
                (added)="onAdded($event)"
                class="fade-up">
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
    /* Hero */
    .hero {
      padding: 60px 0 40px;
      background:
        radial-gradient(ellipse at 80% 20%, rgba(232, 155, 140, 0.18) 0%, transparent 50%),
        radial-gradient(ellipse at 20% 80%, rgba(212, 168, 155, 0.15) 0%, transparent 50%),
        var(--bg);
      position: relative;
      overflow: hidden;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      min-height: 540px;
    }

    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 20px;
      font-weight: 500;
    }

    .headline {
      font-size: clamp(48px, 7vw, 88px);
      line-height: 0.95;
      margin: 0 0 24px;
      font-weight: 400;
    }
    .headline em {
      color: var(--accent);
      font-style: italic;
      font-weight: 400;
    }

    .tagline {
      max-width: 460px;
      color: var(--text-muted);
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 32px;
    }

    .hero-ctas {
      display: flex;
      gap: 12px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .reviews {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatars { display: flex; }
    .av {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2.5px solid var(--bg);
      margin-left: -8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .av:first-child { margin-left: 0; }
    .reviews-count {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
    }
    .reviews-stars {
      color: var(--accent);
      font-size: 13px;
      letter-spacing: 1px;
    }

    /* Hero visual */
    .hero-visual {
      position: relative;
      height: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blob {
      position: absolute;
      inset: 50px;
      border-radius: 50%;
      filter: blur(50px);
      opacity: 0.6;
      transition: background 0.6s ease;
      animation: blob-pulse 8s ease-in-out infinite;
    }

    @keyframes blob-pulse {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.05) rotate(8deg); }
    }

    .tubes {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      z-index: 1;
    }

    .tube-side {
      animation: float-side 5s ease-in-out infinite;
    }
    .tube-left { animation-delay: -2s; transform: rotate(-12deg); }
    .tube-right { transform: rotate(12deg); }
    .tube-center {
      animation: float-center 4s ease-in-out infinite;
      z-index: 2;
    }

    @keyframes float-center {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    @keyframes float-side {
      0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
      50% { transform: translateY(-8px) rotate(var(--r, 0deg)); }
    }
    .tube-left { --r: -12deg; }
    .tube-right { --r: 12deg; }

    /* Swatch row */
    .swatch-row {
      display: flex;
      justify-content: center;
      gap: 28px;
      margin-top: 48px;
      flex-wrap: wrap;
    }
    .swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: transparent;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .swatch:hover { transform: translateY(-2px); }

    .dot {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      box-shadow:
        inset -2px -2px 4px rgba(0,0,0,0.15),
        inset 2px 2px 4px rgba(255,255,255,0.3),
        0 4px 10px rgba(58, 42, 38, 0.15);
      transition: transform 0.2s ease, box-shadow 0.3s ease;
    }
    .swatch.active .dot {
      transform: scale(1.18);
      box-shadow:
        inset -2px -2px 4px rgba(0,0,0,0.15),
        inset 2px 2px 4px rgba(255,255,255,0.3),
        0 0 0 2px var(--bg),
        0 0 0 3px var(--text),
        0 6px 14px rgba(58, 42, 38, 0.2);
    }

    .swatch-name {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: lowercase;
      color: var(--text-muted);
      font-weight: 500;
    }
    .swatch.active .swatch-name {
      color: var(--text);
      font-style: italic;
      font-family: var(--font-serif);
      letter-spacing: 0;
    }

    /* Lineup */
    .lineup {
      background: white;
      padding: 100px 0;
      margin-top: 40px;
    }
    .lineup-head {
      text-align: center;
      margin-bottom: 60px;
    }
    .section-title {
      font-size: clamp(36px, 5vw, 56px);
      line-height: 1;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; gap: 40px; min-height: auto; }
      .hero-visual { height: 420px; order: -1; }
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .swatch-row { gap: 16px; }
      .dot { width: 28px; height: 28px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cart = inject(CartService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);

  // Shade list shown under hero. Keeps independent shortName.
  shades = signal([
    { id: 1, name: 'Vanilla Glaze',    shortName: 'vanilla',    color: '#D4A89B', blob: 'rgba(212, 168, 155, 0.7)' },
    { id: 2, name: 'Strawberry Glaze', shortName: 'strawberry', color: '#E89B8C', blob: 'rgba(232, 155, 140, 0.7)' },
    { id: 3, name: 'Espresso Glaze',   shortName: 'espresso',   color: '#C97A6E', blob: 'rgba(201, 122, 110, 0.7)' },
    { id: 4, name: 'Raspberry Jelly',  shortName: 'raspberry',  color: '#B85970', blob: 'rgba(184, 89, 112, 0.6)' },
    { id: 5, name: 'Peach Fuzz',       shortName: 'peach',      color: '#E8B89B', blob: 'rgba(232, 184, 155, 0.7)' }
  ]);

  activeIndex = signal(0);
  activeShade = computed(() => this.shades()[this.activeIndex()]);
  activeBlobColor = computed(() => this.activeShade().blob);
  sideLeftColor = computed(() => {
    const list = this.shades();
    const i = (this.activeIndex() - 1 + list.length) % list.length;
    return list[i].color;
  });
  sideRightColor = computed(() => {
    const list = this.shades();
    const i = (this.activeIndex() + 1) % list.length;
    return list[i].color;
  });

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

  setActiveShade(index: number): void {
    this.activeIndex.set(index);
  }

  onAdded(name: string): void {
    this.toast.set(name);
    setTimeout(() => this.toast.set(null), 2200);
  }
}
