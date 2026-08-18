import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cart } from './cart';
import { CartService } from '../../shared/cart.service';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update quantities and remove items', () => {
    const cartService = TestBed.inject(CartService);
    cartService.addItem({
      id: 'burger',
      name: 'D\'LICIOUS Classic Burger',
      price: 80.9,
      image: '/images/burger.jpg',
    });

    component.increase('burger', 1);
    expect(component.items()[0].quantity).toBe(2);

    component.decrease('burger', 2);
    expect(component.items()[0].quantity).toBe(1);

    component.remove('burger');
    expect(component.items()).toHaveLength(0);
  });

  it('should place an order and clear the cart', () => {
    const cartService = TestBed.inject(CartService);
    cartService.addItem({
      id: 'wrap',
      name: 'Chicken Wrap',
      price: 70.75,
      image: '/images/wrap.webp',
    });

    component.checkout();

    expect(component.items()).toHaveLength(0);
    expect(component.checkoutMessage()).toContain('Order placed successfully');
  });
});
