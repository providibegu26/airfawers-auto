import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaCar,
  FaTools,
  FaUser,
  FaPhone,
} from "react-icons/fa";
import CalendarLegend from "../Calendrier/CalendarLegend";
import Card from "../UI/Card";
import Modal from "../UI/Modal";
import ModalCard from "../UI/ModalCard";
import StatusBadge from "../UI/StatusBadge";
import { generateCalendarData } from "../../services/maintenanceService";
import { apiPath } from "@/config/api";

const API = apiPath("/admin/vehicules");

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const urgencyVariant = (daysRemaining) => {
  if (daysRemaining <= 7) return "danger";
  if (daysRemaining <= 14) return "warning";
  return "success";
};

const getDayColor = (entretiens) => {
  if (entretiens.length === 0) return "";
  if (entretiens.some((e) => e.daysRemaining <= 7)) return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (entretiens.some((e) => e.daysRemaining <= 14)) return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
};

const CalendarSection = () => {
  const [vehicles, setVehicles] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetch(API);
        const data = await response.json();
        setVehicles(data.vehicules || []);
      } catch {
        setVehicles([]);
      }
    };

    loadVehicles();
    const interval = setInterval(loadVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      setCalendarData(generateCalendarData(vehicles, currentMonth, currentYear));
    } else {
      setCalendarData([]);
    }
  }, [vehicles, currentMonth, currentYear]);

  const dateMap = {};
  calendarData.forEach(({ date, entretiens }) => {
    dateMap[date] = entretiens;
  });

  const days = Array.from(
    { length: new Date(currentYear, currentMonth + 1, 0).getDate() },
    (_, i) => new Date(currentYear, currentMonth, i + 1)
  );
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array((firstDayOfWeek + 6) % 7).fill(null);

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

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const urgentCount = Object.values(dateMap)
    .flat()
    .filter((e) => e.daysRemaining <= 7).length;

  const handleDateClick = (date) => {
    const iso = date.toISOString().slice(0, 10);
    const entretiens = dateMap[iso] || [];
    if (entretiens.length > 0) {
      setSelectedDate({ date, entretiens });
      setShowModal(true);
    }
  };

  const modalTitle = selectedDate
    ? `Entretiens du ${selectedDate.date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : "";

  return (
    <>
      <Card className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FaCalendarAlt className="text-indigo-600" />
              Calendrier d&apos;entretien
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <StatusBadge variant="danger" label={`${urgentCount} urgent${urgentCount > 1 ? "s" : ""}`} />
            )}
            <Link
              to="/admin/maintenance-calendar"
              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Vue calendrier complète"
            >
              <FaExpand className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Mois précédent"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            onClick={goToCurrentMonth}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Aujourd&apos;hui
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Mois suivant"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-7 gap-1 text-sm">
          {["L", "M", "M", "J", "V", "S", "D"].map((j) => (
            <div key={j} className="py-1 text-center text-xs font-medium text-slate-400">
              {j}
            </div>
          ))}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((date) => {
            const iso = date.toISOString().slice(0, 10);
            const entretiens = dateMap[iso] || [];
            const hasMaintenance = entretiens.length > 0;
            const color = getDayColor(entretiens);
            const isToday = iso === new Date().toISOString().slice(0, 10);

            return (
              <button
                key={iso}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={!hasMaintenance}
                className={`flex h-8 w-full items-center justify-center rounded text-sm transition-colors ${
                  hasMaintenance
                    ? `${color} cursor-pointer font-semibold hover:opacity-90`
                    : "cursor-default text-slate-400"
                } ${isToday && !hasMaintenance ? "ring-1 ring-indigo-300" : ""}`}
                title={
                  hasMaintenance
                    ? `${entretiens.length} entretien(s) prévu(s)`
                    : undefined
                }
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <CalendarLegend compact />
      </Card>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDate(null);
        }}
        title={modalTitle}
        size="md"
      >
        <div className="space-y-3">
          {selectedDate?.entretiens.map((entretien, index) => (
            <ModalCard key={index}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCar className="text-indigo-600" />
                  <span className="font-medium text-slate-900">
                    {entretien.vehicle.immatriculation}
                  </span>
                </div>
                <StatusBadge
                  variant={urgencyVariant(entretien.daysRemaining)}
                  label={`${entretien.daysRemaining} jour(s)`}
                />
              </div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <FaTools className="text-slate-400" />
                <span>{entretien.typeLabel}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p>
                  {entretien.vehicle.marque} {entretien.vehicle.modele}
                </p>
                {entretien.vehicle.chauffeur ? (
                  <>
                    <p className="flex items-center gap-1 text-slate-600">
                      <FaUser className="text-slate-400" />
                      {entretien.vehicle.chauffeur.nom}{" "}
                      {entretien.vehicle.chauffeur.prenom}
                    </p>
                    <p className="flex items-center gap-1 text-slate-600">
                      <FaPhone className="text-slate-400" />
                      {entretien.vehicle.chauffeur.telephone || "Non renseigné"}
                    </p>
                  </>
                ) : (
                  <p className="flex items-center gap-1">
                    <FaUser className="text-slate-400" />
                    Chauffeur non attribué
                  </p>
                )}
              </div>
            </ModalCard>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default CalendarSection;
