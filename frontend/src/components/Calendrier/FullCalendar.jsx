import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronLeft, faChevronRight, faTools, faUser, faCar, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import CalendarLegend from './CalendarLegend';
import ScheduleMaintenanceModal from './ScheduleMaintenanceModal';
import {
  mergeCalendarWithPlanned,
  fetchPlannedMaintenances,
  fetchVehicles,
} from '../../services/maintenanceService';
import Modal from '../UI/Modal';
import Button from '../UI/Button';

const FullCalendar = () => {
  const [vehicles, setVehicles] = useState([]);
  const [plannedMaintenances, setPlannedMaintenances] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [vehiclesData, planned] = await Promise.all([
        fetchVehicles(),
        fetchPlannedMaintenances('planifie'),
      ]);
      setVehicles(vehiclesData);
      setPlannedMaintenances(planned);
    } catch (error) {
      console.error('Erreur chargement calendrier:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (vehicles.length > 0) {
      setCalendarData(mergeCalendarWithPlanned(vehicles, plannedMaintenances));
    }
  }, [vehicles, plannedMaintenances]);

  const dateMap = {};
  calendarData.forEach((day) => {
    dateMap[day.date] = day;
  });

  const getMonthDays = (year, month) => {
    const days = [];
    const lastDay = new Date(year, month + 1, 0);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const days = getMonthDays(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array((firstDayOfWeek + 6) % 7).fill(null);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isFutureOrToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  };

  const handleDayClick = (date) => {
    if (!isFutureOrToday(date)) return;

    const iso = date.toISOString().slice(0, 10);
    const dayData = dateMap[iso] || { date: iso, estimated: [], planned: [] };

    setSelectedDate(iso);
    setSelectedDayData(dayData);
    setScheduleModalOpen(true);
  };

  const handleViewDetails = (date) => {
    const iso = date.toISOString().slice(0, 10);
    const dayData = dateMap[iso];
    if (!dayData?.estimated?.length && !dayData?.planned?.length) return;
    setSelectedDate(iso);
    setSelectedDayData(dayData);
    setScheduleModalOpen(false);
  };

  const getDayStyle = (date) => {
    const iso = date.toISOString().slice(0, 10);
    const dayData = dateMap[iso];
    const estimated = dayData?.estimated || [];
    const planned = dayData?.planned || [];

    if (planned.length > 0) {
      return 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-400 text-indigo-900 shadow-sm hover:shadow-md';
    }
    if (estimated.length === 0) return '';

    if (estimated.some((e) => e.daysRemaining <= 7)) {
      return 'bg-gradient-to-br from-red-100 to-red-200 border-red-400 text-red-800 shadow-sm hover:shadow-md';
    }
    if (estimated.some((e) => e.daysRemaining <= 14)) {
      return 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400 text-orange-800 shadow-sm hover:shadow-md';
    }
    return 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800 shadow-sm hover:shadow-md';
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const allEntretiens = [
    ...(selectedDayData?.planned || []).map((e) => ({ ...e, isPlanned: true })),
    ...(selectedDayData?.estimated || []).map((e) => ({ ...e, isPlanned: false })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/admin"
          className="flex items-center px-2 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-all duration-200 font-medium text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
          Retour
        </Link>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-0.5">Calendrier des Entretiens</h2>
          <p className="text-gray-500 text-xs">Cliquez sur une date pour planifier un entretien</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <span className="text-base font-semibold text-gray-800 min-w-[150px] text-center">
            {new Date(currentYear, currentMonth).toLocaleString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 shadow-inner">
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((j) => (
            <div
              key={j}
              className="py-1 text-center text-xs font-bold text-gray-600 bg-white rounded shadow-sm"
            >
              {j}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-12" />
          ))}
          {days.map((date) => {
            const iso = date.toISOString().slice(0, 10);
            const dayData = dateMap[iso];
            const estimated = dayData?.estimated || [];
            const planned = dayData?.planned || [];
            const color = getDayStyle(date);
            const today = isToday(date);
            const clickable = isFutureOrToday(date);
            const total = estimated.length + planned.length;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => (clickable ? handleDayClick(date) : handleViewDetails(date))}
                onContextMenu={(e) => {
                  if (total > 0) {
                    e.preventDefault();
                    handleViewDetails(date);
                  }
                }}
                className={`
                  h-12 w-full flex flex-col items-center justify-center rounded border transition-all duration-200
                  ${color}
                  ${clickable ? 'cursor-pointer hover:scale-105' : 'text-gray-400 cursor-default bg-white border-gray-200'}
                  ${today ? 'ring-1 ring-indigo-400' : ''}
                  ${total > 0 || clickable ? 'hover:shadow-md' : ''}
                `}
              >
                <span className={`text-xs ${today ? 'font-bold' : ''}`}>{date.getDate()}</span>
                {total > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {planned.slice(0, 1).map((_, idx) => (
                      <div key={`p-${idx}`} className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    ))}
                    {estimated.slice(0, planned.length ? 1 : 2).map((e, idx) => (
                      <div
                        key={`e-${idx}`}
                        className={`w-1 h-1 rounded-full ${
                          e.colorStatus === 'red'
                            ? 'bg-red-500'
                            : e.colorStatus === 'orange'
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                        }`}
                      />
                    ))}
                    {total > 2 && (
                      <span className="text-xs font-medium">+{total - 2}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ScheduleMaintenanceModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        selectedDate={selectedDate}
        plannedOnDate={selectedDayData?.planned || []}
        onScheduled={loadData}
      />

      <Modal
        isOpen={!!selectedDate && !scheduleModalOpen && allEntretiens.length > 0}
        onClose={() => {
          setSelectedDate(null);
          setSelectedDayData(null);
        }}
        title="Entretiens du jour"
        subtitle={
          selectedDate
            ? new Date(selectedDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : undefined
        }
        icon={FaCalendarAlt}
        size="md"
        footer={
          <div className="flex gap-2">
            {selectedDate && isFutureOrToday(new Date(selectedDate)) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setScheduleModalOpen(true)}
              >
                Planifier
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedDate(null);
                setSelectedDayData(null);
              }}
            >
              Fermer
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          {allEntretiens.map((e, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 ${
                e.isPlanned
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full p-1.5 ${
                      e.isPlanned
                        ? 'bg-indigo-100 text-indigo-600'
                        : e.colorStatus === 'red'
                          ? 'bg-red-100 text-red-600'
                          : e.colorStatus === 'orange'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {e.isPlanned ? (
                      <FaCheckCircle className="text-xs" />
                    ) : (
                      <FontAwesomeIcon icon={faTools} className="text-xs" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{e.immatriculation}</h4>
                    <p className="text-xs text-slate-600">
                      {e.marque} {e.modele}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    e.isPlanned
                      ? 'bg-indigo-100 text-indigo-700'
                      : e.colorStatus === 'red'
                        ? 'bg-red-100 text-red-700'
                        : e.colorStatus === 'orange'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                  }`}
                >
                  {e.isPlanned ? 'Planifié' : e.colorStatus === 'red' ? 'Urgent' : 'Estimé'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faTools} className="text-slate-400" />
                  <span className="font-medium">Type :</span>
                  <span className="capitalize text-slate-700">{e.typeLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faUser} className="text-slate-400" />
                  <span className="font-medium">Chauffeur :</span>
                  <span className="text-slate-700">{e.chauffeur}</span>
                </div>
                {!e.isPlanned && e.daysRemaining !== undefined && (
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCar} className="text-slate-400" />
                    <span className="font-medium">Jours restants :</span>
                    <span className="font-bold text-slate-700">{e.daysRemaining} jours</span>
                  </div>
                )}
                {e.telephone && (
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                    <span className="text-slate-700">{e.telephone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-600" /> Planifié (confirmé)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> Estimation (à planifier)
        </span>
      </div>

      <CalendarLegend compact={false} />
    </div>
  );
};

export default FullCalendar;
