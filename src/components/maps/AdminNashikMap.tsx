'use client';

import React, { useEffect, useRef } from 'react';
import { NASHIK_COORDINATES, STATUS_CONFIG } from '@/lib/constants';

interface MapComplaintItem {
  id: string;
  referenceId: string;
  title: string;
  category: { name: string; icon: string };
  status: string;
  urgency: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    zoneName: string;
  } | null;
}

interface AdminMapProps {
  complaints: MapComplaintItem[];
  selectedZone?: string;
  onSelectComplaint?: (id: string) => void;
}

export const AdminNashikMap: React.FC<AdminMapProps> = ({
  complaints,
  selectedZone,
  onSelectComplaint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;

    const init = async () => {
      L = (await import('leaflet')).default;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView(
          [NASHIK_COORDINATES.center.lat, NASHIK_COORDINATES.center.lng],
          12
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      // Update pins
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        complaints.forEach((c) => {
          if (!c.location) return;

          const statusCfg = STATUS_CONFIG[c.status] || { color: '#64748b', label: c.status };
          const pinColor = statusCfg.color;

          const pinIcon = L.divIcon({
            className: 'admin-civic-pin',
            html: `<div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.35); border: 2px solid white;">
                    <div style="transform: rotate(45deg); font-size: 11px; color: white;">•</div>
                   </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          });

          const marker = L.marker([c.location.latitude, c.location.longitude], {
            icon: pinIcon,
          });

          const popupContent = `
            <div style="font-family: sans-serif; font-size: 12px; width: 210px;">
              <span style="display:inline-block; padding: 2px 6px; border-radius: 4px; background: ${pinColor}20; color: ${pinColor}; font-weight: bold; font-size: 10px; margin-bottom: 4px;">
                ${c.referenceId} - ${statusCfg.label}
              </span>
              <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px; font-size: 13px;">${c.title}</div>
              <div style="color: #64748b; font-size: 11px;">Zone: ${c.location.zoneName}</div>
              <div style="color: #334155; font-size: 11px; margin-top: 4px;">${c.location.address}</div>
              <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <a href="/admin/complaints/${c.referenceId}" style="display: inline-block; background: #0284c7; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">
                  Manage Ticket &rarr;
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersLayerRef.current.addLayer(marker);
        });
      }
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaints, selectedZone]);

  return (
    <div className="w-full h-96 sm:h-[500px] rounded-xl overflow-hidden border border-slate-300 shadow-md relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-1.5 pointer-events-auto max-w-xs">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          Active Nashik Issues ({complaints.length})
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
          <span>Submitted / Received</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
          <span>In Progress / Active</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />
          <span>Resolved</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
          <span>Reopened / Overdue</span>
        </div>
      </div>
    </div>
  );
};
