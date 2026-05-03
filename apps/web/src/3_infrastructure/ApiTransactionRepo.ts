import { Transaction } from '../1_domain/Transaction';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const ApiTransactionRepo = {
  async getAll(): Promise<Transaction[]> {
    const res = await fetch(`${API_URL}/transactions`);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return res.json();
  },

  async create(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error('Error al crear transacción');
    return res.json();
  },

  async remove(id: string): Promise<void> {
    await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
  },
};
