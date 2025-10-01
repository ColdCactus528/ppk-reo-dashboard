export default function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`bg-eco-card border border-eco-border rounded-xl p-6 shadow-sm ${className}`}>
      <div className="mb-3">
        <h3 className="text-[16px] md:text-[18px] font-semibold">{title}</h3>
        {subtitle ? <div className="text-xs text-eco-mute">{subtitle}</div> : null}
      </div>
      {children}
    </section>
  );
}
