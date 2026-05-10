import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lipstick-tube',
  standalone: true,
  template: `
    <div class="tube-wrap" [style.--tube]="color" [style.--scale]="scale">
      <div class="tube">
        <div class="cap"></div>
        <div class="ridges"></div>
        <div class="body">
          <span class="brand">glow</span>
          <span class="label">PEPTIDE LIP TINT</span>
          <span class="sublabel">BAUME À LÈVRES TEINTÉ</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tube-wrap {
      display: inline-block;
      transform: scale(var(--scale, 1));
      transition: transform 0.3s ease;
    }

    .tube {
      position: relative;
      width: 80px;
      height: 200px;
      border-radius: 8px 8px 26px 26px;
      background: linear-gradient(135deg,
        color-mix(in oklab, var(--tube) 100%, white 12%) 0%,
        var(--tube) 50%,
        color-mix(in oklab, var(--tube) 100%, black 8%) 100%);
      box-shadow:
        inset -8px 0 12px -4px rgba(0,0,0,0.18),
        inset 8px 0 12px -4px rgba(255,255,255,0.25),
        0 12px 24px -8px rgba(58, 42, 38, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 38px;
      transition: background 0.4s ease, box-shadow 0.4s ease;
    }

    .cap {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 26px;
      background: linear-gradient(180deg, #2a1d1a 0%, #3a2a26 100%);
      border-radius: 8px 8px 0 0;
      box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3);
    }

    .ridges {
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 26px;
      background: repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.08) 0,
        rgba(255,255,255,0.08) 1px,
        transparent 1px,
        transparent 2px
      );
    }

    .brand {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 500;
      font-size: 18px;
      color: white;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .label {
      font-size: 5.5px;
      letter-spacing: 0.15em;
      color: rgba(255,255,255,0.85);
      text-transform: uppercase;
      font-weight: 500;
    }

    .sublabel {
      font-size: 4.5px;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.65);
      margin-top: 2px;
      text-transform: uppercase;
    }
  `]
})
export class LipstickTubeComponent {
  @Input() color = '#D4A89B';
  @Input() scale = 1;
}
