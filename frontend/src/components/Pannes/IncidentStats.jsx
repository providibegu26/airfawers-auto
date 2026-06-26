import React from 'react';
import { FaExclamationTriangle, FaClock, FaCheckCircle } from 'react-icons/fa';

const IncidentStats = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
      {/* Carte Stat Total */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-md bg-indigo-100 text-indigo-600">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Total des pannes</p>
            <p className="text-2xl font-bold text-gray-900">127</p>
          </div>
        </div>
      </div>

      {/* Carte Stat En Attente */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-md bg-orange-100 text-orange-600">
            <FaClock className="text-xl" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Pannes en attente</p>
            <p className="text-2xl font-bold text-gray-900">18</p>
          </div>
        </div>
      </div>

      {/* Carte Stat Résolues */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-md bg-green-100 text-green-600">
            <FaCheckCircle className="text-xl" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Pannes résolues</p>
            <p className="text-2xl font-bold text-gray-900">97</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentStats;