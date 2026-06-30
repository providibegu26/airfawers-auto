import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaUser } from "react-icons/fa";
import chauffeurNotificationService from "../../services/chauffeurNotificationService";
import { getChauffeurDisplayName } from "../../services/chauffeurProfileService";
import ThemeToggle from "../../components/UI/ThemeToggle";

const HeaderChauffeur = ({ onMenuClick, showMenuButton = true }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [displayName, setDisplayName] = useState("Chauffeur");

  useEffect(() => {
    const raw = localStorage.getItem("chauffeurUser");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setDisplayName(
          getChauffeurDisplayName(parsed.chauffeur, parsed.email || "Chauffeur")
        );
      } catch {
        setDisplayName("Chauffeur");
      }
    }
  }, []);

  useEffect(() => {
    const updateUnreadCount = async () => {
      const count = await chauffeurNotificationService.refreshUnreadCount();
      setUnreadCount(count);
    };
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton && (
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <FaBars className="h-4 w-4" />
            </button>
          )}

          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-sm">
              {initials || <FaUser className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Bienvenue</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link
            to="/chauffeur/notifications"
            className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Notifications"
          >
            <FaBell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/chauffeur/profile"
            className="hidden rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex"
            aria-label="Mon profil"
          >
            <FaUser className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderChauffeur;
