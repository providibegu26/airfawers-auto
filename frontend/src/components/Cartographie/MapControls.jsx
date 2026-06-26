import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faSearchLocation } from '@fortawesome/free-solid-svg-icons';

const MapControls = () => {
  return (
    <div className="flex space-x-3">
      <button className="p-2 text-gray-600 hover:text-indigo-600">
        <FontAwesomeIcon icon={faLayerGroup} title="Filtres" />
      </button>
      <button className="p-2 text-gray-600 hover:text-indigo-600">
        <FontAwesomeIcon icon={faSearchLocation} title="Recherche" />
      </button>
    </div>
  );
};

export default MapControls;