import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartItem, CartService } from '../../shared/cart.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  readonly isOpen = signal(false);
  readonly placing = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly fulfillment = signal<'delivery' | 'pickup'>('delivery');
  readonly paymentMethod = signal<'cash' | 'bank-card'>('bank-card');

  readonly orderPlaced = output<void>();

  // expose to template
  readonly user = this.authService.user;
  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly deliveryFee = computed(() =>
    this.fulfillment() === 'delivery' && this.subtotal() > 0 ? 25 : 0,
  );
  readonly tax = computed(() => Number((this.subtotal() * 0.15).toFixed(2)));
  readonly total = computed(() =>
    Number((this.subtotal() + this.deliveryFee() + this.tax()).toFixed(2)),
  );

  // form fields
  address = '';
  city = '';
  cardName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';

  open(): void {
    this.fulfillment.set('delivery');
    this.paymentMethod.set('bank-card');
    this.address = '';
    this.city = '';
    this.cardName = '';
    this.cardNumber = '';
    this.expiry = '';
    this.cvv = '';
    this.error.set('');
    this.success.set(false);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  extrasTotal(item: CartItem): number {
    return item.extras.reduce((sum, e) => sum + e.price, 0);
  }

  formatCard(value: string): void {
    this.cardNumber = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    this.expiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  async submit(): Promise<void> {
    if (this.fulfillment() === 'delivery' && (!this.address.trim() || !this.city.trim())) {
      this.error.set('Please enter your delivery address.');
      return;
    }
    if (this.paymentMethod() === 'bank-card') {
      if (!this.cardName.trim() || this.cardNumber.replace(/\s/g, '').length < 16) {
        this.error.set('Please enter a valid card number.');
        return;
      }
      if (!this.expiry || !this.cvv || this.cvv.length < 3) {
        this.error.set('Please enter a valid expiry and CVV.');
        return;
      }
    }

    this.placing.set(true);
    this.error.set('');
    try {
      await this.authService.placeOrder(this.items(), this.fulfillment());
      this.success.set(true);
      this.cartService.clear();
      // auto-close after 2.5 s
      setTimeout(() => {
        this.isOpen.set(false);
        this.orderPlaced.emit();
      }, 2500);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Order failed. Please try again.');
    } finally {
      this.placing.set(false);
    }
  }
}
