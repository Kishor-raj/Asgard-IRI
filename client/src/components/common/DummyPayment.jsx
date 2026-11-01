import PaymentCheckout from './PaymentCheckout';
import Button from './Button';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function DummyPayment({ onConfirm, loading, entityId, entityType, amount, participantName, participantEmail, onSuccess }) {
  if (entityId) {
    return (
      <PaymentCheckout
        amount={amount || 2500}
        entityType={entityType || 'conference_registration'}
        entityId={entityId}
        participantName={participantName}
        participantEmail={participantEmail}
        onSuccess={onSuccess || onConfirm}
      />
    );
  }

  return (
    <div className="bg-white border border-grey-200 rounded-2xl p-6 text-center max-w-md mx-auto shadow-card">
      <div className="w-14 h-14 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCardIcon className="w-7 h-7 text-navy" />
      </div>
      <h3 className="font-display font-semibold text-navy text-lg mb-2">
        Online Payment Gateway
      </h3>
      <p className="text-grey-600 text-xs mb-6">
        Proceed with instant Razorpay checkout or complete administrative verification.
      </p>
      <Button onClick={onConfirm} loading={loading} variant="primary">
        Proceed to Gateway
      </Button>
    </div>
  );
}
