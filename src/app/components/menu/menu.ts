import { Component, computed, signal } from '@angular/core';
import { CartService } from '../../shared/cart.service';

interface MenuPicture {
  category: string;
  image: string;
  name: string;
}

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  readonly selectedCategory = signal('ALL');
  readonly pictures: MenuPicture[] = [
    { category: 'BURGERS', image: '/images/burger.jpg', name: 'Burger' },
    { category: 'PIZZA', image: '/images/pizza-1.jpg', name: 'Pizza' },
    { category: 'CHICKEN', image: '/images/chicken.webp', name: 'Chicken' },
    { category: 'WRAPS', image: '/images/wrap.webp', name: 'Wrap' },
    { category: 'DESSERTS', image: '/images/cupcake.jpg', name: 'Dessert' },
    { category: 'PASTA', image: '/images/pasta.jpg', name: 'Pasta' },
  ];
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

  addToOrder(id: string, name: string, price: number, image: string): void {
    this.cartService.addItem({ id, name, price, image });
  }

  isAdded(id: string): boolean {
    return this.cartService.quantityFor(id) > 0;
  }

  quantityFor(id: string): number {
    return this.cartService.quantityFor(id);
  }
}
