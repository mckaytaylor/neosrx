import { useState } from "react";
import { PaymentContext } from "./PaymentFormContext";

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider = ({ children }: PaymentProviderProps) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    cardCode: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    const formattedValue = parts.join(' ');
    setPaymentData({ ...paymentData, cardNumber: formattedValue });
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    if (value.length >= 2) {
      const month = value.slice(0, 2);
      const year = value.slice(2);
      value = `${month}/${year}`;
    }
    setPaymentData({ ...paymentData, expirationDate: value });
  };

  const handleCardCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    setPaymentData({ ...paymentData, cardCode: value });
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentData,
        isProcessing,
        handleCardNumberChange,
        handleExpirationDateChange,
        handleCardCodeChange,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};