import { CartService } from './cart.service';

describe('CartService persistence', () => {
  beforeEach(() => {
    localStorage.removeItem('dlicious_cart');
  });

  it('restores cart items, quantities, and extras from storage', () => {
    const item = {
      id: 'burger',
      name: 'Classic Burger',
      price: 80.9,
      image: '/images/burger.jpg',
      quantity: 2,
      extras: [{ id: 'bacon', name: 'Bacon', price: 15 }],
    };
    localStorage.setItem('dlicious_cart', JSON.stringify([item]));

    const service = new CartService();

    expect(service.items()).toEqual([item]);
    expect(service.subtotal()).toBeCloseTo(191.8);
  });

  it('saves cart changes and removes saved items when cleared', () => {
    const service = new CartService();
    service.addItem({
      id: 'burger',
      name: 'Classic Burger',
      price: 80.9,
      image: '/images/burger.jpg',
    });
    service.updateExtras('burger', [{ id: 'bacon', name: 'Bacon', price: 15 }]);
    service.updateQuantity('burger', 2);

    expect(JSON.parse(localStorage.getItem('dlicious_cart')!)).toEqual(service.items());

    service.clear();

    expect(service.items()).toEqual([]);
    expect(localStorage.getItem('dlicious_cart')).toBe('[]');
  });

  it('discards invalid saved cart data', () => {
    localStorage.setItem('dlicious_cart', '{"unexpected":true}');

    const service = new CartService();

    expect(service.items()).toEqual([]);
    expect(localStorage.getItem('dlicious_cart')).toBeNull();
  });
});
