import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { KINSHASA_CENTER, DEFAULT_ZOOM, createMarkerIcon, getMarkerColor } from './leafletSetup';

function MapFlyTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target?.latitude != null && target?.longitude != null) {
      map.flyTo([target.latitude, target.longitude], 15, { duration: 0.8 });
    }
  }, [map, target]);

  return null;
}

function FitBounds({ pannes }) {
  const map = useMap();

  useEffect(() => {
    const points = pannes.filter((p) => p.latitude != null && p.longitude != null);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
      return;
    }
    const bounds = points.map((p) => [p.latitude, p.longitude]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, pannes]);

  return null;
}

function MapResizeHandler({ watchValue }) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize();
    };

    const timer = setTimeout(invalidate, 120);
    window.addEventListener('resize', invalidate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', invalidate);
    };
  }, [map, watchValue]);

  return null;
}

const PannesMap = ({ pannes, selectedPanne, onSelectPanne, height = '320px' }) => {
  const mappablePannes = pannes.filter((p) => p.latitude != null && p.longitude != null);

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200" style={{ height }}>
      {mappablePannes.length === 0 ? (
        <div className="h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Aucune panne géolocalisée à afficher
        </div>
      ) : (
        <MapContainer
          key={mappablePannes.map((p) => p.id).join('-')}
          center={KINSHASA_CENTER}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizeHandler watchValue={mappablePannes.length} />
          <FitBounds pannes={mappablePannes} />
          {selectedPanne && <MapFlyTo target={selectedPanne} />}
          {mappablePannes.map((panne) => (
            <Marker
              key={panne.id}
              position={[panne.latitude, panne.longitude]}
              icon={createMarkerIcon(getMarkerColor(panne.statut))}
              eventHandlers={{
                click: () => onSelectPanne?.(panne)
              }}
            >
              <Popup>
                <div className="text-sm min-w-[160px]">
                  <p className="font-semibold">{panne.vehicule?.immatriculation || 'Véhicule'}</p>
                  <p className="text-gray-600">{panne.chauffeur?.nomComplet || '—'}</p>
                  <p className="mt-1">{panne.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default PannesMap;
