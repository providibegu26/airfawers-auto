import React, { useEffect, useRef } from "react";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-4xl",
};

/**
 * Modale FleetTech — style unifié (calendrier admin).
 * Centrée, fond slate/50, coins arrondis, corps scrollable.
 *
 * API : show | isOpen, onClose, title, subtitle, icon, children, footer, size
 */
const Modal = ({
  show,
  isOpen,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  size = "md",
  onClose,
  closeOnOverlay = true,
  scrollable = true,
  bodyClassName = "",
  className = "",
}) => {
  const visible = show ?? isOpen;
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useRef(
    `modal-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  useEffect(() => {
    if (!visible) return undefined;

    const handleKey = (e) => {
      if (e.key === "Escape" && onCloseRef.current) onCloseRef.current();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    const t = setTimeout(() => panelRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  const bodyScrollClass = scrollable
    ? "max-h-[min(70vh,640px)] overflow-y-auto"
    : "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
        onClick={closeOnOverlay && onClose ? onClose : undefined}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className={`relative flex w-full flex-col ${sizeClasses[size] || sizeClasses.md} max-h-[90vh] transform overflow-hidden rounded-2xl bg-white shadow-xl outline-none transition-all ${className}`}
        >
          {(title || subtitle || onClose) && (
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0">
                  {title && (
                    <h3
                      id={titleId}
                      className="text-base font-semibold leading-snug text-slate-900"
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
                  )}
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  className="-m-1.5 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div
            className={`px-5 py-4 ${bodyScrollClass} ${bodyClassName}`}
          >
            {children}
          </div>
          {footer && (
            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
