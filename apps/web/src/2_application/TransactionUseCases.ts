import { Transaction } from '../1_domain/Transaction';

// Puerto (Interfaz)
export interface ITransactionRepository {
  save(tx: Transaction): Promise<void>;
  getAll(): Promise<Transaction[]>;
}

// Casos de uso de lógica de aplicación
export const createTransactionUseCase = async (
  repo: ITransactionRepository,
  txData: Omit<Transaction, 'id'>
): Promise<Transaction> => {
  const newTx: Transaction = {
    ...txData,
    id: crypto.randomUUID()
  };
  await repo.save(newTx);
  return newTx;
};
