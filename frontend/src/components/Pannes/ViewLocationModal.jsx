import { FaMapMarkerAlt } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const ViewLocationModal = ({ show, onClose, location }) => {
  if (!show) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Localisation du véhicule"
      icon={FaMapMarkerAlt}
      size="2xl"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="h-96">
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=15&size=800x400&markers=color:red%7C${location}&key=VOTRE_CLE_API`}
          alt="Carte de localisation"
          className="h-full w-full rounded-lg border border-slate-200 object-cover"
        />
      </div>
    </Modal>
  );
};

export default ViewLocationModal;
