import {
  FaTools,
  FaCalendarAlt,
  FaWrench,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";

const MaintenanceModal = ({ onClose, maintenance, loading, error }) => (
  <Modal
    show
    onClose={onClose}
    title="Entretien programmé"
    subtitle="À confirmer par l'administrateur"
    icon={FaTools}
    size="md"
    footer={
      <Button variant="primary" size="sm" onClick={onClose}>
        Compris
      </Button>
    }
  >
    {loading ? (
      <p className="text-center text-slate-500">Chargement...</p>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : !maintenance ? (
      <p className="text-center text-slate-500">Aucun entretien programmé</p>
    ) : (
      <div className="space-y-3">
        <div className="flex items-start">
          <FaCalendarAlt className="mr-3 mt-1 text-amber-500" />
          <div>
            <p className="text-sm text-slate-500">Date prévue</p>
            <p className="font-medium text-slate-900">{maintenance.date}</p>
          </div>
        </div>

        <div className="flex items-start">
          <FaWrench className="mr-3 mt-1 text-amber-500" />
          <div>
            <p className="text-sm text-slate-500">Type d'intervention</p>
            <p className="font-medium text-slate-900">{maintenance.type}</p>
          </div>
        </div>

        <div className="flex items-start">
          <FaMapMarkerAlt className="mr-3 mt-1 text-amber-500" />
          <div>
            <p className="text-sm text-slate-500">Lieu</p>
            <p className="font-medium text-slate-900">{maintenance.location}</p>
          </div>
        </div>
      </div>
    )}
  </Modal>
);

export default MaintenanceModal;
