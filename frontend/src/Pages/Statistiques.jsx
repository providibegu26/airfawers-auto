import React from "react";
import { FaChartLine } from "react-icons/fa";
import StatsCards from "../components/Statistiques/StatsCards";
import FuelCostChart from "../components/Statistiques/FuelCostChart";
import AvgMonthlyFuelChart from "../components/Statistiques/AvgMonthlyFuelChart";
import MonthlyMileageChart from "../components/Statistiques/MonthlyMileageChart";
import TopVehiclesChart from "../components/Statistiques/TopVehiclesChart";
import PageHeader from "../components/UI/PageHeader";

const Statistiques = () => (
  <div className="space-y-6">
    <PageHeader
      title="Statistiques de la flotte"
      subtitle="Indicateurs clés, coûts carburant et utilisation des véhicules"
      icon={FaChartLine}
    />

    <StatsCards />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <FuelCostChart />
      <AvgMonthlyFuelChart />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <MonthlyMileageChart />
      <TopVehiclesChart />
    </div>
  </div>
);

export default Statistiques;
