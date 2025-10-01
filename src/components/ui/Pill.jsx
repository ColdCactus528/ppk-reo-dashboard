export default function Pill({ tone = "green", children, className = "" }) {
  const tones = {
    green:  "bg-eco-green/30",
    amber:  "bg-eco-yellow/60",
    violet: "bg-eco-blue/40",
    gray:   "bg-eco-bg",
  };
  const dot = {
    green:  "bg-eco-green",
    amber:  "bg-eco-yellow",
    violet: "bg-eco-blue",
    gray:   "bg-eco-mute",
  }[tone] || "bg-eco-mute";

  return (
    <span className={`inline-flex items-center h-7 px-2.5 rounded-full text-xs ${tones[tone] || tones.gray} ${className}`}>
      <i className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`} />
      {children}
    </span>
  );
}
