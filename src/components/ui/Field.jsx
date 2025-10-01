export default function Field({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[12px] text-eco-mute">{label}</span>
      {children}
    </label>
  );
}
