import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const KINSHASA_CENTER = [-4.3217, 15.3125];
export const DEFAULT_ZOOM = 12;

export function createMarkerIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8]
  });
}

export const MARKER_COLORS = {
  en_attente: '#f59e0b',
  en_cours: '#3b82f6',
  resolue: '#9ca3af',
  default: '#ef4444'
};

export function getMarkerColor(statut) {
  return MARKER_COLORS[statut] || MARKER_COLORS.default;
}
