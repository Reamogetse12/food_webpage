import { Component, computed, inject, output } from '@angular/core';
import { CartService } from '../../shared/cart.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  readonly cartCount = computed(() =>
    this.cartService.items().reduce((total, item) => total + item.quantity, 0),
  );
  readonly user = this.authService.user;
  readonly isLoggedIn = this.authService.isLoggedIn;

  readonly cartToggled = output<void>();

  scrollTo(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  logout(): void {
    this.authService.logout();
  }
}
