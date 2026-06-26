import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronLeft, faChevronRight, faTools, faUser, faCar, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FaCalendarAlt } from 'react-icons/fa';
import CalendarLegend from './CalendarLegend';
import { generateCalendarData } from '../../services/maintenanceService';
import { apiPath } from '@/config/api';
import Modal from '../UI/Modal';
import Button from '../UI/Button';

const FullCalendar = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntretiens, setSelectedEntretiens] = useState([]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        console.log('🔄 Chargement des véhicules...');
        const response = await fetch(apiPath('/admin/vehicules'));
        const data = await response.json();
        console.log('📊 Véhicules reçus:', data.vehicules?.length || 0);
        setVehicles(data.vehicules || []);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des véhicules:', error);
      }
    };

    loadVehicles();
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadVehicles, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('🔄 Génération des données du calendrier...');
    if (vehicles && vehicles.length > 0) {
      try {
        const calendarDataTransformed = generateCalendarData(vehicles);
        console.log('📊 Données du calendrier générées:', calendarDataTransformed.length, 'jours');
        setCalendarData(calendarDataTransformed);
      } catch (error) {
        console.error('❌ Erreur lors de la génération du calendrier:', error);
      }
    }
  }, [vehicles]);

  // Map date -> entretiens pour accès rapide
  const dateMap = {};
  calendarData.forEach(({ date, entretiens }) => {
    dateMap[date] = entretiens;
  });

  // Générer les jours du mois affiché
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

  // Gestion navigation mois
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11); setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0); setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Gestion clic sur un jour
  const handleDayClick = (date) => {
    const iso = date.toISOString().slice(0, 10);
    if (dateMap[iso]) {
      setSelectedDate(iso);
      setSelectedEntretiens(dateMap[iso]);
    } else {
      setSelectedDate(null);
      setSelectedEntretiens([]);
    }
  };

  // Fonction pour déterminer la couleur d'un jour
  const getDayColor = (date) => {
    const iso = date.toISOString().slice(0, 10);
    const entretiens = dateMap[iso] || [];
    
    if (entretiens.length === 0) return '';
    
    // Couleur la plus urgente du jour
    if (entretiens.some(e => e.daysRemaining <= 7)) return 'bg-gradient-to-br from-red-100 to-red-200 border-red-400 text-red-800 shadow-sm hover:shadow-md';
    if (entretiens.some(e => e.daysRemaining <= 14)) return 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400 text-orange-800 shadow-sm hover:shadow-md';
    return 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800 shadow-sm hover:shadow-md';
  };

  // Vérifier si c'est aujourd'hui
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 max-w-4xl mx-auto">
      {/* Header avec navigation */}
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
          <p className="text-gray-500 text-xs">Planification et suivi des maintenances</p>
        </div>

        {/* Navigation mois */}
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth} 
            className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <span className="text-base font-semibold text-gray-800 min-w-[150px] text-center">
            {new Date(currentYear, currentMonth).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={nextMonth} 
            className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 shadow-inner">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(j => (
            <div key={j} className="py-1 text-center text-xs font-bold text-gray-600 bg-white rounded shadow-sm">
              {j}
            </div>
          ))}
        </div>
        
        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_, i) => <div key={i} className="h-12" />)}
          {days.map(date => {
            const iso = date.toISOString().slice(0, 10);
            const entretiens = dateMap[iso] || [];
            const color = getDayColor(date);
            const today = isToday(date);
            
            return (
              <button
                key={iso}
                onClick={() => handleDayClick(date)}
                className={`
                  h-12 w-full flex flex-col items-center justify-center rounded border transition-all duration-200 
                  ${color} 
                  ${entretiens.length > 0 ? 'font-bold cursor-pointer hover:scale-105' : 'text-gray-400 cursor-default bg-white border-gray-200'} 
                  ${today ? 'ring-1 ring-indigo-400' : ''}
                  ${entretiens.length > 0 ? 'hover:shadow-md' : ''}
                `}
                disabled={entretiens.length === 0}
              >
                <span className={`text-xs ${today ? 'font-bold' : ''}`}>
                  {date.getDate()}
                </span>
                {entretiens.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {entretiens.slice(0, 2).map((e, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1 h-1 rounded-full ${
                          e.colorStatus === 'red' ? 'bg-red-500' : 
                          e.colorStatus === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                      />
                    ))}
                    {entretiens.length > 2 && (
                      <span className="text-xs font-medium">+{entretiens.length - 2}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title="Entretiens prévus"
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
          <Button variant="secondary" size="sm" onClick={() => setSelectedDate(null)}>
            Fermer
          </Button>
        }
      >
        <div className="space-y-2">
          {selectedEntretiens.map((e, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full p-1.5 ${
                      e.colorStatus === 'red'
                        ? 'bg-red-100 text-red-600'
                        : e.colorStatus === 'orange'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={faTools} className="text-xs" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {e.immatriculation}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {e.marque} {e.modele}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    e.colorStatus === 'red'
                      ? 'bg-red-100 text-red-700'
                      : e.colorStatus === 'orange'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {e.colorStatus === 'red'
                    ? 'Urgent'
                    : e.colorStatus === 'orange'
                      ? 'À venir'
                      : 'Normal'}
                </span>
              </div>

              <div className="mb-2 rounded-lg bg-white p-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCar} className="text-xs text-slate-400" />
                  <span className="text-xs font-medium">Véhicule :</span>
                </div>
                <div className="ml-4 text-xs text-slate-700">
                  <div>
                    <strong>{e.immatriculation}</strong>
                  </div>
                  <div>
                    {e.marque} {e.modele}
                  </div>
                </div>
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
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faCar} className="text-slate-400" />
                  <span className="font-medium">Jours restants :</span>
                  <span
                    className={`font-bold ${
                      e.daysRemaining <= 7
                        ? 'text-red-600'
                        : e.daysRemaining <= 14
                          ? 'text-orange-600'
                          : 'text-green-600'
                    }`}
                  >
                    {e.daysRemaining} jours
                  </span>
                </div>
                {e.telephone && (
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                    <span className="font-medium">Téléphone :</span>
                    <span className="text-slate-700">{e.telephone}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex gap-1.5 border-t border-slate-200 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(null);
                    if (e.colorStatus === 'red') {
                      navigate('/admin/entretiens/urgents');
                    } else {
                      const typeMap = {
                        'Catégorie A': '/admin/entretiens/vidange',
                        'Catégorie B': '/admin/entretiens/categorie_b',
                        'Catégorie C': '/admin/entretiens/categorie_c',
                      };
                      navigate(typeMap[e.typeLabel] || '/admin/entretiens');
                    }
                  }}
                >
                  Voir détails
                </Button>
                {e.colorStatus === 'red' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedDate(null);
                      navigate('/admin/entretiens/urgents');
                    }}
                  >
                    Valider
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <CalendarLegend compact={false} />
    </div>
  );
};

export default FullCalendar;