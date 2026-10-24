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

const CART_STORAGE_KEY = 'dlicious_cart';

function isExtra(value: unknown): value is Extra {
  if (typeof value !== 'object' || value === null) return false;
  const extra = value as Record<string, unknown>;
  return typeof extra['id'] === 'string'
    && typeof extra['name'] === 'string'
    && typeof extra['price'] === 'number'
    && Number.isFinite(extra['price']);
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item['id'] === 'string'
    && typeof item['name'] === 'string'
    && typeof item['price'] === 'number'
    && Number.isFinite(item['price'])
    && typeof item['image'] === 'string'
    && typeof item['quantity'] === 'number'
    && Number.isInteger(item['quantity'])
    && item['quantity'] > 0
    && Array.isArray(item['extras'])
    && item['extras'].every(isExtra);
}

function loadCart(): CartItem[] {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (saved === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(saved);
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }

  if (!Array.isArray(parsed) || !parsed.every(isCartItem)) {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }

  return parsed;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(loadCart());
  readonly items = this._items.asReadonly();
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
    this.setItems([...this.items(), { ...item, quantity: 1, extras: [] }]);
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(id);
      return;
    }
    this.setItems(this.items().map(item => item.id === id ? { ...item, quantity } : item));
  }

  updateExtras(id: string, extras: Extra[]): void {
    this.setItems(this.items().map(item => item.id === id ? { ...item, extras } : item));
  }

  removeItem(id: string): void {
    this.setItems(this.items().filter(item => item.id !== id));
  }

  clear(): void {
    this.setItems([]);
  }

  quantityFor(id: string): number {
    return this.items().find(item => item.id === id)?.quantity ?? 0;
  }

  extrasFor(id: string): Extra[] {
    return this.items().find(item => item.id === id)?.extras ?? [];
  }

  private setItems(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this._items.set(items);
  }
}
