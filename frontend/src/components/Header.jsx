import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import notificationService from "../services/notificationService";
import {
  getAdminPageTitle,
  isAdminMobileFirstRoute,
} from "../config/adminNav";
import ThemeToggle from "./UI/ThemeToggle";

const Header = ({ onMenuClick, userRole = "admin" }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isMobileFirst = isAdminMobileFirstRoute(location.pathname);
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

  if (isMobileFirst) {
    return (
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-sm">
                AD
              </span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bienvenue
                </p>
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  Administrateur
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Link
              to="/admin/notifications"
              className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={
                unreadCount > 0
                  ? `Notifications (${unreadCount} non lues)`
                  : "Notifications"
              }
            >
              <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={profilePath}
              className="hidden rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:flex"
              aria-label="Mon profil"
            >
              <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Administration
            </p>
            <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

          <Link
            to="/admin/notifications"
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800"
            aria-label="Mon profil"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
            </span>
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
              {userRole === "admin" ? "Admin" : "Chauffeur"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
