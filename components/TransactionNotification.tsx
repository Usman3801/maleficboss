"use client";
import { useEffect, useState } from "react";
import { CheckCircle, X, ExternalLink, AlertCircle } from "lucide-react";

export interface Transaction {
  hash: string;
  status: "success" | "error" | "pending";
  message: string;
}

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionNotification({ transaction, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (transaction) {
      setIsVisible(true);
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [transaction]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!transaction) return null;

  const isSuccess = transaction.status === "success";
  const isPending = transaction.status === "pending";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`min-w-[350px] max-w-md rounded-xl p-4 shadow-2xl border-2 ${
          isSuccess
            ? "bg-green-900/90 border-green-500"
            : isPending
            ? "bg-blue-900/90 border-blue-500"
            : "bg-red-900/90 border-red-500"
        } backdrop-blur-sm`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {isSuccess ? (
              <CheckCircle size={24} className="text-green-400" />
            ) : isPending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-400"></div>
            ) : (
              <AlertCircle size={24} className="text-red-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white mb-1">
              {isSuccess ? "Transaction Successful" : isPending ? "Transaction Pending" : "Transaction Failed"}
            </h4>
            <p className="text-sm text-gray-200 mb-3">{transaction.message}</p>

            {transaction.hash && (
              <a
                href={`https://explorer.demos.sh/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white hover:underline font-medium"
              >
                View on Explorer
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X size={20} className="text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
