import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaTrash, FaTools } from "react-icons/fa";
import MaintenancePageShell from "../components/Entretiens/MaintenancePageShell";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import DataTable from "../components/UI/DataTable";
import EmptyState from "../components/UI/EmptyState";
import Modal from "../components/UI/Modal";
import StatusBadge from "../components/UI/StatusBadge";
import ToastNotification from "../components/UI/ToastNotification";
import { apiPath } from "@/config/api";

const API = apiPath("/admin/entretiens");

const TYPE_LABELS = {
  vidange: "Catégorie A",
  bougies: "Catégorie B",
  freins: "Catégorie C",
};

const TYPE_VARIANTS = {
  vidange: "info",
  bougies: "warning",
  freins: "danger",
};

const HistoriqueEntretiens = () => {
  const navigate = useNavigate();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchHistorique = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/history`);
      const data = await response.json();
      if (response.ok) {
        setHistorique(data.historique || []);
      } else {
        setError(data.error || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur réseau lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorique();
  }, []);

  const showToast = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteEntretien = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API}/${deleteTarget}`, { method: "DELETE" });
      if (response.ok) {
        showToast("Entretien supprimé", "success");
        setDeleteTarget(null);
        fetchHistorique();
      } else {
        const data = await response.json();
        showToast(data.error || "Erreur lors de la suppression", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAll = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API}/clear/all`, { method: "DELETE" });
      if (response.ok) {
        const data = await response.json();
        showToast(data.message || "Historique vidé", "success");
        setHistorique([]);
        setShowClearConfirm(false);
      } else {
        const data = await response.json();
        showToast(data.error || "Erreur lors du vidage", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: historique.length,
      vidange: historique.filter((e) => e.type === "vidange").length,
      bougies: historique.filter((e) => e.type === "bougies").length,
      freins: historique.filter((e) => e.type === "freins").length,
    }),
    [historique]
  );

  const columns = useMemo(
    () => [
      {
        key: "vehicule",
        header: "Véhicule",
        render: (e) => (
          <div>
            <div className="font-medium text-slate-900">
              {e.vehicule?.immatriculation}
            </div>
            <div className="text-xs text-slate-500">
              {e.vehicule?.marque} {e.vehicule?.modele}
            </div>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (e) => (
          <StatusBadge
            variant={TYPE_VARIANTS[e.type] || "neutral"}
            label={TYPE_LABELS[e.type] || e.type}
          />
        ),
      },
      {
        key: "kilometrage",
        header: "Kilométrage",
        numeric: true,
        render: (e) => (
          <span className="tabular-nums">
            {e.kilometrage?.toLocaleString("fr-FR")} km
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        render: (e) =>
          new Date(e.dateEffectuee).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        key: "description",
        header: "Description",
        cellClassName: "max-w-xs truncate",
        render: (e) => e.description || "—",
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (e) => (
          <button
            type="button"
            onClick={() => setDeleteTarget(e.id)}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Supprimer cet entretien"
          >
            <FaTrash size={14} />
          </button>
        ),
      },
    ],
    []
  );

  const rows = historique.map((e) => ({ ...e, id: e.id }));

  return (
    <MaintenancePageShell
      title="Historique des entretiens"
      subtitle="Entretiens validés et archivés"
      icon={FaHistory}
      loading={loading}
      error={error}
      actions={
        historique.length > 0 ? (
          <Button
            variant="danger"
            size="sm"
            icon={FaTrash}
            onClick={() => setShowClearConfirm(true)}
          >
            Vider l&apos;historique
          </Button>
        ) : null
      }
    >
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {historique.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total", value: stats.total, iconClass: "bg-indigo-100 text-indigo-600" },
            { label: "Catégorie A", value: stats.vidange, iconClass: "bg-blue-100 text-blue-600" },
            { label: "Catégorie B", value: stats.bougies, iconClass: "bg-amber-100 text-amber-600" },
            { label: "Catégorie C", value: stats.freins, iconClass: "bg-red-100 text-red-600" },
          ].map(({ label, value, iconClass }) => (
            <div key={label} className="rounded-lg bg-white p-4 shadow">
              <div className="flex items-center">
                <div className={`rounded-md p-2.5 ${iconClass}`}>
                  <FaTools />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card padding={false} className="overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          emptyState={
            <EmptyState
              icon={FaTools}
              title="Aucun entretien enregistré"
              description="Les entretiens validés apparaîtront ici."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/admin/entretiens")}
                >
                  Retour aux entretiens
                </Button>
              }
            />
          }
        />
      </Card>

      <Modal
        show={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Supprimer cet entretien"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDeleteEntretien}>
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Cette action est irréversible.
        </p>
      </Modal>

      <Modal
        show={showClearConfirm}
        onClose={() => !deleting && setShowClearConfirm(false)}
        title="Vider tout l'historique"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" disabled={deleting} onClick={() => setShowClearConfirm(false)}>
              Annuler
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleClearAll}>
              Vider ({historique.length})
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Supprimer définitivement {historique.length} entretien(s) de l&apos;historique ?
        </p>
      </Modal>
    </MaintenancePageShell>
  );
};

export default HistoriqueEntretiens;
