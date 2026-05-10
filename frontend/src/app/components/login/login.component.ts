import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-card fade-up">
        <p class="eyebrow">welcome back</p>
        <h1 class="title">log in.</h1>

        <form #form="ngForm" (ngSubmit)="submit(form)">
          <div class="field">
            <label>email</label>
            <input type="email" name="email" [(ngModel)]="model.email" required email>
          </div>
          <div class="field">
            <label>password</label>
            <input type="password" name="password" [(ngModel)]="model.password" required minlength="6">
          </div>

          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          <button type="submit" class="btn btn-primary submit-btn"
                  [disabled]="!form.valid || submitting()">
            {{ submitting() ? 'logging in…' : 'log in' }}
          </button>
        </form>

        <p class="alt">
          new here? <a routerLink="/register">make an account</a>
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
      max-width: 440px;
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
      margin: 0 0 28px;
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
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model = { email: '', password: '' };
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  submit(form: NgForm): void {
    if (!form.valid) return;
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.auth.login(this.model).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'login failed. please check your credentials.');
        this.submitting.set(false);
      }
    });
  }
}
