import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const API = 'http://localhost:3000/api';
const TOKEN_KEY = 'dlicious_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);

  constructor() {
    // Restore user from token on page load
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) this.fetchMe(saved);
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Registration failed');
    this.persist(body.token, body.user);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Login failed');
    this.persist(body.token, body.user);
  }

  async placeOrder(items: unknown[], fulfillment: 'delivery' | 'pickup'): Promise<unknown> {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._token()}`,
      },
      body: JSON.stringify({ items, fulfillment }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Order failed');
    return body.data;
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  private persist(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
    this._user.set(user);
  }

  private async fetchMe(token: string): Promise<void> {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) { this.logout(); return; }
      const body = await res.json();
      this._user.set(body.data);
    } catch {
      this.logout();
    }
  }
}
