import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import notificationService from "../services/notificationService";
import { getAdminPageTitle } from "../config/adminNav";
import ThemeToggle from "./UI/ThemeToggle";

const Header = ({ onMenuClick, userRole = "admin" }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const pageTitle = getAdminPageTitle(location.pathname);
  const profilePath =
    userRole === "admin" ? "/admin/profile-admin" : "/chauffeur/profile";

  useEffect(() => {
    const updateCount = async () => {
      const count = await notificationService.refreshUnreadCount();
      setUnreadCount(count);
    };
    updateCount();
    const interval = setInterval(updateCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        {/* Gauche : menu mobile + titre de page */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Ouvrir le menu"
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
              Administration
            </p>
            <h1 className="truncate text-base font-semibold text-slate-900">{pageTitle}</h1>
          </div>
        </div>

        {/* Droite : thème + notifications + profil */}
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

          <Link
            to="/admin/notifications"
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} non lues)`
                : "Notifications"
            }
          >
            <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to={profilePath}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Mon profil"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {userRole === "admin" ? "Admin" : "Chauffeur"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
