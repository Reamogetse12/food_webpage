import { Injectable, computed, signal } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);
  readonly subtotal = computed(() =>
    this.items().reduce((total, item) => total + item.price * item.quantity, 0),
  );

  addItem(item: Omit<CartItem, 'quantity'>): void {
    const existingItem = this.items().find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      this.updateQuantity(item.id, existingItem.quantity + 1);
      return;
    }

    this.items.update(items => [...items, { ...item, quantity: 1 }]);
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

  removeItem(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }

  quantityFor(id: string): number {
    return this.items().find(item => item.id === id)?.quantity ?? 0;
  }
}
