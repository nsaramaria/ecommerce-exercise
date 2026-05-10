import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./components/products/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./components/coming-soon/coming-soon.component')
      .then(m => m.ComingSoonComponent),
    data: { title: 'about' }
  },
  {
    path: 'journal',
    loadComponent: () => import('./components/coming-soon/coming-soon.component')
      .then(m => m.ComingSoonComponent),
    data: { title: 'journal' }
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./components/checkout/checkout.component')
      .then(m => m.CheckoutComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  { path: '**', redirectTo: '' }
];
