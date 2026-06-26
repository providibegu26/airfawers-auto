import { useState, useMemo } from "react";
import { FaGasPump } from "react-icons/fa";
import DataTable from "../UI/DataTable";
import EmptyState from "../UI/EmptyState";
import Pagination from "../common/Pagination";

const ITEMS_PER_PAGE = 8;

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
};

const FuelTable = ({ vehicles, onAssignFuel, loading = false, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = vehicles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = useMemo(
    () => [
      {
        key: "immatriculation",
        header: "Immatriculation",
        render: (v) => (
          <span className="font-medium text-slate-900">{v.immatriculation || "—"}</span>
        ),
      },
      {
        key: "modele",
        header: "Marque / Modèle",
        render: (v) =>
          v.marque && v.modele ? `${v.marque} ${v.modele}` : "—",
      },
      {
        key: "quantite",
        header: "Quantité",
        numeric: true,
        render: (v) => (
          <span className="tabular-nums">
            {v.lastAttribution ? `${v.lastAttribution.quantite} L` : "—"}
          </span>
        ),
      },
      {
        key: "chauffeur",
        header: "Conducteur",
        render: (v) =>
          v.chauffeur
            ? `${v.chauffeur.prenom} ${v.chauffeur.nom}`
            : "Non assigné",
      },
      {
        key: "date",
        header: "Dernier ravitaillement",
        render: (v) => (
          <span className="tabular-nums text-xs text-slate-600">
            {formatDate(v.lastAttribution?.date)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (vehicle) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAssignFuel(vehicle);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <FaGasPump className="h-3.5 w-3.5" />
            Attribuer
          </button>
        ),
      },
    ],
    [onAssignFuel]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        onRowClick={onRowClick}
        emptyState={
          <EmptyState
            icon={FaGasPump}
            title="Aucun véhicule trouvé"
            description="Modifiez votre recherche ou ajoutez des véhicules à la flotte."
          />
        }
      />
      <Pagination
        totalItems={vehicles.length}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default FuelTable;
