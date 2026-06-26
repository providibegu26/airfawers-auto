/**
 * Carte interne pour listes dans une modale (ex. entretiens du jour).
 */
const ModalCard = ({ children, className = "" }) => (
  <div
    className={`rounded-lg border border-slate-200 bg-white p-3 ${className}`}
  >
    {children}
  </div>
);

export default ModalCard;
