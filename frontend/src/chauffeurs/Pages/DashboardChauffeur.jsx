import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import {
  FaCar,
  FaTools,
  FaGasPump,
  FaExclamationTriangle,
  FaChevronRight,
  FaTachometerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { fetchChauffeurMileageStatus } from "../../services/chauffeurMileageService";
import {
  fetchChauffeurProfile,
} from "../../services/chauffeurProfileService";
import {
  getClosestMaintenance,
  formatMaintenanceCountdown,
  formatMaintenanceCountdownLong,
} from "../../services/maintenanceService";

const QUICK_ACTIONS = [
  {
    id: "vehicule",
    title: "Mon véhicule",
    description: "Détails et kilométrage actuel",
    icon: FaCar,
    tint: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "entretien",
    title: "Entretiens prévus",
    description: "Échéances par catégorie",
    icon: FaTools,
    tint: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    id: "carburant",
    title: "Carburant",
    description: "Attribution et confirmation",
    icon: FaGasPump,
    tint: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
];

const DashboardChauffeur = () => {
  const { openModal } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [mileageStatus, setMileageStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [prof, mileage] = await Promise.all([
          fetchChauffeurProfile().catch(() => null),
          fetchChauffeurMileageStatus().catch(() => null),
        ]);
        if (!cancelled) {
          setProfile(prof);
          setMileageStatus(mileage);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const vehicle = profile?.vehicule;

  const closestMaintenance = useMemo(
    () => getClosestMaintenance(vehicle),
    [vehicle]
  );

  const overviewCards = [
    {
      id: "km",
      label: "Kilométrage",
      value: vehicle ? `${(vehicle.kilometrage || 0).toLocaleString("fr-FR")} km` : "—",
      sub: vehicle?.immatriculation || "Aucun véhicule",
      gradient: "from-violet-500 to-purple-600",
      action: vehicle ? () => openModal("kilometrage") : null,
      disabled: !mileageStatus?.peutSaisir,
    },
    {
      id: "entretien",
      label: "Prochain entretien",
      value: closestMaintenance
        ? formatMaintenanceCountdown(closestMaintenance.daysRemaining)
        : "—",
      sub: closestMaintenance
        ? `${closestMaintenance.typeLabel} · ${formatMaintenanceCountdownLong(closestMaintenance.daysRemaining)}`
        : "Pas de données",
      gradient: closestMaintenance?.isOverdue || closestMaintenance?.isUrgent
        ? "from-rose-500 to-red-600"
        : "from-amber-500 to-orange-500",
      action: () => openModal("entretien"),
    },
    {
      id: "saisie",
      label: "Saisie km",
      value: mileageStatus?.dejaSaisi
        ? "Fait"
        : mileageStatus?.fenetreOuverte
          ? "Ouvert"
          : "Fermé",
      sub: mileageStatus?.peutSaisir ? "Action requise" : "En attente admin",
      gradient: "from-sky-500 to-blue-600",
      action: mileageStatus?.peutSaisir ? () => openModal("kilometrage") : null,
    },
    {
      id: "urgence",
      label: "Urgence",
      value: "Panne",
      sub: "Signaler un problème",
      gradient: "from-rose-500 to-red-600",
      action: () => openModal("panne"),
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:max-w-3xl">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Vue d&apos;ensemble</h1>
            <p className="text-sm text-slate-500">Cette semaine</p>
          </div>
          <Link
            to="/chauffeur/calendrier"
            className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            <FaCalendarAlt className="h-3 w-3" />
            Calendrier
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {overviewCards.map(
            ({ id, label, value, sub, gradient, action, disabled }) => {
              const Wrapper = action && !disabled ? "button" : "div";
              return (
                <Wrapper
                  key={id}
                  type={action && !disabled ? "button" : undefined}
                  onClick={action && !disabled ? action : undefined}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 text-left text-white shadow-sm transition-opacity ${
                    action && !disabled
                      ? "cursor-pointer hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      : disabled && id === "km"
                        ? "opacity-80"
                        : ""
                  }`}
                >
                  <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
                  <p className="text-xs font-medium text-white/80">{label}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
                  <p className="mt-0.5 truncate text-[11px] text-white/70">{sub}</p>
                  {action && !disabled && (
                    <FaChevronRight className="absolute bottom-3 right-3 h-3 w-3 text-white/60" />
                  )}
                </Wrapper>
              );
            }
          )}
        </div>
      </section>

      {mileageStatus?.peutSaisir && (
        <button
          type="button"
          onClick={() => openModal("kilometrage")}
          className="flex w-full items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-left transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
            <FaTachometerAlt className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-900">
              Saisie kilométrage ouverte
            </p>
            <p className="text-xs text-violet-700">
              Mettez à jour le compteur de votre véhicule maintenant
            </p>
          </div>
          <FaChevronRight className="h-4 w-4 text-violet-400" />
        </button>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Actions rapides</h2>
        <div className="space-y-2">
          {QUICK_ACTIONS.map(({ id, title, description, icon: Icon, iconBg }) => (
            <button
              key={id}
              type="button"
              onClick={() => openModal(id)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
              <FaChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            </button>
          ))}

          <button
            type="button"
            onClick={() => openModal("panne")}
            className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-left transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
              <FaExclamationTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-900">Signaler une panne</p>
              <p className="text-xs text-red-700">Urgence — position et description</p>
            </div>
            <FaChevronRight className="h-3.5 w-3.5 shrink-0 text-red-300" />
          </button>
        </div>
      </section>

      {!loading && vehicle && closestMaintenance && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <FaTools className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Entretien le plus proche
              </p>
              <p className="mt-1 text-lg font-bold text-amber-950">
                {closestMaintenance.typeLabel}
              </p>
              <p className="text-sm text-amber-800">
                {formatMaintenanceCountdownLong(closestMaintenance.daysRemaining)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Date estimée :{" "}
                {closestMaintenance.maintenanceDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openModal("entretien")}
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              Détails
            </button>
          </div>
        </section>
      )}

      {!loading && vehicle && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Véhicule assigné
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {vehicle.marque} {vehicle.modele}
              </p>
              <p className="text-sm tabular-nums text-slate-500">
                {vehicle.immatriculation}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openModal("vehicule")}
              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
            >
              Détails
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardChauffeur;
