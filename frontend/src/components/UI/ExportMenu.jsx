import React, { useEffect, useRef, useState } from "react";
import { FaDownload, FaFilePdf, FaFileCsv, FaChevronDown } from "react-icons/fa";
import Button from "./Button";

/**
 * Bouton d'export avec menu déroulant (choix PDF ou CSV).
 */
const ExportMenu = ({
  onExportPdf,
  onExportCsv,
  label = "Exporter",
  size = "sm",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const choose = (fn) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondary"
        size={size}
        icon={FaDownload}
        iconRight={FaChevronDown}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => choose(onExportPdf)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          >
            <FaFilePdf className="text-red-500" />
            Exporter en PDF
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => choose(onExportCsv)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          >
            <FaFileCsv className="text-emerald-600" />
            Exporter en CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
