const statusStyles = {
  booked: 'bg-gold/15 text-gold',
  shipped: 'bg-emerald/15 text-emerald',
  active: 'bg-emerald/25 text-emerald-light',
  returned: 'bg-muted/20 text-muted',
  overdue: 'bg-wine/15 text-wine',
  completed: 'bg-ink/10 text-ink',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[status] || 'bg-ink/10 text-ink'}`}>
      {status}
    </span>
  );
}