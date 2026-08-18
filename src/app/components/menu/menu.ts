import { Component, computed, signal } from '@angular/core';
import { CartService } from '../../shared/cart.service';

interface MenuPicture {
  category: string;
  image: string;
  name: string;
}

interface MenuProduct extends MenuPicture {
  id: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  readonly selectedCategory = signal('ALL');
  readonly categories = ['ALL', 'BURGERS', 'PIZZA', 'CHICKEN', 'WRAPS', 'DESSERTS', 'PASTA'];
  readonly products: MenuProduct[] = [
    { id: 'burger', category: 'BURGERS', image: '/images/burger.jpg', name: "D'LICIOUS Classic Burger", description: 'Double smash patty, cheddar, pickles, house sauce, brioche bun.', price: 80.90 },
    { id: 'chicken', category: 'CHICKEN', image: '/images/chicken.webp', name: 'Firehouse Chicken', description: 'Crispy chicken, fries, chili mayo, fresh herbs, and garden slaw.', price: 85.50 },
    { id: 'pizza', category: 'PIZZA', image: '/images/pizza-1.jpg', name: "Chef's Margherita Pizza", description: 'Wood-fired tomato sauce, mozzarella, basil, and olive oil.', price: 120.20 },
    { id: 'wrap', category: 'WRAPS', image: '/images/wrap.webp', name: 'Chicken Wrap', description: 'Grilled chicken, peppers, lettuce, ranch, and toasted tortilla.', price: 70.75 },
    { id: 'pasta', category: 'PASTA', image: '/images/pasta.jpg', name: 'Truffle Pasta', description: 'Fresh pasta ribbons, parmesan, mushrooms, herbs, and cream sauce.', price: 135.40 },
    { id: 'cupcake', category: 'DESSERTS', image: '/images/cupcake.jpg', name: 'Sweet Finish Cupcake', description: 'Soft vanilla sponge, cream frosting, chocolate drizzle.', price: 45.20 },
  ];
  readonly pictures = this.products.map(({ category, image }) => ({
    category,
    image,
    name: category[0] + category.slice(1).toLowerCase(),
  }));
  readonly filteredPictures = computed(() =>
    this.selectedCategory() === 'ALL'
      ? this.pictures
      : this.pictures.filter(picture => picture.category === this.selectedCategory()),
  );

  constructor(private readonly cartService: CartService) {}

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  viewFullMenu(): void {
    document.querySelector('#ordering-menu')?.scrollIntoView({ behavior: 'smooth' });
  }

  addToOrder(product: MenuProduct): void {
    this.cartService.addItem(product);
  }

  isAdded(id: string): boolean {
    return this.cartService.quantityFor(id) > 0;
  }

  quantityFor(id: string): number {
    return this.cartService.quantityFor(id);
  }
}
