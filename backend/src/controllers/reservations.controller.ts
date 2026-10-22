import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db';

interface ReservationRow extends RowDataPacket {
  id: number; created_at: string; user_id: number;
  name: string; email: string; phone: string;
  date: string; time: string; guests: number;
  requests: string; status: string;
}

// GET /api/reservations
export async function getReservations(req: Request, res: Response): Promise<void> {
  const [rows] = req.user!.role === 'admin'
    ? await pool.execute<ReservationRow[]>(
        'SELECT * FROM reservations ORDER BY date ASC, time ASC',
      )
    : await pool.execute<ReservationRow[]>(
        'SELECT * FROM reservations WHERE user_id = ? ORDER BY date ASC',
        [req.user!.userId],
      );

  res.json({ data: rows });
}

// POST /api/reservations
export async function createReservation(req: Request, res: Response): Promise<void> {
  const { name, email, phone = '', date, time, guests, requests = '' } = req.body as {
    name?: string; email?: string; phone?: string;
    date?: string; time?: string; guests?: number; requests?: string;
  };

  if (!name?.trim() || !email?.trim() || !date || !time || !guests) {
    res.status(400).json({ error: 'name, email, date, time, and guests are required' });
    return;
  }
  if (Number(guests) < 1 || Number(guests) > 50) {
    res.status(400).json({ error: 'guests must be between 1 and 50' });
    return;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO reservations (user_id, name, email, phone, date, time, guests, requests)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user!.userId, name.trim(), email.trim(), phone, date, time, Number(guests), requests],
  );

  const [created] = await pool.execute<ReservationRow[]>(
    'SELECT * FROM reservations WHERE id = ?',
    [result.insertId],
  );

  res.status(201).json({ message: 'Reservation confirmed', data: created[0] });
}

// PATCH /api/reservations/:id/status
export async function updateReservationStatus(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }

  const allowed = ['pending', 'confirmed', 'cancelled'];
  const { status } = req.body as { status: string };

  if (!allowed.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    return;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE reservations SET status = ? WHERE id = ?',
    [status, req.params['id']],
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'Reservation not found' });
    return;
  }

  res.json({ message: 'Status updated', status });
}
