import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Resource, Shelter } from '../types';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';
import { ChevronRight, HeartPulse, Users, AlertTriangle } from 'lucide-react';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Refined, human-centered SVG map markers with subtle drop-shadows (no aggressive neon glow)
const createModernMarker = (
  bgHex: string,
  symbolSvg: string,
  isPulsing = false,
  badgeText?: string
) => {
  return L.divIcon({
    className: 'resqnet-modern-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        ${
          isPulsing
            ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${bgHex}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: ${bgHex}; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4); cursor: pointer; transition: transform 0.15s ease;">
          ${symbolSvg}
        </div>
        ${
          badgeText
            ? `<span style="position: absolute; bottom: -4px; right: -4px; background: #0B1220; color: ${bgHex}; font-size: 9px; font-weight: 700; border: 1px solid ${bgHex}; border-radius: 4px; padding: 0 3px; line-height: 12px; font-family: 'Inter', sans-serif;">${badgeText}</span>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// SVG icons for markers
const iconCriticalSOS = createModernMarker(
  '#FF6268',
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  true
);

const iconUnverifiedSOS = createModernMarker(
  '#FFB547',
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1220" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  false
);

const iconVerifiedSOS = createModernMarker(
  '#79B8FF',
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1220" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  false
);

const iconResource = createModernMarker(
  '#36D6C4',
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1220" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>',
  false
);

const iconShelter = createModernMarker(
  '#65D6A6',
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1220" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  false
);

// Simulated Riverbend inundation polygon
const floodPolygon: [number, number][] = [
  [28.5550, 77.2250],
  [28.5650, 77.2550],
  [28.5900, 77.2500],
  [28.6050, 77.2300],
  [28.5950, 77.2100],
  [28.5700, 77.2150],
];

// Map controller to fly smoothly to selected incident
const MapController: React.FC<{ targetCoords?: [number, number] | null }> = ({ targetCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 14, { duration: 0.8 });
    }
  }, [targetCoords, map]);
  return null;
};

export interface LeafletMapProps {
  incidents?: Incident[];
  resources?: Resource[];
  shelters?: Shelter[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  heightClass?: string;
  showFloodOverlay?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  incidents = [],
  resources = [],
  shelters = [],
  selectedIncident,
  onSelectIncident,
  heightClass = 'h-[500px]',
  showFloodOverlay = true,
}) => {
  const [tileError, setTileError] = useState(false);

  const defaultCenter: [number, number] = selectedIncident
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : [28.5800, 77.2300];

  return (
    <div className={`relative w-full ${heightClass} rounded-panel overflow-hidden border border-border bg-midnight shadow-card`}>
      {/* Offline / Tile Notice if external tiles fail */}
      {tileError && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-deep-slate/95 border border-border text-text-secondary px-3 py-2 rounded-control text-xs flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber" />
            <span>Map tile server offline. Tactical coordinates remain fully active.</span>
          </div>
          <button
            onClick={() => setTileError(false)}
            className="text-cyan underline text-xs font-medium hover:text-cloud-white"
          >
            Retry
          </button>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController
          targetCoords={selectedIncident ? [selectedIncident.latitude, selectedIncident.longitude] : null}
        />

        {/* Clean, keyless Dark Matter CartoDB tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
        />

        {/* Flood Inundation Mesh - subtle, non-intrusive cyan styling */}
        {showFloodOverlay && (
          <Polygon
            positions={floodPolygon}
            pathOptions={{
              color: '#36D6C4',
              fillColor: '#36D6C4',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 6',
            }}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-cyan block font-heading">Riverbend Flash Flood Zone</strong>
                <span className="text-text-secondary text-[11px]">Active evacuation advisory in effect.</span>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Incident SOS Pins */}
        {incidents.map((inc) => {
          let markerIcon = iconVerifiedSOS;
          if (inc.priority === 'critical') markerIcon = iconCriticalSOS;
          else if (inc.status === 'submitted' || inc.status === 'under_review') markerIcon = iconUnverifiedSOS;

          return (
            <Marker
              key={inc.id}
              position={[inc.latitude, inc.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectIncident && onSelectIncident(inc),
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-1.5 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-1">
                    <span className="font-heading font-bold text-xs text-cloud-white">
                      {inc.reference_code}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      inc.priority === 'critical' ? 'bg-coral/20 text-coral' : 'bg-cyan/15 text-cyan'
                    }`}>
                      {inc.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {inc.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-text-muted">{inc.people_count} people affected</span>
                    <Link
                      to={`/ops/incidents/${inc.id}`}
                      className="text-cyan font-medium hover:underline flex items-center gap-0.5"
                    >
                      View details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Fleet & Resource Pins */}
        {resources.map((res) => (
          <Marker
            key={res.id}
            position={[res.latitude, res.longitude]}
            icon={iconResource}
          >
            <Popup>
              <div className="p-1 max-w-xs space-y-1 font-sans">
                <div className="font-heading font-semibold text-xs text-cloud-white">
                  {res.name}
                </div>
                <div className="text-[11px] text-text-muted">
                  {res.resource_type} · Lead: {res.responder_lead_name || 'Assigned Lead'}
                </div>
                <div className="text-[11px] text-cyan font-medium">
                  Status: {res.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelters & Hospitals Pins */}
        {shelters.map((sh) => (
          <Marker
            key={sh.id}
            position={[sh.latitude, sh.longitude]}
            icon={iconShelter}
          >
            <Popup>
              <div className="p-1 max-w-xs space-y-1 font-sans">
                <div className="font-heading font-semibold text-xs text-cloud-white">
                  {sh.name}
                </div>
                <div className="text-[11px] text-text-secondary">
                  Beds available: <strong className="text-success-green">{sh.available_beds}</strong> / {sh.capacity_total}
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  {sh.address}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
