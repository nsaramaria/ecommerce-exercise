import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LipstickTubeComponent } from '../lipstick-tube/lipstick-tube.component';

@Component({
  selector: 'app-product-image',
  standalone: true,
  imports: [CommonModule, LipstickTubeComponent],
  template: `
    @if (imageOk() && imageUrl) {
      <img
        [src]="imageUrl"
        [alt]="alt"
        class="product-img"
        [style.height.px]="height"
        (error)="imageOk.set(false)" />
    } @else {
      <app-lipstick-tube [color]="fallbackColor" [scale]="scale"></app-lipstick-tube>
    }
  `,
  styles: [`
    .product-img {
      width: auto;
      max-width: 100%;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 12px 24px rgba(58, 42, 38, 0.18));
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    :host { display: inline-flex; }
  `]
})
export class ProductImageComponent {
  @Input() imageUrl: string | null = '';
  @Input() fallbackColor = '#D4A89B';
  @Input() alt = '';
  @Input() height = 280;
  @Input() scale = 1;

  imageOk = signal(true);
}
