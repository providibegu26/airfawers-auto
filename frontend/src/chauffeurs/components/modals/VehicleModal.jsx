import { FaCar } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";

const VehicleModal = ({ onClose, vehicle, loading, error }) => (
  <Modal
    show
    onClose={onClose}
    title="Détails du véhicule"
    icon={FaCar}
    size="md"
    footer={
      <Button variant="primary" size="sm" onClick={onClose}>
        Fermer
      </Button>
    }
  >
    {loading ? (
      <p className="text-center text-slate-500">Chargement...</p>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : !vehicle ? (
      <p className="text-center text-slate-500">Aucune donnée véhicule</p>
    ) : (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Immatriculation</p>
          <p className="font-medium text-slate-900">{vehicle.immatriculation}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Marque</p>
          <p className="font-medium text-slate-900">{vehicle.marque}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Modèle</p>
          <p className="font-medium text-slate-900">{vehicle.modele}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Année</p>
          <p className="font-medium text-slate-900">{vehicle.annee}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Catégorie</p>
          <p className="font-medium text-slate-900">{vehicle.categorie}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Kilométrage</p>
          <p className="font-medium text-slate-900">{vehicle.kilometrage} km</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Statut</p>
          <p className="font-medium text-slate-900">{vehicle.statut}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Date d'ajout</p>
          <p className="font-medium text-slate-900">
            {vehicle.dateAjout
              ? new Date(vehicle.dateAjout).toLocaleDateString()
              : ""}
          </p>
        </div>
      </div>
    )}
  </Modal>
);

export default VehicleModal;
