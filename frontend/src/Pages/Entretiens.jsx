import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaOilCan,
  FaPlug,
  FaCar,
  FaExclamationTriangle,
  FaTachometerAlt,
  FaCalendarAlt,
  FaTools,
  FaChevronRight,
} from "react-icons/fa";
import MileageModal from "../components/Entretiens/MileageModal";
import MileageWindowPanel from "../components/Entretiens/MileageWindowPanel";
import MaintenanceCategoriesHelpButton from "../components/Entretiens/MaintenanceCategoriesHelpButton";
import PageHeader from "../components/UI/PageHeader";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import KpiCard from "../components/UI/KpiCard";
import ToastNotification from "../components/UI/ToastNotification";
import { useMaintenanceVehicles } from "../hooks/useMaintenanceVehicles";
import {
  countCategoryMaintenance,
  getUrgentMaintenance,
  updateVehicleMileage,
  fetchVehicles,
} from "../services/maintenanceService";

const CATEGORY_CARDS = [
  {
    title: "Catégorie A",
    label: "Vidange & filtres",
    icon: FaOilCan,
    accent: "blue",
    iconClass: "bg-blue-50 text-blue-600",
    route: "/admin/entretiens/vidange",
    key: "vidange",
  },
  {
    title: "Catégorie B",
    label: "Bougies & freins",
    icon: FaPlug,
    accent: "amber",
    iconClass: "bg-amber-50 text-amber-600",
    route: "/admin/entretiens/categorie_b",
    key: "categorie_b",
  },
  {
    title: "Catégorie C",
    label: "Suspensions & pneus",
    icon: FaCar,
    accent: "red",
    iconClass: "bg-red-50 text-red-600",
    route: "/admin/entretiens/categorie_c",
    key: "categorie_c",
  },
  {
    title: "Urgents",
    label: "Échéance ≤ 7 jours",
    icon: FaExclamationTriangle,
    accent: "amber",
    iconClass: "bg-orange-50 text-orange-600",
    route: "/admin/entretiens/urgents",
    key: "urgent",
    highlightWhenPositive: true,
  },
];

const CategoryCardSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-100" />
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="h-7 w-10 rounded bg-slate-100" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-4 w-4 rounded bg-slate-100" />
    </div>
  </div>
);

const Entretiens = () => {
  const navigate = useNavigate();
  const { vehicles, setVehicles, loading, error } = useMaintenanceVehicles();
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMileageUpdate = async (vehiclePlate, newMileage) => {
    await updateVehicleMileage(vehiclePlate, newMileage);
    const updated = await fetchVehicles();
    setVehicles(updated);
    showToast("Kilométrage mis à jour avec succès", "success");
  };

  const getCount = (key) => {
    if (key === "urgent") return getUrgentMaintenance(vehicles).length;
    return countCategoryMaintenance(vehicles, key);
  };

  const urgentCount = getCount("urgent");
  const totalPlanned =
    getCount("vidange") +
    getCount("categorie_b") +
    getCount("categorie_c");

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Entretiens"
          subtitle="Planification et suivi des maintenances par catégorie"
          icon={FaTools}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <PageHeader
        title="Entretiens"
        subtitle="Planification et suivi des maintenances par catégorie"
        icon={FaTools}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={FaCalendarAlt}
              onClick={() => navigate("/admin/entretiens/historique")}
            >
              Historique
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={FaTachometerAlt}
              onClick={() => setShowModal(true)}
            >
              Kilométrage
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Véhicules suivis"
          value={vehicles.length}
          hint="Flotte active"
          icon={FaCar}
          accent="indigo"
        />
        <KpiCard
          label="Entretiens planifiés"
          value={totalPlanned}
          hint="Hors urgences immédiates"
          icon={FaTools}
          accent="blue"
        />
        <KpiCard
          label="Urgents"
          value={urgentCount}
          hint={urgentCount > 0 ? "Action requise" : "Aucune urgence"}
          icon={FaExclamationTriangle}
          accent={urgentCount > 0 ? "amber" : "emerald"}
          hintClassName={
            urgentCount > 0 ? "text-amber-600" : "text-emerald-600"
          }
        />
      </div>

      {urgentCount > 0 && (
        <button
          type="button"
          onClick={() => navigate("/admin/entretiens/urgents")}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FaExclamationTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {urgentCount} entretien{urgentCount > 1 ? "s" : ""} urgent
                {urgentCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-700">
                Échéance dans les 7 prochains jours
              </p>
            </div>
          </div>
          <FaChevronRight className="h-4 w-4 shrink-0 text-amber-500" />
        </button>
      )}

      <MileageWindowPanel />

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-slate-900">
                Suivi par catégorie
              </h2>
              <MaintenanceCategoriesHelpButton />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Accédez au détail prévisionnel de chaque niveau de maintenance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map(
            ({
              title,
              label,
              icon: Icon,
              iconClass,
              route,
              key,
              highlightWhenPositive,
            }) => {
              const count = getCount(key);
              const isUrgentHighlight =
                highlightWhenPositive && count > 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(route)}
                  className={`group rounded-xl border bg-white p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    isUrgentHighlight
                      ? "border-amber-200 hover:border-amber-300 hover:shadow-sm"
                      : "border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          {title}
                        </p>
                        <p
                          className={`text-2xl font-semibold tabular-nums ${
                            isUrgentHighlight
                              ? "text-amber-700"
                              : "text-slate-900"
                          }`}
                        >
                          {count}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {label}
                        </p>
                      </div>
                    </div>
                    <FaChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Calendrier de maintenance
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Visualisez les échéances sur un calendrier mensuel
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={FaCalendarAlt}
          onClick={() => navigate("/admin/maintenance-calendar")}
        >
          Ouvrir le calendrier
        </Button>
      </Card>

      {showModal && (
        <MileageModal
          show
          onClose={() => setShowModal(false)}
          vehicles={vehicles}
          onUpdate={showToast}
          onMileageUpdate={handleMileageUpdate}
        />
      )}
    </div>
  );
};

export default Entretiens;
