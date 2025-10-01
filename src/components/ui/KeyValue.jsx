export function KeyValue({ icon = null, label, value, actions = null, className = "" }) {
  return (
    <div className={`grid grid-cols-[auto,1fr,auto] items-center gap-2 py-1 ${className}`}>
      <span className="text-[12px] text-eco-mute">{label}</span>
      <div className="flex items-center gap-2">
        {icon ? <span className="opacity-70">{icon}</span> : null}
        <span className="text-[15px]">{value ?? <span className="text-eco-mute">—</span>}</span>
      </div>
      <div className="flex gap-1">{actions}</div>
    </div>
  );
}
