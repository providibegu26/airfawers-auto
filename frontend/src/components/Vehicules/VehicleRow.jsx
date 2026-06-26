import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const VehicleRow = ({ vehicle, onViewDetails, onEdit, onAssignDriver, onDeleteVehicle }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Statut synchronisé
  const isAttribue = !!vehicle.chauffeur;
  const statut = isAttribue ? 'attribué' : 'non attribué';

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer text-xs" onClick={() => onViewDetails(vehicle)}>
        <td className="px-6 py-3 whitespace-nowrap">{vehicle.id}</td>
        <td className="px-6 py-3 whitespace-nowrap">{vehicle.marque}</td>
        <td className="px-6 py-3 whitespace-nowrap">{vehicle.modele}</td>
        <td className="px-6 py-3 whitespace-nowrap">{vehicle.immatriculation}</td>
        {/* Badge catégorie */}
        <td className="px-6 py-3 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs
            ${vehicle.categorie === 'HEAVY' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
          >
            {vehicle.categorie === 'HEAVY' ? 'HEAVY' : 'LIGHT'}
          </span>
        </td>
        {/* Colonne chauffeur */}
        <td className="px-6 py-3 whitespace-nowrap">
          {vehicle.chauffeur ? (
            <span className="text-sm font-medium text-gray-900">
              {vehicle.chauffeur.prenom} {vehicle.chauffeur.nom}
            </span>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAssignDriver(vehicle);
              }}
              className="text-blue-500 hover:text-blue-700 flex items-center action-buttons"
            >
              <FaEdit className="h-4 w-4 mr-1" />
              Attribuer
            </button>
          )}
        </td>
        {/* Badge statut synchronisé */}
        <td className="px-6 py-3 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs
            ${isAttribue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block
              ${isAttribue ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {statut.charAt(0).toUpperCase() + statut.slice(1)}
          </span>
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-right action-buttons">
          <div className="flex justify-end space-x-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(vehicle);
              }}
              className="text-indigo-600 hover:text-indigo-900 mr-2"
              title="Modifier"
            >
              <FaEdit />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmModal(true);
              }}
              className="text-red-600 hover:text-red-900"
              title="Supprimer"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirmer la suppression</h3>
            <p className="mb-6 text-gray-600">Voulez-vous vraiment supprimer ce véhicule ?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => { onDeleteVehicle(vehicle.id); setShowConfirmModal(false); }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};