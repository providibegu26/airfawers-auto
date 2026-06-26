import React from 'react';
import Modal from '../UI/Modal';

const AddIncidentModal = ({ show, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      vehicle: e.target.vehicle.value,
      incidentType: e.target.incidentType.value,
      description: e.target.incidentDescription.value,
      location: e.target.incidentLocation.value,
      urgent: e.target.urgent.checked
    };
    onSubmit(formData);
  };

  return (
    <Modal show={show} onClose={onClose} title="Déclarer une nouvelle panne" size="lg">
      <form className="space-y-4" id="incidentForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">
            Véhicule
          </label>
          <select
            id="vehicle"
            name="vehicle"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option>Sélectionner un véhicule</option>
            <option>AB-123-CD - Peugeot 308</option>
            <option>EF-456-GH - Renault Trafic</option>
            <option>IJ-789-KL - Citroën Berlingo</option>
            <option>MN-012-OP - Ford Transit</option>
            <option>QR-345-ST - Volvo XC60</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700">
            Type de panne
          </label>
          <select
            id="incidentType"
            name="incidentType"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option>Sélectionner un type</option>
            <option>Panne moteur</option>
            <option>Problème électrique</option>
            <option>Pneu crevé</option>
            <option>Batterie déchargée</option>
            <option>Climatisation défectueuse</option>
            <option>Autre</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="incidentDescription" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="incidentDescription"
            name="incidentDescription"
            rows="3"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="incidentLocation" className="block text-sm font-medium text-gray-700">
            Lieu
          </label>
          <input
            type="text"
            id="incidentLocation"
            name="incidentLocation"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="Adresse ou position GPS"
          />
          <div className="mt-2 flex justify-end">
            <button type="button" className="text-sm text-indigo-600 hover:text-indigo-500">
              <i className="fas fa-map-marked-alt mr-1"></i> Utiliser ma position actuelle
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="urgent"
            name="urgent"
            type="checkbox"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="urgent" className="ml-2 block text-sm text-gray-700">
            Urgence prioritaire
          </label>
        </div>
      </form>
      
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          form="incidentForm"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Déclarer la panne
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Annuler
        </button>
      </div>
    </Modal>
  );
};

export default AddIncidentModal;