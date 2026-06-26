import {
  faCar,
  faTachometerAlt,
  faUserTie,
  faTools,
  faGasPump,
  faExclamationTriangle,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

export const ADMIN_NAV_ITEMS = [
  { to: "/admin", end: true, label: "Dashboard", icon: faTachometerAlt },
  { to: "/admin/vehicles", label: "Véhicules", icon: faCar },
  { to: "/admin/chauffeurs", label: "Chauffeurs", icon: faUserTie },
  { to: "/admin/entretiens", label: "Entretiens", icon: faTools },
  { to: "/admin/carburants", label: "Carburant", icon: faGasPump },
  { to: "/admin/pannes", label: "Pannes", icon: faExclamationTriangle },
  { to: "/admin/statistiques", label: "Statistiques", icon: faChartLine },
];

/** Titres affichés dans le Header selon la route courante. */
export const ADMIN_PAGE_TITLES = {
  "/admin": "Dashboard",
  "/admin/vehicles": "Véhicules",
  "/admin/chauffeurs": "Chauffeurs",
  "/admin/entretiens": "Entretiens",
  "/admin/entretiens/vidange": "Vidange",
  "/admin/entretiens/categorie_b": "Bougies",
  "/admin/entretiens/categorie_c": "Freins",
  "/admin/entretiens/urgents": "Entretiens urgents",
  "/admin/entretiens/historique": "Historique entretiens",
  "/admin/carburants": "Carburant",
  "/admin/carburants/historique": "Historique carburant",
  "/admin/pannes": "Pannes",
  "/admin/statistiques": "Statistiques",
  "/admin/notifications": "Notifications",
  "/admin/profile-admin": "Profil",
  "/admin/maintenance-calendar": "Calendrier maintenance",
  "/admin/fleet-map": "Carte de flotte",
};

export function getAdminPageTitle(pathname) {
  if (ADMIN_PAGE_TITLES[pathname]) return ADMIN_PAGE_TITLES[pathname];

  const match = Object.entries(ADMIN_PAGE_TITLES)
    .filter(([path]) => path !== "/admin")
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => pathname.startsWith(path));

  return match ? match[1] : "FleetTech";
}
