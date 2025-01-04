import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePaymentContext } from "./payment/PaymentFormContext";

export const PaymentFormFields = () => {
  const {
    paymentData,
    handleCardNumberChange,
    handleExpirationDateChange,
    handleCardCodeChange,
  } = usePaymentContext();

  return (
    <>
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={paymentData.cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationDate">Expiration Date (MM/YY)</Label>
        <Input
          id="expirationDate"
          placeholder="MM/YY"
          value={paymentData.expirationDate}
          onChange={handleExpirationDateChange}
          maxLength={5}
          required
        />
      </div>
      <div>
        <Label htmlFor="cardCode">CVV</Label>
        <Input
          id="cardCode"
          placeholder="123"
          value={paymentData.cardCode}
          onChange={handleCardCodeChange}
          maxLength={4}
          required
        />
      </div>
    </>
  );
};