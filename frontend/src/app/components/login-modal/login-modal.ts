import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';

type Tab = 'login' | 'register';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  private readonly authService = inject(AuthService);

  readonly authenticated = output<void>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);

  // tabs
  activeTab = signal<Tab>('login');

  // login fields
  loginEmail = '';
  loginPassword = '';

  // register fields
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirm = '';

  // state
  readonly loading = signal(false);
  readonly error = signal('');

  open(): void {
    this.reset();
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.error.set('');
  }

  async submitLogin(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
      this.isOpen.set(false);
      this.authenticated.emit();
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      this.loading.set(false);
    }
  }

  async submitRegister(): Promise<void> {
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.registerConfirm) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (this.registerPassword !== this.registerConfirm) {
      this.error.set('Passwords do not match.');
      return;
    }
    if (this.registerPassword.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.register(this.registerName, this.registerEmail, this.registerPassword);
      this.isOpen.set(false);
      this.authenticated.emit();
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      this.loading.set(false);
    }
  }

  private reset(): void {
    this.activeTab.set('login');
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.registerConfirm = '';
    this.error.set('');
    this.loading.set(false);
  }
}
