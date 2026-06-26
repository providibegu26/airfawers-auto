import { useState, useMemo } from "react";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import StatusBadge from "../UI/StatusBadge";
import { VEHICULE_STATUS, resolveStatus } from "../UI/statusColors";
import { VehicleDetailsModal } from "./VehicleDetailsModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { AssignDriverModal } from "./AssignDriverModal";

export const VehicleTable = ({
  vehicles,
  loading = false,
  onUpdateVehicle,
  onDeleteVehicle,
  onAssignDriver,
}) => {
  const [modalState, setModalState] = useState({
    details: { show: false, vehicle: null },
    edit: { show: false, vehicle: null },
    assign: { show: false, vehicle: null },
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const closeModals = () =>
    setModalState({
      details: { show: false, vehicle: null },
      edit: { show: false, vehicle: null },
      assign: { show: false, vehicle: null },
    });

  const openModal = (type, vehicle) =>
    setModalState({
      details: { show: type === "details", vehicle: type === "details" ? vehicle : null },
      edit: { show: type === "edit", vehicle: type === "edit" ? vehicle : null },
      assign: { show: type === "assign", vehicle: type === "assign" ? vehicle : null },
    });

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        numeric: true,
        render: (v) => <span className="tabular-nums text-slate-500">{v.id}</span>,
      },
      { key: "marque", header: "Marque" },
      { key: "modele", header: "Modèle" },
      {
        key: "immatriculation",
        header: "Immatriculation",
        render: (v) => (
          <span className="font-medium text-slate-900">{v.immatriculation}</span>
        ),
      },
      {
        key: "categorie",
        header: "Catégorie",
        render: (v) => (
          <StatusBadge
            variant={v.categorie === "HEAVY" ? "danger" : "info"}
            label={v.categorie === "HEAVY" ? "HEAVY" : "LIGHT"}
          />
        ),
      },
      {
        key: "chauffeur",
        header: "Chauffeur",
        render: (vehicle) =>
          vehicle.chauffeur ? (
            <span className="text-slate-900">
              {vehicle.chauffeur.prenom} {vehicle.chauffeur.nom}
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal("assign", vehicle);
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <FaUserPlus className="h-3.5 w-3.5" />
              Attribuer
            </button>
          ),
      },
      {
        key: "statut",
        header: "Statut",
        render: (vehicle) => {
          const key = vehicle.chauffeur ? "attribué" : "non attribué";
          const resolved = resolveStatus(VEHICULE_STATUS, key);
          return <StatusBadge variant={resolved.variant} label={resolved.label} />;
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        className: "action-buttons",
        render: (vehicle) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => openModal("edit", vehicle)}
              className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Modifier le véhicule"
            >
              <FaEdit size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(vehicle)}
              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Supprimer le véhicule"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        onRowClick={(vehicle) => openModal("details", vehicle)}
      />

      <VehicleDetailsModal
        isOpen={modalState.details.show}
        vehicle={modalState.details.vehicle}
        onClose={closeModals}
      />

      <EditVehicleModal
        isOpen={modalState.edit.show}
        vehicle={modalState.edit.vehicle}
        onClose={closeModals}
        onSave={(updatedVehicle) => {
          onUpdateVehicle(updatedVehicle.id, updatedVehicle);
          closeModals();
        }}
      />

      <AssignDriverModal
        isOpen={modalState.assign.show}
        vehicle={modalState.assign.vehicle}
        onClose={closeModals}
        onAssign={async (driverId) => {
          await onAssignDriver(modalState.assign.vehicle.id, driverId);
          closeModals();
        }}
      />

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
                onDeleteVehicle(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Voulez-vous vraiment supprimer le véhicule{" "}
          <strong>{deleteTarget?.immatriculation}</strong> ?
        </p>
      </Modal>
    </>
  );
};
