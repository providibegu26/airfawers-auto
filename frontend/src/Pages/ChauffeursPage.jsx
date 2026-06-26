import { useState, useEffect, useMemo } from "react";
import { FaUserTie, FaPlus } from "react-icons/fa";
import { ChauffeurTable } from "../components/Chauffeurs/ChauffeurTable";
import { ChauffeurDetailsModal } from "../components/Chauffeurs/ChauffeurDetailsModal";
import { AddChauffeurModal } from "../components/Chauffeurs/AddChauffeurModal";
import { EditChauffeurModal } from "../components/Chauffeurs/EditChauffeurModal";
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
  "Nom",
  "Post-nom",
  "Prénom",
  "Sexe",
  "Téléphone",
  "Email",
  "Véhicule assigné",
];

const API_CHAUFFEURS = apiPath("/admin/chauffeurs");
const API_VEHICULES = apiPath("/admin/vehicules");
const ITEMS_PER_PAGE = 10;

export const ChauffeursPage = () => {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chRes, vRes] = await Promise.all([
        fetch(API_CHAUFFEURS).then((r) => r.json()),
        fetch(API_VEHICULES).then((r) => r.json()),
      ]);
      setChauffeurs(chRes.chauffeurs || []);
      setVehicles(vRes.vehicules || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredChauffeurs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return chauffeurs;
    return chauffeurs.filter(
      (c) =>
        c.nom?.toLowerCase().includes(q) ||
        c.postnom?.toLowerCase().includes(q) ||
        c.prenom?.toLowerCase().includes(q) ||
        c.sexe?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q) ||
        c.telephone?.toLowerCase().includes(q)
    );
  }, [chauffeurs, search]);

  const paginatedChauffeurs = filteredChauffeurs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSaveChauffeur = async (chauffeurData) => {
    try {
      const response = await fetch(API_CHAUFFEURS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chauffeurData),
      });
      const data = await response.json();
      if (response.ok) {
        setShowAddModal(false);
        const newChauffeur = {
          ...data.user,
          user: { email: data.user.email, motDePasseDefini: false },
        };
        setChauffeurs((prev) => [...prev, newChauffeur]);
        setSuccessData({
          title: "Chauffeur créé",
          message: "Le chauffeur a été enregistré dans le système.",
          details: {
            Email: data.user.email,
            "Mot de passe temporaire": data.user.motDePasseTemporaire,
          },
        });
        setShowSuccessModal(true);
      } else {
        setSuccessData({
          title: "Erreur",
          message: data.error || "Erreur lors de la création",
        });
        setShowSuccessModal(true);
      }
    } catch {
      setSuccessData({
        title: "Erreur réseau",
        message: "Impossible de créer le chauffeur.",
      });
      setShowSuccessModal(true);
    }
  };

  const handleUpdateChauffeur = (chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setShowEditModal(true);
  };

  const handleSaveChauffeurUpdate = async (updatedChauffeur) => {
    try {
      const response = await fetch(`${API_CHAUFFEURS}/${updatedChauffeur.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: updatedChauffeur.nom,
          postnom: updatedChauffeur.postnom,
          prenom: updatedChauffeur.prenom,
          sexe: updatedChauffeur.sexe,
          telephone: updatedChauffeur.telephone,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setChauffeurs((prev) =>
          prev.map((c) => (c.id === updatedChauffeur.id ? data.chauffeur : c))
        );
        setShowEditModal(false);
        setSuccessData({
          title: "Chauffeur modifié",
          message: "Les informations ont été mises à jour.",
          details: {
            Nom: data.chauffeur.nom,
            Email: data.chauffeur.user?.email,
          },
        });
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        setSuccessData({
          title: "Erreur",
          message: data.error || "Erreur lors de la modification",
        });
        setShowSuccessModal(true);
      }
    } catch {
      setSuccessData({
        title: "Erreur réseau",
        message: "Impossible de modifier le chauffeur.",
      });
      setShowSuccessModal(true);
    }
  };

  const handleDeleteChauffeur = async (id) => {
    try {
      const response = await fetch(`${API_CHAUFFEURS}/${id}`, { method: "DELETE" });
      if (response.ok) {
        setChauffeurs((prev) => prev.filter((c) => c.id !== id));
        setSuccessData({
          title: "Chauffeur supprimé",
          message: "Le chauffeur a été retiré du système.",
        });
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        setSuccessData({
          title: "Erreur",
          message: data.error || "Erreur lors de la suppression",
        });
        setShowSuccessModal(true);
      }
    } catch {
      setSuccessData({
        title: "Erreur réseau",
        message: "Impossible de supprimer le chauffeur.",
      });
      setShowSuccessModal(true);
    }
  };

  const buildExportRows = () =>
    filteredChauffeurs.map((c) => {
      const vehicule = vehicles.find((v) => v.chauffeurId === c.id);
      return [
        c.nom || "",
        c.postnom || "",
        c.prenom || "",
        c.sexe || "",
        c.telephone || "",
        c.user?.email || "",
        vehicule ? vehicule.immatriculation : "—",
      ];
    });

  const handleExportListPdf = () =>
    downloadPdf({
      filename: "liste-chauffeurs",
      title: "Liste des chauffeurs",
      subtitle: `${filteredChauffeurs.length} chauffeur(s)`,
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
      orientation: "landscape",
    });

  const handleExportListCsv = () =>
    downloadCsv({
      filename: "liste-chauffeurs",
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des chauffeurs"
        subtitle={`${filteredChauffeurs.length} chauffeur${filteredChauffeurs.length !== 1 ? "s" : ""} enregistré${filteredChauffeurs.length !== 1 ? "s" : ""}`}
        icon={FaUserTie}
        actions={
          <>
            <div className="w-full sm:w-56">
              <SearchBar
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Rechercher un chauffeur…"
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
        <div id="chauffeur-table-pdf">
          <ChauffeurTable
            chauffeurs={paginatedChauffeurs}
            loading={loading}
            onChauffeurClick={setSelectedChauffeur}
            onUpdate={handleUpdateChauffeur}
            onDelete={handleDeleteChauffeur}
          />
        </div>
        <Pagination
          totalItems={filteredChauffeurs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={page}
          onPageChange={setPage}
        />
      </Card>

      {selectedChauffeur && !showEditModal && (
        <ChauffeurDetailsModal
          chauffeur={selectedChauffeur}
          onClose={() => setSelectedChauffeur(null)}
          vehicles={vehicles}
        />
      )}

      {showAddModal && (
        <AddChauffeurModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveChauffeur}
        />
      )}

      {showEditModal && selectedChauffeur && (
        <EditChauffeurModal
          chauffeur={selectedChauffeur}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleSaveChauffeurUpdate}
        />
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successData.title}
        message={successData.message}
        details={successData.details}
      />
    </div>
  );
};

export default ChauffeursPage;
