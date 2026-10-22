import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db';
import { JWT_SECRET } from '../middleware/auth.middleware';

const SALT_ROUNDS = 12;

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
}

function signToken(user: Pick<UserRow, 'id' | 'email'>): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: 'customer' },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body as {
    username: string; email: string; password: string;
  };

  if (!username?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'username, email, and password are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const [existing] = await pool.execute<UserRow[]>(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase().trim()],
  );
  if (existing.length > 0) {
    res.status(409).json({ error: 'An account with that email already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username.trim(), email.toLowerCase().trim(), hashed],
  );

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, email FROM users WHERE id = ?',
    [result.insertId],
  );
  const user = rows[0];

  res.status(201).json({
    message: 'Account created successfully',
    token: signToken(user),
    user: { id: user.id, name: user.username, email: user.email, role: 'customer' },
  });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT * FROM users WHERE email = ?',
    [email.toLowerCase().trim()],
  );
  if (rows.length === 0) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json({
    message: 'Login successful',
    token: signToken(user),
    user: { id: user.id, name: user.username, email: user.email, role: 'customer' },
  });
}

// GET /api/auth/me
export async function getMe(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [req.user!.userId],
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const u = rows[0];
  res.json({ data: { id: u.id, name: u.username, email: u.email, created_at: u.created_at } });
}
