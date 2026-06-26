import React, { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTools,
  FaCar,
  FaSpinner,
} from "react-icons/fa";
import StatusBadge from "../../components/UI/StatusBadge";
import {
  fetchChauffeurProfile,
  vehicleToCalendarFormat,
} from "../../services/chauffeurProfileService";
import { generateCalendarData } from "../../services/maintenanceService";

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const urgencyVariant = (days) => {
  if (days < 0 || days <= 7) return "danger";
  if (days <= 14) return "warning";
  return "success";
};

const dotColor = (days) => {
  if (days <= 7) return "bg-red-500";
  if (days <= 14) return "bg-amber-500";
  return "bg-emerald-500";
};

const typeIconBg = (days) => {
  if (days <= 7) return "bg-red-100 text-red-600";
  if (days <= 14) return "bg-amber-100 text-amber-600";
  return "bg-indigo-100 text-indigo-600";
};

const ChauffeurMaintenanceCalendar = ({ compact = false }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const profile = await fetchChauffeurProfile();
        if (!cancelled) {
          setVehicle(profile.vehicule || null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Erreur de chargement");
          setVehicle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const calendarEntries = useMemo(() => {
    if (!vehicle) return [];
    return generateCalendarData(
      vehicleToCalendarFormat(vehicle),
      currentMonth,
      currentYear,
      120
    );
  }, [vehicle, currentMonth, currentYear]);

  const dateMap = useMemo(() => {
    const map = {};
    calendarEntries.forEach(({ date, entretiens }) => {
      map[date] = entretiens;
    });
    return map;
  }, [calendarEntries]);

  const days = Array.from(
    { length: new Date(currentYear, currentMonth + 1, 0).getDate() },
    (_, i) => new Date(currentYear, currentMonth, i + 1)
  );
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array((firstDayOfWeek + 6) % 7).fill(null);

  const todayIso = new Date().toISOString().slice(0, 10);
  const selectedEntretiens = dateMap[selectedDate] || [];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(now.toISOString().slice(0, 10));
  };

  const headerDate = new Date(currentYear, currentMonth, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <FaCar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">
          {error || "Aucun véhicule attribué"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Le calendrier d&apos;entretien sera disponible une fois un véhicule assigné.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Mois précédent"
          >
            <FaChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">
              {headerDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </p>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Mois suivant"
          >
            <FaChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-[11px] font-medium text-slate-400"
            >
              {day}
            </div>
          ))}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((date) => {
            const iso = date.toISOString().slice(0, 10);
            const entretiens = dateMap[iso] || [];
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDate;
            const urgent = entretiens.some((e) => e.daysRemaining <= 7);

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDate(iso)}
                className={`relative flex h-10 flex-col items-center justify-center rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? "bg-slate-900 font-semibold text-white"
                    : isToday
                      ? "font-semibold text-indigo-600 ring-1 ring-indigo-200"
                      : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {date.getDate()}
                {entretiens.length > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {entretiens.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={`h-1 w-1 rounded-full ${
                          isSelected ? "bg-white" : dotColor(e.daysRemaining)
                        }`}
                      />
                    ))}
                  </span>
                )}
                {urgent && !isSelected && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="mt-3 w-full rounded-lg py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
        >
          Revenir à aujourd&apos;hui
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Entretiens du jour
            </h3>
            <p className="text-xs text-slate-500">
              {new Date(selectedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {vehicle.immatriculation}
          </span>
        </div>

        {selectedEntretiens.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
            <FaTools className="mx-auto mb-2 h-6 w-6 text-slate-300" />
            <p className="text-sm text-slate-500">
              Aucun entretien prévu ce jour-là
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {selectedEntretiens.map((entretien, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeIconBg(
                    entretien.daysRemaining
                  )}`}
                >
                  <FaTools className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {entretien.typeLabel}
                    </p>
                    <StatusBadge
                      variant={urgencyVariant(entretien.daysRemaining)}
                      label={
                        entretien.daysRemaining <= 0
                          ? "En retard"
                          : `${entretien.daysRemaining} j`
                      }
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {vehicle.marque} {vehicle.modele}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-slate-400">
                    Dans {entretien.daysRemaining} jour
                    {entretien.daysRemaining > 1 ? "s" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChauffeurMaintenanceCalendar;
