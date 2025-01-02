import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";

interface ShippingFormData {
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

interface ShippingFormProps {
  formData: ShippingFormData;
  onChange: (data: Partial<ShippingFormData>) => void;
}

export const ShippingForm = ({ formData, onChange }: ShippingFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Shipping Information</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="shippingAddress">Street Address*</Label>
          <Input
            id="shippingAddress"
            value={formData.shippingAddress || ''}
            onChange={(e) => onChange({ shippingAddress: e.target.value })}
            required
            placeholder="123 Main St"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="shippingCity">City*</Label>
          <Input
            id="shippingCity"
            value={formData.shippingCity || ''}
            onChange={(e) => onChange({ shippingCity: e.target.value })}
            required
            placeholder="San Francisco"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="shippingState">State*</Label>
          <Input
            id="shippingState"
            value={formData.shippingState || ''}
            onChange={(e) => onChange({ shippingState: e.target.value })}
            required
            placeholder="CA"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="shippingZip">ZIP Code*</Label>
          <Input
            id="shippingZip"
            value={formData.shippingZip || ''}
            onChange={(e) => onChange({ shippingZip: e.target.value })}
            required
            placeholder="94105"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};