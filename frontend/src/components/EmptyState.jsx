export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mb-4">
          <Icon size={24} className="text-muted" />
        </div>
      )}
      <p className="font-display text-lg mb-1">{title}</p>
      {message && <p className="text-muted text-sm max-w-sm mb-4">{message}</p>}
      {action}
    </div>
  );
}