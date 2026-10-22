import { Injectable, computed, signal } from '@angular/core';

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  extras: Extra[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);
  readonly subtotal = computed(() =>
    this.items().reduce((total, item) => {
      const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
      return total + (item.price + extrasTotal) * item.quantity;
    }, 0),
  );

  addItem(item: Omit<CartItem, 'quantity' | 'extras'>): void {
    const existing = this.items().find(i => i.id === item.id);
    if (existing) {
      this.updateQuantity(item.id, existing.quantity + 1);
      return;
    }
    this.items.update(items => [...items, { ...item, quantity: 1, extras: [] }]);
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(id);
      return;
    }
    this.items.update(items =>
      items.map(item => item.id === id ? { ...item, quantity } : item),
    );
  }

  updateExtras(id: string, extras: Extra[]): void {
    this.items.update(items =>
      items.map(item => item.id === id ? { ...item, extras } : item),
    );
  }

  removeItem(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }

  quantityFor(id: string): number {
    return this.items().find(item => item.id === id)?.quantity ?? 0;
  }

  extrasFor(id: string): Extra[] {
    return this.items().find(item => item.id === id)?.extras ?? [];
  }
}
