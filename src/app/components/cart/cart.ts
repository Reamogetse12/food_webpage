import { Component, computed, inject, signal } from '@angular/core';
import { CartItem, CartService } from '../../shared/cart.service';

@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cartService = inject(CartService);
  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly deliveryFee = computed(() => this.subtotal() ? 25 : 0);
  readonly tax = computed(() => this.subtotal() * 0.15);
  readonly total = computed(() => this.subtotal() + this.deliveryFee() + this.tax());
  readonly checkoutMessage = signal('');

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
