import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';
import { ProductImageComponent } from '../product-image/product-image.component';
import { ProductCardComponent } from '../product-card/product-card.component';

interface Shade {
  id: number;
  name: string;
  shortName: string;
  color: string;
  blob: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductImageComponent, ProductCardComponent],
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
              <span class="av" style="background:#F4C4C9"></span>
              <span class="av" style="background:#D4A89B"></span>
              <span class="av" style="background:#B85970"></span>
              <span class="av" style="background:#E8B8D4"></span>
            </div>
            <span class="reviews-count">12k+ reviews</span>
            <span class="reviews-stars">★★★★★</span>
          </div>
        </div>

        <div class="hero-visual fade-up" style="animation-delay: 0.15s">
          <div class="blob" [style.background]="activeBlobColor()"></div>
          <div class="tubes">
            <div class="tube-side tube-left">
              <app-product-image
                [imageUrl]="sideLeftShade().image"
                [fallbackColor]="sideLeftShade().color"
                [alt]="sideLeftShade().name"
                [height]="200"
                [scale]="0.7"></app-product-image>
            </div>
            <div class="tube-center">
              <app-product-image
                [imageUrl]="activeShade().image"
                [fallbackColor]="activeShade().color"
                [alt]="activeShade().name"
                [height]="320"
                [scale]="1.1"></app-product-image>
            </div>
            <div class="tube-side tube-right">
              <app-product-image
                [imageUrl]="sideRightShade().image"
                [fallbackColor]="sideRightShade().color"
                [alt]="sideRightShade().name"
                [height]="200"
                [scale]="0.7"></app-product-image>
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

    <!-- Painted "drip" edge between hero and lineup.
         Cream pours DOWN from hero into white lineup. Animates with scroll. -->
    <div class="drip-divider">
      <svg #dripSvg preserveAspectRatio="none" viewBox="0 0 1200 80" aria-hidden="true">
        <path #dripPath fill="var(--bg)"></path>
      </svg>
    </div>

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
    /* Hero — flat cream background so the drip below blends seamlessly. */
    .hero {
      padding: 60px 0 40px;
      background: var(--bg);
      position: relative;
      overflow: hidden;
    }

    /* Drip divider — same flat cream fill, no gradient. */
    .drip-divider {
      display: block;
      width: 100%;
      height: 80px;
      background: white;
      margin: 0;
      padding: 0;
      line-height: 0;
    }
    .drip-divider svg {
      display: block;
      width: 100%;
      height: 100%;
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
    .headline em { color: var(--accent); font-style: italic; font-weight: 400; }
    .tagline {
      max-width: 460px;
      color: var(--text-muted);
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .hero-ctas { display: flex; gap: 12px; margin-bottom: 40px; flex-wrap: wrap; }
    .reviews { display: flex; align-items: center; gap: 12px; }
    .avatars { display: flex; }
    .av {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 2.5px solid var(--bg);
      margin-left: -8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .av:first-child { margin-left: 0; }
    .reviews-count { font-size: 14px; font-weight: 500; color: var(--text); }
    .reviews-stars { color: var(--accent); font-size: 13px; letter-spacing: 1px; }

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
      opacity: 0.55;
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
      gap: 24px;
      z-index: 1;
    }
    .tube-side { animation: float-side 5s ease-in-out infinite; opacity: 0.85; }
    .tube-left { animation-delay: -2s; --r: -12deg; }
    .tube-right { --r: 12deg; }
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
      width: 36px; height: 36px;
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

    .lineup {
      background: white;
      padding: 100px 0;
    }
    .lineup-head { text-align: center; margin-bottom: 60px; }
    .section-title { font-size: clamp(36px, 5vw, 56px); line-height: 1; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
    }
    .loading { display: flex; justify-content: center; padding: 60px 0; }

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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private cart = inject(CartService);

  @ViewChild('dripPath', { static: false }) dripPath?: ElementRef<SVGPathElement>;
  @ViewChild('dripSvg', { static: false }) dripSvg?: ElementRef<SVGSVGElement>;

  private readonly SHAPE = [
    { x:    0, y: 12 },
    { x:   60, y: 18 },
    { x:  130, y: 14 },
    { x:  200, y: 22 },
    { x:  270, y: 20 },
    { x:  340, y: 12 },
    { x:  410, y:  6 },
    { x:  480, y: 10 },
    { x:  550, y: 16 },
    { x:  620, y: 14 },
    { x:  690, y:  6 },
    { x:  760, y:  2 },
    { x:  830, y:  6 },
    { x:  900, y: 14 },
    { x:  970, y: 20 },
    { x: 1040, y: 18 },
    { x: 1110, y: 10 },
    { x: 1200, y:  8 }
  ];
  private readonly W = 1200;

  private smoothProgress = 0;
  private targetProgress = 0;
  private ticking = false;
  private rafId = 0;
  private onScroll = () => {
    this.targetProgress = this.computeProgress();
    if (!this.ticking) {
      this.ticking = true;
      this.rafId = requestAnimationFrame(() => this.tick());
    }
  };

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);

  shades = signal<Shade[]>([
    { id: 1, name: 'Vanilla Glaze',    shortName: 'vanilla',    color: '#D4A89B', blob: 'rgba(212, 168, 155, 0.7)', image: '/assets/products/vanilla.png' },
    { id: 2, name: 'Strawberry Glaze', shortName: 'strawberry', color: '#F4C4C9', blob: 'rgba(244, 196, 201, 0.7)', image: '/assets/products/strawberry.png' },
    { id: 3, name: 'Espresso Glaze',   shortName: 'espresso',   color: '#6B4538', blob: 'rgba(107, 69, 56, 0.55)',  image: '/assets/products/espresso.png' },
    { id: 4, name: 'Raspberry Jelly',  shortName: 'raspberry',  color: '#B85970', blob: 'rgba(184, 89, 112, 0.6)',  image: '/assets/products/raspberry.png' },
    { id: 5, name: 'Lavender Mist',    shortName: 'lavender',   color: '#E8B8D4', blob: 'rgba(232, 184, 212, 0.7)', image: '/assets/products/lavender.png' }
  ]);

  activeIndex = signal(0);
  activeShade = computed(() => this.shades()[this.activeIndex()]);
  activeBlobColor = computed(() => this.activeShade().blob);
  sideLeftShade = computed(() => {
    const list = this.shades();
    const i = (this.activeIndex() - 1 + list.length) % list.length;
    return list[i];
  });
  sideRightShade = computed(() => {
    const list = this.shades();
    const i = (this.activeIndex() + 1) % list.length;
    return list[i];
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

  ngAfterViewInit(): void {
    this.targetProgress = this.computeProgress();
    this.smoothProgress = this.targetProgress;
    this.renderDrip();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private computeProgress(): number {
    if (!this.dripSvg) return 0;
    const svgEl = this.dripSvg.nativeElement;
    const divider = svgEl.parentElement;
    if (!divider) return 0;
    const rect = divider.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const dividerTop = rect.top;
    const startTrigger = viewportH;
    const endTrigger = viewportH * 0.15;
    if (dividerTop > startTrigger) return 0;
    if (dividerTop < endTrigger) return 1;
    return 1 - (dividerTop - endTrigger) / (startTrigger - endTrigger);
  }

  private buildPath(progress: number): string {
    const amp = 0.5 + progress * 1.1;
    const TOP_BASELINE = 25;
    const pts = this.SHAPE.map(p => ({ x: p.x, y: TOP_BASELINE + p.y * amp }));
    let d = `M 0,0 L ${this.W},0 L ${this.W},${pts[pts.length - 1].y.toFixed(2)}`;
    let prevX = pts[pts.length - 1].x;
    let prevY = pts[pts.length - 1].y;
    for (let i = pts.length - 2; i >= 0; i--) {
      const x = pts[i].x;
      const y = pts[i].y;
      const mx = (prevX + x) / 2;
      const my = (prevY + y) / 2;
      d += ` Q ${prevX.toFixed(2)},${prevY.toFixed(2)} ${mx.toFixed(2)},${my.toFixed(2)}`;
      prevX = x; prevY = y;
    }
    d += ` L 0,${prevY.toFixed(2)} Z`;
    return d;
  }

  private renderDrip(): void {
    if (!this.dripPath) return;
    this.dripPath.nativeElement.setAttribute('d', this.buildPath(this.smoothProgress));
  }

  private tick(): void {
    const diff = this.targetProgress - this.smoothProgress;
    this.smoothProgress += diff * 0.15;
    this.renderDrip();
    if (Math.abs(diff) > 0.0015) {
      this.rafId = requestAnimationFrame(() => this.tick());
    } else {
      this.smoothProgress = this.targetProgress;
      this.renderDrip();
      this.ticking = false;
    }
  }

  setActiveShade(index: number): void {
    this.activeIndex.set(index);
  }

  onAdded(name: string): void {
    this.toast.set(name);
    setTimeout(() => this.toast.set(null), 2200);
  }
}
