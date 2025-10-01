export default function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border border-eco-border bg-white hover:bg-eco-bg transition ${className}`}
    >
      {children}
    </button>
  );
}
