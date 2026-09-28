'use client';

import React, { useEffect, useRef } from 'react';

interface DisplayMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  categoryName?: string;
  status?: string;
}

export const ComplaintDisplayMap: React.FC<DisplayMapProps> = ({
  latitude,
  longitude,
  title,
  address,
  categoryName,
  status,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;

    const init = async () => {
      L = (await import('leaflet')).default;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'display-pin',
          html: `<div style="background-color: #e11d48; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
                  <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 14px;">📍</div>
                 </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #0f172a; font-size: 13px;">${title}</strong><br/>
            <span style="color: #64748b;">${categoryName || 'Civic Issue'}</span><br/>
            <p style="margin: 4px 0 0; color: #334155;">${address}</p>
          </div>
        `).openPopup();

        mapInstanceRef.current = map;
      }
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title, address, categoryName, status]);

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-300 shadow-sm relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
