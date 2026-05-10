import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models';

describe('CartService', () => {
  let service: CartService;
  const product: Product = {
    id: 1, name: 'Test', category: 'Cat', brand: 'B',
    price: 10, description: '', imageUrl: '', stockQuantity: 5
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('starts empty', () => {
    expect(service.items()).toEqual([]);
    expect(service.itemCount()).toBe(0);
    expect(service.displayedTotal()).toBe(0);
  });

  it('adds a product', () => {
    service.addToCart(product);
    expect(service.items().length).toBe(1);
    expect(service.itemCount()).toBe(1);
    expect(service.displayedTotal()).toBe(10);
  });

  it('increments quantity for the same product', () => {
    service.addToCart(product);
    service.addToCart(product, 2);
    expect(service.items().length).toBe(1);
    expect(service.itemCount()).toBe(3);
    expect(service.displayedTotal()).toBe(30);
  });

  it('updates quantity', () => {
    service.addToCart(product);
    service.updateQuantity(1, 5);
    expect(service.items()[0].quantity).toBe(5);
    expect(service.displayedTotal()).toBe(50);
  });

  it('removes item when quantity drops to zero', () => {
    service.addToCart(product);
    service.updateQuantity(1, 0);
    expect(service.items().length).toBe(0);
  });

  it('clears the cart', () => {
    service.addToCart(product, 3);
    service.clear();
    expect(service.items()).toEqual([]);
    expect(service.itemCount()).toBe(0);
  });
});
