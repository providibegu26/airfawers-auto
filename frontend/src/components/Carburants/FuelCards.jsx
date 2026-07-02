import { FaCar, FaGasPump, FaTint } from "react-icons/fa";
import KpiCard from "../UI/KpiCard";

const formatUSD = (n) =>
  `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatLitres = (n) =>
  `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} L`;

const FuelCards = ({
  vehicles = [],
  monthlyCostUSD = 0,
  monthlyConsumptionLitres = 0,
  loading = false,
}) => {
  const vehiclesInService = vehicles.filter(
    (v) => v.chauffeur || v.statut === "attribué"
  ).length;

  const cards = [
    {
      label: "Véhicules en service",
      value: vehiclesInService,
      hint: `sur ${vehicles.length} total`,
      icon: FaCar,
      accent: "indigo",
    },
    {
      label: "Coût mensuel carburant",
      value: monthlyCostUSD > 0 ? formatUSD(monthlyCostUSD) : "N/A",
      icon: FaGasPump,
      accent: "emerald",
    },
    {
      label: "Consommation mensuelle",
      value:
        monthlyConsumptionLitres > 0
          ? formatLitres(monthlyConsumptionLitres)
          : "N/A",
      hint: "Flotte entière — mois en cours",
      icon: FaTint,
      accent: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ label, value, hint, icon, accent }) => (
        <KpiCard
          key={label}
          label={label}
          value={value}
          hint={hint}
          icon={icon}
          accent={accent}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default FuelCards;
