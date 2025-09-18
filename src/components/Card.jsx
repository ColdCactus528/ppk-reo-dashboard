export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-eco-card rounded-xl border border-eco-border shadow ${className}`}>
      {title && <div className="px-4 pt-4 text-sm text-eco-mute">{title}</div>}
      <div className="p-4">{children}</div>
    </div>
  );
}
