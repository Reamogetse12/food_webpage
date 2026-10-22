import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { CartItem, CartService } from '../../shared/cart.service';
import { AuthService } from '../../shared/auth.service';
import { LoginModal } from '../login-modal/login-modal';
import { Payment } from '../payment/payment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [LoginModal, Payment],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  @ViewChild(LoginModal) loginModal!: LoginModal;
  @ViewChild(Payment)    paymentPage!: Payment;

  readonly isOpen    = signal(false);
  readonly items     = this.cartService.items;
  readonly count     = computed(() => this.items().reduce((t, i) => t + i.quantity, 0));
  readonly subtotal  = this.cartService.subtotal;
  readonly deliveryFee = computed(() => (this.subtotal() ? 25 : 0));
  readonly tax       = computed(() => this.subtotal() * 0.15);
  readonly total     = computed(() => this.subtotal() + this.deliveryFee() + this.tax());

  readonly user      = this.authService.user;
  readonly isLoggedIn = this.authService.isLoggedIn;

  open(): void  { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  increase(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity + 1);
  }

  decrease(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity - 1);
  }

  remove(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  extrasTotal(item: CartItem): number {
    return item.extras.reduce((sum, e) => sum + e.price, 0);
  }

  logout(): void {
    this.authService.logout();
  }

  checkout(): void {
    if (this.items().length === 0) return;

    if (!this.authService.isLoggedIn()) {
      this.loginModal.open();   // auth first → onAuthenticated fires
      return;
    }

    this.openPayment();
  }

  /** Called when login / register completes successfully */
  onAuthenticated(): void {
    this.openPayment();
  }

  /** Called when the payment page emits orderPlaced */
  onOrderPlaced(): void {
    this.close();   // close the cart drawer too
  }

  private openPayment(): void {
    this.close();              // slide cart drawer out of the way
    this.paymentPage.open();   // open the full-screen payment page
  }
}
