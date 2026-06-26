import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import ChartCard from "../UI/ChartCard";
import { fetchTopVehiclesByKm } from "../../services/statisticsService";

const TopVehiclesChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTopVehiclesByKm(5);
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
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
    if (!chartRef.current || items.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: items.map((i) => i.label),
        datasets: [
          {
            label: "Kilométrage",
            data: items.map((i) => i.km),
            backgroundColor: "#6366f1",
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { color: "#64748b" },
          },
          y: {
            grid: { display: false },
            ticks: { color: "#64748b", font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [items]);

  return (
    <ChartCard
      title="Top 5 véhicules les plus utilisés"
      subtitle="Par kilométrage actuel"
    >
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Aucun véhicule enregistré
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </ChartCard>
  );
};

export default TopVehiclesChart;
