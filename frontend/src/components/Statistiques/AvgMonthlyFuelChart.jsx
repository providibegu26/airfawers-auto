import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import ChartCard from "../UI/ChartCard";
import { fetchAvgMonthlyFuelConsumption } from "../../services/statisticsService";

const AvgMonthlyFuelChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAvgMonthlyFuelConsumption();
        if (!cancelled) setPoints(data);
      } catch {
        if (!cancelled) setPoints([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || points.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: points.map((p) => p.label),
        datasets: [
          {
            label: "Litres / véhicule",
            data: points.map((p) => p.litres),
            fill: true,
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            borderColor: "#10b981",
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: "#10b981",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: {
              color: "#64748b",
              callback: (v) => `${v} L`,
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#64748b" },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [points]);

  return (
    <ChartCard
      title="Consommation moyenne mensuelle"
      subtitle="Litres attribués par véhicule — 6 derniers mois"
    >
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : points.every((p) => p.litres === 0) ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Aucune attribution sur la période
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </ChartCard>
  );
};

export default AvgMonthlyFuelChart;
