import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ChartCard from "../UI/ChartCard";
import { apiPath } from "@/config/api";

const COLORS = ["#6366f1", "#f97316", "#10b981"];

const FuelConsumptionChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop3 = async () => {
      setLoading(true);
      try {
        const [histRes, vehRes] = await Promise.all([
          fetch(apiPath("/admin/carburant/historique/global")),
          fetch(apiPath("/admin/vehicules")),
        ]);
        const histData = await histRes.json();
        const vehData = await vehRes.json();
        const vehiclesMap = {};
        (vehData.vehicules || []).forEach((v) => { vehiclesMap[v.id] = v; });

        const now = new Date();
        const y = now.getUTCFullYear();
        const m = now.getUTCMonth();

        const perVeh = {};
        (histData.attributions || []).forEach((a) => {
          const d = new Date(a.date);
          if (d.getUTCFullYear() === y && d.getUTCMonth() === m) {
            perVeh[a.vehiculeId] = (perVeh[a.vehiculeId] || 0) + (a.quantite || 0);
          }
        });

        const items = Object.entries(perVeh)
          .map(([vehiculeId, litres]) => {
            const v = vehiclesMap[vehiculeId];
            const label = v
              ? v.immatriculation || `${v.marque || ""} ${v.modele || ""}`.trim()
              : `Veh ${vehiculeId}`;
            return { label, litres };
          })
          .sort((a, b) => b.litres - a.litres)
          .slice(0, 3);

        setTopItems(items);
      } catch {
        setTopItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTop3();
  }, []);

  useEffect(() => {
    if (!chartRef.current || topItems.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    const labels = topItems.map((i) => i.label);
    const data = topItems.map((i) => Number(i.litres.toFixed(1)));

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data, backgroundColor: COLORS.slice(0, data.length), borderWidth: 0 }],
      },
      options: {
        cutout: "70%",
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [topItems]);

  return (
    <ChartCard
      title="Top 3 consommation"
      subtitle="Mois en cours (litres attribués)"
      height="h-auto"
    >
      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : topItems.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-500">
          Aucune attribution ce mois
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:justify-center md:gap-12 lg:gap-16">
          <div className="h-40 w-40 shrink-0 sm:h-44 sm:w-44">
            <canvas ref={chartRef} />
          </div>
          <ul className="w-full max-w-sm space-y-3 sm:w-auto">
            {topItems.map((item, idx) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {item.label}
                  </span>
                </div>
                <span className="shrink-0 text-sm tabular-nums font-semibold text-slate-600 dark:text-slate-300">
                  {item.litres.toFixed(1)} L
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
};

export default FuelConsumptionChart;
