import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { ADMIN_NAV_ITEMS } from "../config/adminNav";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "bg-indigo-50 text-indigo-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  }`;

const Sidebar = ({ closeSidebar, sidebarOpen, onToggleCollapse }) => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    onToggleCollapse?.(isCollapsed);
  }, [isCollapsed, onToggleCollapse]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setIsHovered(false);
  };

  const isExpanded = isCollapsed && isHovered;
  const showText = !isCollapsed || isExpanded;
  const shouldShowText = sidebarOpen ? true : showText;

  const widthClass = sidebarOpen
    ? "w-64"
    : isCollapsed && !isExpanded
      ? "w-16"
      : "w-64";

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out
          ${sidebarOpen ? "fixed left-0 top-0 z-50 h-full" : "-left-64 fixed md:relative md:left-0"}
          md:static md:z-auto md:h-full
          ${widthClass}`}
        onMouseEnter={!sidebarOpen && isCollapsed ? () => setIsHovered(true) : undefined}
        onMouseLeave={!sidebarOpen && isCollapsed ? () => setIsHovered(false) : undefined}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-slate-200 px-3 ${
            shouldShowText ? "h-18" : "h-14"
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg p-1.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
            aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
          >
            <img
              src="/logo.png"
              alt="Airfawers Auto — Gestion de flotte"
              className={`${
                shouldShowText
                  ? "h-12 w-full max-w-[210px] object-contain object-left"
                  : "h-10 w-full object-cover object-left"
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Navigation principale">
          <ul className="space-y-0.5">
            {ADMIN_NAV_ITEMS.map(({ to, end, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={closeSidebar}
                  className={navLinkClass}
                  title={!shouldShowText ? label : undefined}
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4 shrink-0" />
                  {shouldShowText && <span className="truncate">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title={!shouldShowText ? "Déconnexion" : undefined}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 shrink-0" />
            {shouldShowText && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
