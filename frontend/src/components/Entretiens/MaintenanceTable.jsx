import { useMemo } from "react";
import { FaCheck } from "react-icons/fa";
import DataTable from "../UI/DataTable";
import EmptyState from "../UI/EmptyState";
import StatusBadge from "../UI/StatusBadge";
import Button from "../UI/Button";

const urgencyStatus = (jours) => {
  if (jours < 0) return { variant: "danger", label: "En retard" };
  if (jours <= 7) return { variant: "danger", label: "Urgent" };
  if (jours <= 14) return { variant: "warning", label: "À venir" };
  return { variant: "success", label: "Normal" };
};

const MaintenanceTable = ({ data = [], onComplete, loading = false, emptyTitle }) => {
  const rows = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        id: `${item.immatriculation}-${item.type}`,
      })),
    [data]
  );

  const columns = useMemo(() => {
    const cols = [
      {
        key: "vehicule",
        header: "Véhicule",
        render: (item) => (
          <div>
            <div className="font-medium text-slate-900">{item.immatriculation || "—"}</div>
            <div className="text-xs text-slate-500">
              {item.marque} {item.modele}
            </div>
          </div>
        ),
      },
      {
        key: "chauffeur",
        header: "Chauffeur",
        render: (item) => item.chauffeur || "Non assigné",
      },
      { key: "type", header: "Type" },
      {
        key: "kilometrage",
        header: "Kilométrage",
        numeric: true,
        render: (item) => (
          <span className="tabular-nums">
            {(item.kilometrage || 0).toLocaleString("fr-FR")} km
          </span>
        ),
      },
      {
        key: "dateEntretien",
        header: "Date entretien",
        render: (item) => item.dateEntretien || "—",
      },
      {
        key: "joursRestants",
        header: "Jours restants",
        numeric: true,
        render: (item) => {
          const j = item.joursRestants || 0;
          const text =
            j < 0
              ? `${Math.abs(j)} j. de retard`
              : `${j} jour${j !== 1 ? "s" : ""}`;
          return (
            <span
              className={`tabular-nums font-medium ${
                j <= 7 ? "text-red-600" : j <= 14 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {text}
            </span>
          );
        },
      },
      {
        key: "statut",
        header: "Statut",
        render: (item) => {
          const s = urgencyStatus(item.joursRestants || 0);
          return <StatusBadge variant={s.variant} label={s.label} />;
        },
      },
    ];

    if (onComplete) {
      cols.push({
        key: "actions",
        header: "Actions",
        align: "right",
        render: (item) => (
          <Button
            variant="primary"
            size="sm"
            icon={FaCheck}
            onClick={(e) => {
              e.stopPropagation();
              onComplete(item.immatriculation, item.type);
            }}
          >
            Valider
          </Button>
        ),
      });
    }

    return cols;
  }, [onComplete]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      loading={loading}
      emptyState={
        <EmptyState
          title={emptyTitle || "Aucun entretien à afficher"}
          description="Tous les entretiens de cette catégorie sont à jour."
        />
      }
    />
  );
};

export default MaintenanceTable;
