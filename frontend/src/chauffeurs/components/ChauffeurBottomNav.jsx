import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaBell,
  FaUser,
  FaExclamationTriangle,
} from "react-icons/fa";
import chauffeurNotificationService from "../../services/chauffeurNotificationService";

const ChauffeurBottomNav = ({ onPanic }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const update = () => setUnreadCount(chauffeurNotificationService.getUnreadCount());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const navClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
      isActive ? "text-indigo-600" : "text-slate-400"
    }`;

  const isHome = location.pathname === "/chauffeur";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-lg items-end px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink to="/chauffeur" end className={navClass}>
          <FaHome className={`h-5 w-5 ${isHome ? "text-indigo-600" : ""}`} />
          Accueil
        </NavLink>

        <NavLink to="/chauffeur/calendrier" className={navClass}>
          <FaCalendarAlt className="h-5 w-5" />
          Calendrier
        </NavLink>

        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onPanic}
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/25 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label="Signaler une panne"
          >
            <FaExclamationTriangle className="h-5 w-5" />
          </button>
        </div>

        <NavLink to="/chauffeur/notifications" className={navClass}>
          <span className="relative">
            <FaBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          Alertes
        </NavLink>

        <NavLink to="/chauffeur/profile" className={navClass}>
          <FaUser className="h-5 w-5" />
          Profil
        </NavLink>
      </div>
    </nav>
  );
};

export default ChauffeurBottomNav;
