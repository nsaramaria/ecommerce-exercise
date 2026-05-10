import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-card fade-up">
        <p class="eyebrow">join us</p>
        <h1 class="title">make an<br><em>account.</em></h1>

        <form #form="ngForm" (ngSubmit)="submit(form)">
          <div class="row-2">
            <div class="field">
              <label>first name</label>
              <input name="firstName" [(ngModel)]="model.firstName" required>
            </div>
            <div class="field">
              <label>last name</label>
              <input name="lastName" [(ngModel)]="model.lastName" required>
            </div>
          </div>
          <div class="field">
            <label>email</label>
            <input type="email" name="email" [(ngModel)]="model.email" required email>
          </div>
          <div class="field">
            <label>password</label>
            <input type="password" name="password" [(ngModel)]="model.password" required minlength="6">
            <small>at least 6 characters.</small>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="!form.valid || submitting()">
            {{ submitting() ? 'creating…' : 'create account' }}
          </button>
        </form>

        <p class="alt">
          already have one? <a routerLink="/login">log in</a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 220px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      background: var(--surface);
      border-radius: var(--radius-card);
      padding: 48px 40px;
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 12px;
      font-weight: 500;
    }
    .title {
      font-size: 44px;
      line-height: 1;
      margin: 0 0 28px;
    }
    .title em { color: var(--accent); font-style: italic; }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .submit-btn { width: 100%; margin-top: 12px; }
    .alt {
      text-align: center;
      margin: 24px 0 0;
      font-size: 14px;
      color: var(--text-muted);
    }
    .alt a {
      color: var(--accent);
      font-style: italic;
      font-family: var(--font-serif);
    }
    .alt a:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .row-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model = { email: '', password: '', firstName: '', lastName: '' };
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  submit(form: NgForm): void {
    if (!form.valid) return;
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.auth.register(this.model).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'registration failed. please try again.');
        this.submitting.set(false);
      }
    });
  }
}
