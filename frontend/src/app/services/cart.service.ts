import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models';

const STORAGE_KEY = 'ecommerce_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() =>
    this.itemsSignal().reduce((sum, i) => sum + i.quantity, 0));
  readonly displayedTotal = computed(() =>
    this.itemsSignal().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  addToCart(product: Product, quantity = 1): void {
    const items = [...this.itemsSignal()];
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.persist(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const items = this.itemsSignal().map(i =>
      i.product.id === productId ? { ...i, quantity } : i);
    this.persist(items);
  }

  removeFromCart(productId: number): void {
    this.persist(this.itemsSignal().filter(i => i.product.id !== productId));
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: CartItem[]): void {
    this.itemsSignal.set(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* storage may be unavailable */ }
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch {
      return [];
    }
  }
}
