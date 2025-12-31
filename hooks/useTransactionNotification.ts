import { useState, useCallback } from "react";
import { Transaction } from "@/components/TransactionNotification";

export function useTransactionNotification() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const showNotification = useCallback((tx: Transaction) => {
    setTransaction(tx);
  }, []);

  const hideNotification = useCallback(() => {
    setTransaction(null);
  }, []);

  return {
    transaction,
    showNotification,
    hideNotification,
  };
}
