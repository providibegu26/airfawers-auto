import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { KINSHASA_CENTER, createMarkerIcon, getMarkerColor } from "./leafletSetup";

const PanneLocationModal = ({ show, onClose, panne }) => {
  if (!panne) return null;

  const hasCoords = panne.latitude != null && panne.longitude != null;
  const position = hasCoords ? [panne.latitude, panne.longitude] : KINSHASA_CENTER;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Localisation"
      size="xl"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <p className="mb-4 text-sm text-slate-500">
        {panne.vehicule?.immatriculation} — {panne.chauffeur?.nomComplet || "—"}
      </p>
      {hasCoords ? (
        <div className="h-72 overflow-hidden rounded-lg border border-slate-200">
          <MapContainer
            center={position}
            zoom={15}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={position}
              icon={createMarkerIcon(getMarkerColor(panne.statut))}
            >
              <Popup>
                {panne.localisation || `${panne.latitude}, ${panne.longitude}`}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          Aucune coordonnée GPS pour cette panne.
          {panne.localisation && (
            <span className="mt-2 block text-slate-700">{panne.localisation}</span>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PanneLocationModal;
