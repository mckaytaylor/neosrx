interface ShippingSectionProps {
  assessment: any;
}

export const ShippingSection = ({ assessment }: ShippingSectionProps) => {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Shipping Information</h3>
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <p className="text-sm text-muted-foreground">Contact Email</p>
          <p>{assessment.profiles?.email || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Contact Phone</p>
          <p>{assessment.cell_phone || 'Not specified'}</p>
        </div>
      </div>
    </section>
  );
};