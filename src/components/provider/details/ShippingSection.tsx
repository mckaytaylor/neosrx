interface ShippingSectionProps {
  assessment: any;
}

export const ShippingSection = ({ assessment }: ShippingSectionProps) => {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
      <div className="space-y-2">
        <div>
          <p className="text-sm text-muted-foreground">Address</p>
          <p>{assessment.shipping_address || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">City</p>
          <p>{assessment.shipping_city || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">State</p>
          <p>{assessment.shipping_state || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">ZIP Code</p>
          <p>{assessment.shipping_zip || 'Not specified'}</p>
        </div>
      </div>
    </section>
  );
};