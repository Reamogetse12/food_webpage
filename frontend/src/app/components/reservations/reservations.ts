import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations {
  name = '';
  email = '';
  phone = '';
  date = '';
  time = '';
  guests: number | null = null;
  requests = '';
  confirmationMessage = signal('');

  submit(): void {
    if (!this.name || !this.email || !this.date || !this.time || !this.guests) {
      return;
    }
    this.confirmationMessage.set(
      `Reservation confirmed for ${this.name} on ${this.date} at ${this.time} for ${this.guests} guest(s).`,
    );
    this.name = '';
    this.email = '';
    this.phone = '';
    this.date = '';
    this.time = '';
    this.guests = null;
    this.requests = '';
  }
}
