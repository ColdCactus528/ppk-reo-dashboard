import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, title, children, okText = "Ок", autoCloseMs }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(() => onClose?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose?.()}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-eco-border shadow-soft p-5">
        {title && <div className="text-lg font-semibold mb-2">{title}</div>}
        <div className="text-sm">{children}</div>
        <div className="mt-4 flex justify-end">
          <button
            autoFocus
            className="h-10 px-4 rounded-xl border border-eco-border bg-white text-sm"
            onClick={onClose}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
