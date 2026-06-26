import { useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import StatusBadge from "../UI/StatusBadge";
import { VEHICULE_STATUS, resolveStatus } from "../UI/statusColors";

export const ChauffeurTable = ({
  chauffeurs,
  loading = false,
  onChauffeurClick,
  onUpdate,
  onDelete,
  hideActions = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = useMemo(() => {
    const cols = [
      {
        key: "id",
        header: "ID",
        numeric: true,
        render: (c) => <span className="tabular-nums text-slate-500">{c.id}</span>,
      },
      { key: "nom", header: "Nom", render: (c) => <span className="font-medium">{c.nom}</span> },
      { key: "postnom", header: "Post-nom" },
      { key: "prenom", header: "Prénom" },
      { key: "sexe", header: "Sexe" },
      {
        key: "email",
        header: "Email",
        render: (c) => (
          <span className="text-slate-600">{c.user?.email || "—"}</span>
        ),
      },
      {
        key: "telephone",
        header: "Téléphone",
        render: (c) => (
          <span className="tabular-nums">{c.telephone || "—"}</span>
        ),
      },
      {
        key: "vehicule",
        header: "Véhicule",
        render: (chauffeur) => {
          const v =
            chauffeur.vehicules?.length > 0 ? chauffeur.vehicules[0] : null;
          if (!v) return <span className="text-slate-400">—</span>;
          return (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {v.immatriculation}
            </span>
          );
        },
      },
      {
        key: "statut",
        header: "Statut",
        render: (chauffeur) => {
          const hasVehicle = chauffeur.vehicules?.length > 0;
          const key = hasVehicle ? "attribué" : "non attribué";
          const resolved = resolveStatus(VEHICULE_STATUS, key);
          return <StatusBadge variant={resolved.variant} label={resolved.label} />;
        },
      },
    ];

    if (!hideActions) {
      cols.push({
        key: "actions",
        header: "Actions",
        align: "right",
        className: "action-buttons",
        render: (chauffeur) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onUpdate(chauffeur)}
              className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Modifier le chauffeur"
            >
              <FaEdit size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(chauffeur)}
              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Supprimer le chauffeur"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ),
      });
    }

    return cols;
  }, [hideActions, onUpdate]);

  return (
    <>
      <DataTable
        columns={columns}
        data={chauffeurs}
        loading={loading}
        onRowClick={onChauffeurClick}
      />

      {!hideActions && (
        <Modal
          show={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirmer la suppression"
          size="sm"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                Supprimer
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Voulez-vous vraiment supprimer{" "}
            <strong>
              {deleteTarget?.prenom} {deleteTarget?.nom}
            </strong>{" "}
            ?
          </p>
        </Modal>
      )}
    </>
  );
};
