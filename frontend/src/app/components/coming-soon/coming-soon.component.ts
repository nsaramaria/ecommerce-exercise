import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="cs">
      <div class="page-container fade-up">
        <p class="eyebrow">{{ title }}</p>
        <h1 class="title">
          something <em>good</em><br>
          is coming.
        </h1>
        <p class="sub">
          this page is on the way. in the meantime, the products are ready for you.
        </p>
        <a routerLink="/shop" class="btn btn-primary">browse the lineup</a>

        <div class="ornament">
          <span class="dot" style="background:#D4A89B"></span>
          <span class="dot" style="background:#E89B8C"></span>
          <span class="dot" style="background:#C97A6E"></span>
          <span class="dot" style="background:#B85970"></span>
          <span class="dot" style="background:#E8B89B"></span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cs {
      min-height: calc(100vh - 220px);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 80px 0;
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 18px;
      font-weight: 500;
    }
    .title {
      font-size: clamp(40px, 7vw, 80px);
      line-height: 1;
      margin: 0 0 24px;
    }
    .title em { color: var(--accent); font-style: italic; }
    .sub {
      max-width: 480px;
      margin: 0 auto 32px;
      color: var(--text-muted);
      font-size: 16px;
    }
    .ornament {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-top: 60px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      box-shadow:
        inset -1px -1px 2px rgba(0,0,0,0.15),
        inset 1px 1px 2px rgba(255,255,255,0.3);
      animation: bob 2.5s ease-in-out infinite;
    }
    .dot:nth-child(1) { animation-delay: 0s; }
    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.3s; }
    .dot:nth-child(4) { animation-delay: 0.45s; }
    .dot:nth-child(5) { animation-delay: 0.6s; }

    @keyframes bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `]
})
export class ComingSoonComponent {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data['title'] ?? 'coming soon';
}
