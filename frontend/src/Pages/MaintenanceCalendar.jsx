import React from 'react';
import FullCalendar from '../components/Calendrier/FullCalendar';

const MaintenanceCalendar = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Calendrier des Entretiens</h1>
          <p className="text-gray-600">
            Visualisez les entretiens prévus dans les 2 prochains mois. Cliquez sur une date pour voir les détails.
          </p>
        </div>

        <FullCalendar />
      </div>
    </div>
  );
};

export default MaintenanceCalendar; 