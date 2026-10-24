import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../shared/auth.service';
import { CartService } from '../../shared/cart.service';
import { Payment } from './payment';

describe('Payment checkout', () => {
  let component: Payment;
  let fixture: ComponentFixture<Payment>;

  beforeEach(async () => {
    localStorage.removeItem('dlicious_cart');

    await TestBed.configureTestingModule({
      imports: [Payment],
      providers: [{
        provide: AuthService,
        useValue: {
          user: signal(null),
          placeOrder: async () => ({}),
        },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(Payment);
    component = fixture.componentInstance;
    TestBed.inject(CartService).addItem({
      id: 'burger',
      name: 'Classic Burger',
      price: 80.9,
      image: '/images/burger.jpg',
    });
    component.open();
  });

  it('charges a delivery fee by default and removes it for pickup', () => {
    expect(component.fulfillment()).toBe('delivery');
    expect(component.deliveryFee()).toBe(25);

    component.fulfillment.set('pickup');

    expect(component.deliveryFee()).toBe(0);
    expect(component.total()).toBeCloseTo(component.subtotal() + component.tax());
  });

  it('does not require a delivery address for pickup', async () => {
    component.fulfillment.set('pickup');
    component.cardName = '';

    await component.submit();

    expect(component.error()).toBe('Please enter a valid card number.');
  });

  it('allows cash payment without card details and confirms the cash instructions', async () => {
    component.fulfillment.set('pickup');
    component.paymentMethod.set('cash');

    await component.submit();
    fixture.detectChanges();

    expect(component.error()).toBe('');
    expect(component.success()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Please pay cash when you collect your order.');
  });
});
