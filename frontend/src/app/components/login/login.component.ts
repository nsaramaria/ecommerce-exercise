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
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title mb-4">Login</h3>
            <form #form="ngForm" (ngSubmit)="submit(form)">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" name="email"
                       [(ngModel)]="model.email" required email>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" name="password"
                       [(ngModel)]="model.password" required minlength="6">
              </div>

              @if (errorMessage()) {
                <div class="alert alert-danger">{{ errorMessage() }}</div>
              }

              <button type="submit" class="btn btn-primary w-100"
                      [disabled]="!form.valid || submitting()">
                {{ submitting() ? 'Logging in...' : 'Login' }}
              </button>
            </form>
            <p class="mt-3 mb-0 text-center">
              No account? <a routerLink="/register">Register</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
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
      next: () => this.router.navigate(['/products']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Login failed. Please check your credentials.');
        this.submitting.set(false);
      }
    });
  }
}
