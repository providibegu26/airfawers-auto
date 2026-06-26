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
        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : topItems.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
          Aucune attribution ce mois
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-36 w-36 shrink-0">
            <canvas ref={chartRef} />
          </div>
          <ul className="space-y-1.5">
            {topItems.map((item, idx) => (
              <li key={item.label} className="flex items-center gap-2 text-sm text-slate-700">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[idx] }}
                />
                {item.label}{" "}
                <span className="tabular-nums text-slate-500">
                  ({item.litres.toFixed(1)} L)
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
