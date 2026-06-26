import { useState, useEffect, useMemo } from "react";
import { FaCar, FaPlus } from "react-icons/fa";
import { VehicleTable } from "../components/Vehicules/VehicleTable";
import { AddVehicleModal } from "../components/Vehicules/AddVehicleModal";
import { SuccessModal } from "../components/UI/SuccessModal";
import PageHeader from "../components/UI/PageHeader";
import Button from "../components/UI/Button";
import ExportMenu from "../components/UI/ExportMenu";
import Card from "../components/UI/Card";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import { downloadCsv, downloadPdf } from "../utils/exportData";
import { apiPath } from "@/config/api";

const EXPORT_HEADERS = [
  "Immatriculation",
  "Marque",
  "Modèle",
  "Catégorie",
  "Kilométrage",
  "Chauffeur",
  "Statut",
];

const API = apiPath("/admin/vehicules");
const ITEMS_PER_PAGE = 10;

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (res.ok) setVehicles(data.vehicules || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.marque?.toLowerCase().includes(q) ||
        v.modele?.toLowerCase().includes(q) ||
        v.immatriculation?.toLowerCase().includes(q) ||
        v.categorie?.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  const paginatedVehicles = filteredVehicles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const buildExportRows = () =>
    filteredVehicles.map((v) => [
      v.immatriculation || "",
      v.marque || "",
      v.modele || "",
      v.categorie || "",
      v.kilometrage != null ? `${v.kilometrage} km` : "",
      v.chauffeur ? `${v.chauffeur.nom || ""} ${v.chauffeur.prenom || ""}`.trim() : "—",
      v.chauffeur ? "Attribué" : "Non attribué",
    ]);

  const handleExportListPdf = () =>
    downloadPdf({
      filename: "liste-vehicules",
      title: "Liste des véhicules",
      subtitle: `${filteredVehicles.length} véhicule(s)`,
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
      orientation: "landscape",
    });

  const handleExportListCsv = () =>
    downloadCsv({
      filename: "liste-vehicules",
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
    });

  const handleAddVehicle = async (vehicleData) => {
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      const data = await response.json();
      if (response.ok) {
        setVehicles((prev) => [...prev, data.vehicule]);
        setShowAddModal(false);
        setSuccessModal({
          isOpen: true,
          title: "Véhicule créé",
          message: "Véhicule créé avec succès.",
          details: `${data.vehicule.marque} ${data.vehicule.modele} — ${data.vehicule.immatriculation}`,
        });
      } else {
        setSuccessModal({
          isOpen: true,
          title: "Erreur de création",
          message: data.error || "Erreur lors de la création",
          details: "",
        });
      }
    } catch {
      setSuccessModal({
        isOpen: true,
        title: "Erreur réseau",
        message: "Impossible de créer le véhicule.",
        details: "",
      });
    }
  };

  const handleUpdateVehicle = async (id, vehicleData) => {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      const data = await response.json();
      if (response.ok) {
        setVehicles((prev) => prev.map((v) => (v.id === id ? data.vehicule : v)));
        setSuccessModal({
          isOpen: true,
          title: "Véhicule mis à jour",
          message: "Les modifications ont été enregistrées.",
          details: `${data.vehicule.immatriculation}`,
        });
      } else {
        setSuccessModal({
          isOpen: true,
          title: "Erreur de modification",
          message: data.error || "Erreur lors de la modification",
          details: "",
        });
      }
    } catch {
      setSuccessModal({
        isOpen: true,
        title: "Erreur réseau",
        message: "Impossible de mettre à jour le véhicule.",
        details: "",
      });
    }
  };

  const handleAssignDriver = async (vehicleId, driverId) => {
    const response = await fetch(`${API}/${vehicleId}/assign-driver`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chauffeurId: Number(driverId) }),
    });
    const data = await response.json();
    if (response.ok) {
      setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? data.vehicule : v)));
      setSuccessModal({
        isOpen: true,
        title: "Chauffeur assigné",
        message: data.message || "Chauffeur assigné avec succès.",
        details: data.vehicule.immatriculation,
      });
    } else {
      setSuccessModal({
        isOpen: true,
        title: "Erreur d'assignation",
        message: data.error || "Erreur lors de l'assignation",
        details: "",
      });
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (response.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        setSuccessModal({
          isOpen: true,
          title: "Véhicule supprimé",
          message: "Le véhicule a été retiré de la flotte.",
          details: "",
        });
      } else {
        const data = await response.json();
        setSuccessModal({
          isOpen: true,
          title: "Erreur de suppression",
          message: data.error || "Erreur lors de la suppression",
          details: "",
        });
      }
    } catch {
      setSuccessModal({
        isOpen: true,
        title: "Erreur réseau",
        message: "Impossible de supprimer le véhicule.",
        details: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des véhicules"
        subtitle={`${filteredVehicles.length} véhicule${filteredVehicles.length !== 1 ? "s" : ""} en flotte`}
        icon={FaCar}
        actions={
          <>
            <div className="w-full sm:w-56">
              <SearchBar
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Rechercher un véhicule…"
              />
            </div>
            <ExportMenu
              onExportPdf={handleExportListPdf}
              onExportCsv={handleExportListCsv}
            />
            <Button variant="primary" size="sm" icon={FaPlus} onClick={() => setShowAddModal(true)}>
              Ajouter
            </Button>
          </>
        }
      />

      <Card padding={false} className="overflow-hidden">
        <div id="vehicle-table-pdf">
          <VehicleTable
            vehicles={paginatedVehicles}
            loading={loading}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onAssignDriver={handleAssignDriver}
          />
        </div>
        <Pagination
          totalItems={filteredVehicles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={page}
          onPageChange={setPage}
        />
      </Card>

      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddVehicle}
        />
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        details={successModal.details}
      />
    </div>
  );
};

export default VehiclesPage;
