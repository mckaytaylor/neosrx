import { createContext, useContext } from "react";

interface PaymentData {
  cardNumber: string;
  expirationDate: string;
  cardCode: string;
}

interface PaymentContextType {
  paymentData: PaymentData;
  isProcessing: boolean;
  handleCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExpirationDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCardCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }
  return context;
};