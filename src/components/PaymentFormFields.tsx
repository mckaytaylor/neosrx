import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFormFieldsProps {
  paymentData: {
    cardNumber: string;
    expirationDate: string;
    cardCode: string;
  };
  handleCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExpirationDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCardCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PaymentFormFields = ({
  paymentData,
  handleCardNumberChange,
  handleExpirationDateChange,
  handleCardCodeChange,
}: PaymentFormFieldsProps) => {
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