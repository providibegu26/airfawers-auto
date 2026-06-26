import { FaCar, FaGasPump } from "react-icons/fa";

const formatUSD = (n) =>
  `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FuelCards = ({ vehicles = [], monthlyCostUSD = 0, loading = false }) => {
  const vehiclesInService = vehicles.filter(
    (v) => v.chauffeur || v.statut === "attribué"
  ).length;

  const cards = [
    {
      label: "Véhicules en service",
      value: loading ? null : vehiclesInService,
      hint: loading ? null : `sur ${vehicles.length} total`,
      icon: FaCar,
      iconClass: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Coût mensuel carburant",
      value: loading ? null : monthlyCostUSD > 0 ? formatUSD(monthlyCostUSD) : "N/A",
      icon: FaGasPump,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <>
      {cards.map(({ label, value, hint, icon: Icon, iconClass }) => (
        <div key={label} className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className={`rounded-md p-2.5 ${iconClass}`}>
              <Icon />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              {loading ? (
                <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-100" />
              ) : (
                <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
              )}
              {hint && !loading && (
                <p className="text-xs text-slate-400">{hint}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FuelCards;
