import React, { useState } from "react";
import { FaQuestion } from "react-icons/fa";
import Modal from "../UI/Modal";
import ModalCard from "../UI/ModalCard";
import Button from "../UI/Button";

const CATEGORIES = [
  {
    title: "Catégorie A",
    accent: "text-blue-700",
    badge: "bg-blue-50 text-blue-700",
    items: [
      "Huile moteur",
      "Filtre à huile",
      "Filtre à air",
      "Filtre à essence",
      "Contrôle des liquides",
    ],
  },
  {
    title: "Catégorie B",
    accent: "text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    items: [
      "Catégorie A +",
      "Changement des bougies",
      "Plaquettes de freins",
      "Amortisseurs",
    ],
  },
  {
    title: "Catégorie C",
    accent: "text-red-700",
    badge: "bg-red-50 text-red-700",
    items: ["Catégorie B +", "Suspensions", "Pneus"],
  },
];

const MaintenanceCategoriesHelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold leading-none text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
        aria-label="Voir les catégories d'entretien"
        title="Catégories d'entretien"
      >
        <FaQuestion className="h-2.5 w-2.5" />
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Catégories d'entretien"
        subtitle="Référentiel des opérations par niveau de maintenance"
        size="md"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        }
      >
        <div className="space-y-3">
          {CATEGORIES.map(({ title, accent, badge, items }) => (
            <ModalCard key={title}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge}`}
                >
                  {title}
                </span>
              </div>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2 text-sm ${accent}`}
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </ModalCard>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default MaintenanceCategoriesHelpButton;
