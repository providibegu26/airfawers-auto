import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const ChauffeurRow = ({ chauffeur, vehicles, onClick, onUpdate, onDelete, hideActions = false }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Utiliser les données du backend qui incluent déjà les véhicules assignés
  const vehiculeAssigne = chauffeur.vehicules && chauffeur.vehicules.length > 0 ? chauffeur.vehicules[0] : null;
  
  // Déterminer le statut basé sur l'attribution de véhicule
  const hasVehicle = vehiculeAssigne !== null;
  const statut = hasVehicle ? 'attribué' : 'non attribué';

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer text-xs text-gray-700" onClick={onClick}>
        <td className="px-6 py-3 whitespace-nowrap font-medium">{chauffeur.id}</td>
        <td className="px-6 py-3 whitespace-nowrap">{chauffeur.nom}</td>
        <td className="px-6 py-3 whitespace-nowrap">{chauffeur.postnom}</td>
        <td className="px-6 py-3 whitespace-nowrap">{chauffeur.prenom}</td>
        <td className="px-6 py-3 whitespace-nowrap">{chauffeur.sexe}</td>
        <td className="px-6 py-3 whitespace-nowrap">{chauffeur.user?.email || '-'}</td>
        <td className="px-6 py-3 whitespace-nowrap">{chauffeur.telephone}</td>
        {/* Colonne véhicule attribué */}
        <td className="px-6 py-3 whitespace-nowrap">
          {vehiculeAssigne ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs bg-indigo-100 text-indigo-700`}>
              {vehiculeAssigne.immatriculation}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        {/* Badge statut avec couleurs correctes */}
        <td className="px-6 py-3 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs
            ${vehiculeAssigne ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block
              ${vehiculeAssigne ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {vehiculeAssigne ? 'Attribué' : 'Non attribué'}
          </span>
        </td>
        {!hideActions && (
          <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium action-buttons">
            <button 
              className="text-indigo-600 hover:text-indigo-900 mr-2"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(chauffeur);
              }}
            >
              <FaEdit />
            </button>
            <button 
              className="text-red-600 hover:text-red-900"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmModal(true);
              }}
            >
              <FaTrash />
            </button>
          </td>
        )}
      </tr>

      {/* Modal de confirmation - rendu en dehors du tableau */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirmer la suppression</h3>
            <p className="mb-6 text-gray-600">Voulez-vous vraiment supprimer ce chauffeur ?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDelete(chauffeur.id);
                  setShowConfirmModal(false);
                }}
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