import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaMapMarkerAlt,
  FaCheck,
  FaTools,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";
import PannesMap from "../components/Pannes/PannesMap";
import PannesStatsCards from "../components/Pannes/PannesStatsCards";
import PanneLocationModal from "../components/Pannes/PanneLocationModal";
import PageHeader from "../components/UI/PageHeader";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import DataTable from "../components/UI/DataTable";
import EmptyState from "../components/UI/EmptyState";
import Modal from "../components/UI/Modal";
import StatusBadge from "../components/UI/StatusBadge";
import {
  PANNE_STATUS,
  PANNE_NIVEAU,
  VEHICULE_STATUS,
  STATUS_DOTS,
  resolveStatus,
} from "../components/UI/statusColors";
import {
  fetchAllPannes,
  fetchPanneStats,
  fetchPanneMeta,
  updatePanneStatut,
} from "../services/panneService";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "actives", label: "Actives" },
  { key: "en_attente", label: "En attente" },
  { key: "en_cours", label: "En cours" },
  { key: "resolue", label: "Résolues" },
];

const MAP_LEGEND = [
  { variant: "warning", label: "En attente" },
  { variant: "info", label: "En cours" },
  { variant: "neutral", label: "Résolue" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Pannes = () => {
  const [pannes, setPannes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    enCours: 0,
    resolues: 0,
    actives: 0,
  });
  const [labels, setLabels] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [locationPanne, setLocationPanne] = useState(null);
  const [confirmPanne, setConfirmPanne] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const statutParam =
        filter === "all" || filter === "actives" ? undefined : filter;
      const [pannesData, statsData, metaData] = await Promise.all([
        fetchAllPannes(statutParam),
        fetchPanneStats(),
        fetchPanneMeta(),
      ]);
      setPannes(pannesData);
      setStats(statsData);
      setLabels(metaData.labels || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedPannes = useMemo(() => {
    if (filter === "actives") {
      return pannes.filter(
        (p) => p.statut === "en_attente" || p.statut === "en_cours"
      );
    }
    return pannes;
  }, [pannes, filter]);

  const mapPannes = useMemo(() => {
    if (filter === "actives") return displayedPannes;
    return pannes.filter((p) => p.statut !== "resolue");
  }, [pannes, displayedPannes, filter]);

  const statusLabels = labels.statuts || {};
  const typeLabels = labels.types || {};
  const niveauLabels = labels.niveauxGravite || {};

  const handleStatusUpdate = async () => {
    if (!confirmPanne || !confirmAction) return;
    try {
      setUpdating(true);
      await updatePanneStatut(confirmPanne.id, confirmAction);
      setConfirmPanne(null);
      setConfirmAction(null);
      if (selectedPanne?.id === confirmPanne.id && confirmAction === "resolue") {
        setSelectedPanne(null);
      }
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRowClick = (panne) => {
    setSelectedPanne(panne);
  };

  const columns = useMemo(
    () => [
      {
        key: "vehicule",
        header: "Véhicule",
        render: (panne) => (
          <div>
            <div className="font-medium text-slate-900">
              {panne.vehicule?.immatriculation || "—"}
            </div>
            <div className="text-xs text-slate-500">
              {panne.vehicule?.marque} {panne.vehicule?.modele}
            </div>
          </div>
        ),
      },
      {
        key: "vehiculeStatut",
        header: "Statut véhicule",
        render: (panne) => {
          const vehiculeStatut = panne.vehicule?.statut;
          const resolved = resolveStatus(VEHICULE_STATUS, vehiculeStatut);
          return (
            <StatusBadge
              variant={resolved.variant}
              label={resolved.label}
            />
          );
        },
      },
      {
        key: "chauffeur",
        header: "Conducteur",
        render: (panne) => (
          <div>
            <div className="text-slate-900">
              {panne.chauffeur?.nomComplet || "—"}
            </div>
            {panne.chauffeur?.telephone && (
              <div className="text-xs text-slate-500">
                {panne.chauffeur.telephone}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "panne",
        header: "Panne",
        cellClassName: "max-w-xs",
        render: (panne) => (
          <div>
            <div className="text-slate-900">
              {typeLabels[panne.type] || panne.type}
            </div>
            <div
              className="truncate text-xs text-slate-500"
              title={panne.description}
            >
              {panne.description}
            </div>
          </div>
        ),
      },
      {
        key: "gravite",
        header: "Gravité",
        render: (panne) => {
          const resolved = resolveStatus(PANNE_NIVEAU, panne.niveauGravite);
          return (
            <StatusBadge
              variant={resolved.variant}
              label={niveauLabels[panne.niveauGravite] || resolved.label}
            />
          );
        },
      },
      {
        key: "date",
        header: "Date",
        render: (panne) => (
          <span className="text-xs text-slate-600 tabular-nums">
            {formatDate(panne.dateSignalement)}
          </span>
        ),
      },
      {
        key: "statut",
        header: "Statut",
        render: (panne) => {
          const resolved = resolveStatus(PANNE_STATUS, panne.statut);
          return (
            <StatusBadge
              variant={resolved.variant}
              label={statusLabels[panne.statut] || resolved.label}
            />
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (panne) => (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLocationPanne(panne)}
              className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Voir la localisation"
            >
              <FaMapMarkerAlt size={14} />
            </button>
            {panne.statut === "en_attente" && (
              <button
                type="button"
                onClick={() => {
                  setConfirmPanne(panne);
                  setConfirmAction("en_cours");
                }}
                className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Prendre en charge"
              >
                <FaTools size={14} />
              </button>
            )}
            {panne.statut !== "resolue" && (
              <button
                type="button"
                onClick={() => {
                  setConfirmPanne(panne);
                  setConfirmAction("resolue");
                }}
                className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Marquer comme résolue"
              >
                <FaCheck size={14} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [statusLabels, typeLabels, niveauLabels]
  );

  const confirmTitle =
    confirmAction === "resolue" ? "Confirmer la résolution" : "Prendre en charge";
  const confirmMessage =
    confirmAction === "resolue"
      ? "La panne sera archivée dans l'historique et le statut du véhicule sera mis à jour."
      : "Cette panne passera en traitement.";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des pannes"
        subtitle={`${stats.actives ?? 0} panne(s) active(s) sur la flotte`}
        icon={FaExclamationTriangle}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={FaSync}
            loading={loading}
            onClick={loadData}
          >
            Actualiser
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <PannesStatsCards stats={stats} />

      {/* Carte — panneau principal */}
      <Card padding={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Carte des pannes
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Cliquez sur une ligne ou un marqueur pour synchroniser la sélection
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {MAP_LEGEND.map(({ variant, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_DOTS[variant]}`}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4">
          <PannesMap
            pannes={mapPannes}
            selectedPanne={selectedPanne}
            onSelectPanne={setSelectedPanne}
            height="420px"
          />
        </div>
      </Card>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFilter(key);
              setSelectedPanne(null);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              filter === key
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tableau synchronisé avec la carte */}
      <DataTable
        columns={columns}
        data={displayedPannes}
        loading={loading}
        selectedKey={selectedPanne?.id}
        onRowClick={handleRowClick}
        emptyState={
          <EmptyState
            icon={FaExclamationTriangle}
            title="Aucune panne à afficher"
            description="Modifiez le filtre ou attendez un signalement chauffeur."
          />
        }
      />

      <PanneLocationModal
        show={!!locationPanne}
        onClose={() => setLocationPanne(null)}
        panne={locationPanne}
      />

      <Modal
        show={!!confirmPanne}
        onClose={() => {
          if (!updating) {
            setConfirmPanne(null);
            setConfirmAction(null);
          }
        }}
        title={confirmTitle}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={updating}
              onClick={() => {
                setConfirmPanne(null);
                setConfirmAction(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant={confirmAction === "resolue" ? "primary" : "primary"}
              size="sm"
              loading={updating}
              onClick={handleStatusUpdate}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">{confirmMessage}</p>
      </Modal>
    </div>
  );
};

export default Pannes;
