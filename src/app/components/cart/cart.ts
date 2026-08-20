import { Component, computed, inject, signal } from '@angular/core';
import { CartService } from '../../shared/cart.service';

@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cartService = inject(CartService);
  items = this.cartService.items;
  count = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
  subtotal = this.cartService.subtotal;
  deliveryFee = computed(() => this.subtotal() ? 25 : 0);
  tax = computed(() => this.subtotal() * 0.15);
  total = computed(() => this.subtotal() + this.deliveryFee() + this.tax());
  checkoutMessage = signal('');

  increase(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity + 1);
  }

  decrease(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity - 1);
  }

  remove(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  checkout(): void {
    if (this.items().length === 0) {
      return;
    }

    this.checkoutMessage.set(`Order placed successfully. Total: R ${this.total().toFixed(2)}`);
    this.cartService.clear();
  }
}
