import { Component, signal } from '@angular/core';
import { Navbar } from "./components/navbar/navbar";
import { Home } from './components/home/home';
import { About } from "./components/about/about";
import { Menu } from "./components/menu/menu";
import { Cart } from "./components/cart/cart";
import { Reservations} from "./components/reservations/reservations";
import { Contacts } from "./components/contacts/contacts";
import { Footer} from "./components/footer/footer";

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [Navbar, Home, About, Menu, Cart, Reservations, Contacts, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('food_webpage');
}
