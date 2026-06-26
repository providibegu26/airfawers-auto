import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCheck, FaTrash } from 'react-icons/fa';
import ConfirmationModal from '../UI/ConfirmationModal';



const IncidentTable = ({ data, onViewLocation, onResolve, onDelete }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleAction = (incident, action) => {
    setSelectedIncident(incident);
    setCurrentAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (currentAction === 'resolve') {
      onResolve(selectedIncident.id);
    } else {
      onDelete(selectedIncident.id);
    }
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* En-têtes inchangés */}
            <tbody className="divide-y divide-gray-200">
              {data.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  {/* Colonnes existantes inchangées */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewLocation(incident.location)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Voir localisation"
                      >
                        <FaMapMarkerAlt />
                      </button>
                      <button
                        onClick={() => handleAction(incident, 'resolve')}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Valider la résolution"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleAction(incident, 'delete')}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Supprimer la panne"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        actionType={currentAction}
      />
    </>
  );
};

export default IncidentTable;