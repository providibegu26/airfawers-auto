// src/App.jsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Layouts
import Layout from "./components/Layout";
import ChauffeurLayout from "./chauffeurs/components/ChauffeurLayout";

// Components
import NotificationInitializer from "./components/NotificationInitializer";

// Admin Pages
import Dashboard from "./Pages/Dashboard";
import VehiclesPage from "./Pages/VehiclesPage";
import ChauffeursPage from "./Pages/ChauffeursPage";
import Entretiens from "./Pages/Entretiens";
import EntretiensCategorieA from "./Pages/EntretiensVidange";
import EntretiensBougies from "./Pages/EntretiensBougies";
import EntretiensFreins from "./Pages/EntretiensFreins";
import EntretiensUrgents from "./Pages/EntretiensUrgents";
import HistoriqueEntretiens from "./Pages/HistoriqueEntretiens";
import Carburants from "./Pages/Carburants";
import FuelHistory from "./Pages/FuelHistory";
import Pannes from "./Pages/Pannes";
import Statistiques from "./Pages/Statistiques";
import Notifications from "./Pages/Notifications";
import ProfileAdmin from "./Pages/ProfileAdmin";
import MaintenanceCalendar from "./Pages/MaintenanceCalendar";
import FleetMap from "./Pages/FleetMap";

// Chauffeur Pages
import DashboardChauffeur from "./chauffeurs/Pages/DashboardChauffeur";
import CalendrierEntretiensChauffeur from "./chauffeurs/Pages/CalendrierEntretiensChauffeur";
import ProfileChauffeur from "./chauffeurs/Pages/ProfileChauffeur";
import NotificationsChauffeur from "./chauffeurs/Pages/NotificationsChauffeur";

// Auth Pages
import LoginAdmin from "./components/auth/LoginAdmin";
import LoginChauffeur from "./components/auth/LoginChauffeur";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute role="admin"><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "vehicles", element: <VehiclesPage /> },
      { path: "chauffeurs", element: <ChauffeursPage /> },
      { path: "entretiens", element: <Entretiens /> },
      { path: "entretiens/vidange", element: <EntretiensCategorieA /> },
      { path: "entretiens/categorie_b", element: <EntretiensBougies /> },
      { path: "entretiens/categorie_c", element: <EntretiensFreins /> },
      { path: "entretiens/urgents", element: <EntretiensUrgents /> },
      { path: "entretiens/historique", element: <HistoriqueEntretiens /> },
      { path: "carburants", element: <Carburants /> },
      { path: "carburants/historique", element: <FuelHistory /> },
      { path: "pannes", element: <Pannes /> },
      { path: "statistiques", element: <Statistiques /> },
      { path: "notifications", element: <Notifications /> },
      { path: "profile-admin", element: <ProfileAdmin /> },
      { path: "maintenance-calendar", element: <MaintenanceCalendar /> },
      { path: "fleet-map", element: <FleetMap /> },
    ],
  },

  {
    path: "/chauffeur",
    element: <ProtectedRoute role="chauffeur"><ChauffeurLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardChauffeur /> },
      { path: "calendrier", element: <CalendrierEntretiensChauffeur /> },
      { path: "profile", element: <ProfileChauffeur /> },
      { path: "notifications", element: <NotificationsChauffeur /> },
    ],
  },

  // Auth (toujours accessibles directement)
  {
    path: "/admin/login",
    element: <LoginAdmin />,
  },
  {
    path: "/chauffeur/login",
    element: <LoginChauffeur />,
  },

  // Page inconnue → Dashboard admin
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <NotificationInitializer>
      <RouterProvider router={router} />
    </NotificationInitializer>
  );
}
