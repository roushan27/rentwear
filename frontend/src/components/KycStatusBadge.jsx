const styles = {
  pending: 'bg-gold/15 text-gold',
  verified: 'bg-emerald/15 text-emerald',
  rejected: 'bg-wine/15 text-wine',
};

export default function KycStatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
      KYC: {status}
    </span>
  );
}