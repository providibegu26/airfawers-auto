import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import ChartCard from "../UI/ChartCard";
import { fetchFuelCostLast6Months } from "../../services/statisticsService";

const FuelCostChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchFuelCostLast6Months();
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
      type: "bar",
      data: {
        labels: points.map((p) => p.label),
        datasets: [
          {
            label: "Coût carburant (USD)",
            data: points.map((p) => p.costUsd),
            backgroundColor: "#10b981",
            borderRadius: 6,
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
              callback: (v) => `$${v}`,
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
      title="Coût du carburant"
      subtitle="6 derniers mois (USD)"
    >
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : points.every((p) => p.costUsd === 0) ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Aucune attribution sur la période
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </ChartCard>
  );
};

export default FuelCostChart;
