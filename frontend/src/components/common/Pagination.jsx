const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
      <p className="text-sm text-slate-500">
        Affichage{" "}
        <span className="font-medium tabular-nums text-slate-700">
          {(currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        à{" "}
        <span className="font-medium tabular-nums text-slate-700">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        sur{" "}
        <span className="font-medium tabular-nums text-slate-700">{totalItems}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium tabular-nums text-white">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Pagination;
