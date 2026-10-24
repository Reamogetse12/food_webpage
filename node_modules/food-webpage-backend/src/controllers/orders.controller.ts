import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db';

interface Extra     { id: string; name: string; price: number; }
interface OrderItem { id: string; name: string; price: number; image: string; quantity: number; extras: Extra[]; }

interface OrderRow extends RowDataPacket {
  id: number; created_at: string; user_id: number;
  items: string; subtotal: number; delivery: number;
  tax: number; total: number; status: string;
}

function parseOrder(row: OrderRow) {
  return {
    ...row,
    fulfillment: row.delivery > 0 ? 'delivery' : 'pickup',
    items: JSON.parse(row.items),
  };
}

// GET /api/orders
export async function getOrders(req: Request, res: Response): Promise<void> {
  const [rows] = req.user!.role === 'admin'
    ? await pool.execute<OrderRow[]>('SELECT * FROM orders ORDER BY created_at DESC')
    : await pool.execute<OrderRow[]>(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user!.userId],
      );

  res.json({ data: rows.map(parseOrder) });
}

// GET /api/orders/:id
export async function getOrderById(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute<OrderRow[]>(
    'SELECT * FROM orders WHERE id = ?',
    [req.params['id']],
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const row = rows[0];
  if (req.user!.role !== 'admin' && row.user_id !== req.user!.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.json({ data: parseOrder(row) });
}

// POST /api/orders
export async function createOrder(req: Request, res: Response): Promise<void> {
  const { items, fulfillment = 'delivery' } = req.body as {
    items: OrderItem[];
    fulfillment?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Order must contain at least one item' });
    return;
  }
  if (fulfillment !== 'delivery' && fulfillment !== 'pickup') {
    res.status(400).json({ error: 'Fulfillment must be delivery or pickup' });
    return;
  }
  for (const item of items) {
    if (!item.id || !item.name || item.price == null || item.quantity == null) {
      res.status(400).json({ error: 'Each item requires id, name, price, and quantity' });
      return;
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const extrasTotal = (item.extras ?? []).reduce((s, e) => s + e.price, 0);
    return sum + (item.price + extrasTotal) * item.quantity;
  }, 0);

  const delivery = fulfillment === 'delivery' && subtotal > 0 ? 25 : 0;
  const tax      = Number((subtotal * 0.15).toFixed(2));
  const total    = Number((subtotal + delivery + tax).toFixed(2));

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO orders (user_id, items, subtotal, delivery, tax, total) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user!.userId, JSON.stringify(items), subtotal, delivery, tax, total],
  );

  const [created] = await pool.execute<OrderRow[]>(
    'SELECT * FROM orders WHERE id = ?',
    [result.insertId],
  );

  res.status(201).json({ message: 'Order placed successfully', data: parseOrder(created[0]) });
}

// PATCH /api/orders/:id/status
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }

  const allowed = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  const { status } = req.body as { status: string };

  if (!allowed.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    return;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params['id']],
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ message: 'Status updated', status });
}
