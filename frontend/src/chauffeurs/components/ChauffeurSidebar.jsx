import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaCar,
  FaTools,
  FaGasPump,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaTimes,
  FaTachometerAlt,
} from "react-icons/fa";

const ChauffeurSidebar = ({
  openModal,
  closeSidebar,
  sidebarOpen,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) return;

    try {
      const { default: chauffeurNotificationService } = await import(
        "../../services/chauffeurNotificationService"
      );
      chauffeurNotificationService.stopPeriodicCheck();
      chauffeurNotificationService.clearAllNotifications();
    } catch {
      /* service optional */
    }

    localStorage.removeItem("chauffeurToken");
    localStorage.removeItem("chauffeurUser");
    localStorage.removeItem("chauffeurProfile");
    localStorage.removeItem("chauffeurVehicle");

    navigate("/chauffeur/login");
    window.location.reload();
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const actionClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900";

  const handleNavClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const handleModal = (type) => {
    openModal(type);
    closeSidebar?.();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <FaCar className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">AirFawers</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Espace chauffeur
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeSidebar}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          aria-label="Fermer le menu"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Navigation
        </p>

        <NavLink to="/chauffeur" end className={navLinkClass} onClick={handleNavClick}>
          <FaHome className="h-4 w-4 shrink-0" />
          Accueil
        </NavLink>

        <NavLink
          to="/chauffeur/calendrier"
          className={navLinkClass}
          onClick={handleNavClick}
        >
          <FaCalendarAlt className="h-4 w-4 shrink-0" />
          Calendrier entretiens
        </NavLink>

        <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Actions rapides
        </p>

        <button type="button" onClick={() => handleModal("vehicule")} className={actionClass}>
          <FaCar className="h-4 w-4 shrink-0 text-indigo-600" />
          Mon véhicule
        </button>

        <button type="button" onClick={() => handleModal("entretien")} className={actionClass}>
          <FaTools className="h-4 w-4 shrink-0 text-amber-600" />
          Entretiens prévus
        </button>

        <button type="button" onClick={() => handleModal("kilometrage")} className={actionClass}>
          <FaTachometerAlt className="h-4 w-4 shrink-0 text-violet-600" />
          Kilométrage
        </button>

        <button type="button" onClick={() => handleModal("carburant")} className={actionClass}>
          <FaGasPump className="h-4 w-4 shrink-0 text-emerald-600" />
          Carburant
        </button>

        <button
          type="button"
          onClick={() => handleModal("panne")}
          className="mt-2 flex w-full items-center gap-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          <FaExclamationTriangle className="h-4 w-4 shrink-0" />
          Signaler une panne
        </button>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600"
        >
          <FaSignOutAlt className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default ChauffeurSidebar;
