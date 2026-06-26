import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { KINSHASA_CENTER, createMarkerIcon } from './leafletSetup';

function MapRecenter({ position, followGps }) {
  const map = useMap();

  useEffect(() => {
    if (followGps && position) {
      map.setView(position, Math.max(map.getZoom(), 16));
    }
  }, [position, followGps, map]);

  return null;
}

function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng, true);
    }
  });
  return null;
}

const DRAG_MARKER_ICON = createMarkerIcon('#ef4444');

const DraggableLocationMap = ({
  latitude,
  longitude,
  onPositionChange,
  followGps = true,
  height = '110px'
}) => {
  const hasMarker = latitude != null && longitude != null;
  const center = hasMarker ? [latitude, longitude] : KINSHASA_CENTER;

  return (
    <div className="rounded border border-gray-200 overflow-hidden relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={hasMarker ? 16 : 12}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionChange={onPositionChange} />
        {hasMarker && (
          <>
            <MapRecenter position={[latitude, longitude]} followGps={followGps} />
            <Marker
              position={[latitude, longitude]}
              draggable
              icon={DRAG_MARKER_ICON}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onPositionChange(lat, lng, true);
                }
              }}
            />
          </>
        )}
      </MapContainer>
      {!hasMarker && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
          <span className="text-[10px] bg-white/90 text-gray-600 px-2 py-0.5 rounded shadow">
            Cliquez sur la carte pour placer le marqueur
          </span>
        </div>
      )}
    </div>
  );
};

export default DraggableLocationMap;
