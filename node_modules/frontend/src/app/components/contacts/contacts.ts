import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts {
  name = '';
  email = '';
  phone = '';
  subject = '';
  message = '';
  sentMessage = signal('');

  submit(): void {
    if (!this.name || !this.email || !this.message) {
      return;
    }
    this.sentMessage.set(`Thanks ${this.name}, your message has been sent. We'll be in touch soon.`);
    this.name = '';
    this.email = '';
    this.phone = '';
    this.subject = '';
    this.message = '';
  }
}
