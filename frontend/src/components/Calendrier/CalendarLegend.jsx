import React from 'react';

const CalendarLegend = ({ compact }) => {
  return (
    <div className={`mt-4 ${compact ? 'flex justify-between' : 'flex justify-center gap-6'}`}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-xs text-gray-700">Normal (&gt;14 jours)</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
        <span className="text-xs text-gray-700">À venir (≤14 jours)</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-xs text-gray-700">Urgent (≤7 jours)</span>
      </div>
      
      {!compact && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-xs text-gray-700">Aucun entretien</span>
        </div>
      )}
    </div>
  );
};

export default CalendarLegend;