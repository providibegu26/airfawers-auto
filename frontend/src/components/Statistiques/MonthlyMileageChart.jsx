import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import ChartCard from "../UI/ChartCard";
import { fetchAvgMonthlyMileage } from "../../services/statisticsService";

const MonthlyMileageChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAvgMonthlyMileage();
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
            label: "Km moyen / véhicule",
            data: points.map((p) => p.km),
            fill: false,
            borderColor: "#6366f1",
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: "#6366f1",
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
            ticks: { color: "#64748b" },
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
      title="Kilométrage moyen mensuel"
      subtitle="Moyenne par véhicule — 6 derniers mois"
    >
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      ) : points.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Données indisponibles
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </ChartCard>
  );
};

export default MonthlyMileageChart;
