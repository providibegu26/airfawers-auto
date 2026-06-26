import React from "react";
import StatsCards from "../components/Dashboard/StatsCards";
import CalendarSection from "../components/Dashboard/CalendarSection";
import MapSection from "../components/Dashboard/MapSection";
import DriversList from "../components/Dashboard/DriversList";

const Dashboard = () => (
  <div className="space-y-6">
    <p className="text-sm text-slate-500">
      Aperçu opérationnel de la flotte — entretiens, pannes et chauffeurs.
    </p>

    <StatsCards />

    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <CalendarSection />
      <MapSection />
    </div>

    <DriversList />
  </div>
);

export default Dashboard;
