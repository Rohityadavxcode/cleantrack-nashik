'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NASHIK_COORDINATES, NASHIK_ZONES } from '@/lib/constants';
import { MapPin, Navigation, AlertTriangle, Search, Check } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  zoneName: string;
  onLocationChange: (lat: number, lng: number, address: string, zoneName: string) => void;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  zoneName,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper: Detect which Nashik Zone matches coordinates
  const detectZone = (lat: number, lng: number): string => {
    let closestZone = NASHIK_ZONES[0].name;
    let minDistance = Infinity;

    for (const z of NASHIK_ZONES) {
      const d = Math.hypot(lat - z.centerLatitude, lng - z.centerLongitude);
      if (d < minDistance) {
        minDistance = d;
        closestZone = z.name;
      }
    }
    return closestZone;
  };

  // Helper: Reverse geocode via Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'CleanTrackNashik/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const detectedAddr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}, Nashik`;
        const detectedZ = detectZone(lat, lng);
        onLocationChange(lat, lng, detectedAddr, detectedZ);
      }
    } catch (e) {
      console.warn('Geocoding network fallback');
      const detectedZ = detectZone(lat, lng);
      onLocationChange(lat, lng, `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}, Nashik`, detectedZ);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;

    const initMap = async () => {
      L = (await import('leaflet')).default;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
                  <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 14px;">📍</div>
                 </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([latitude, longitude], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on('dragend', async (e: any) => {
          const pos = e.target.getLatLng();
          await reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', async (e: any) => {
          marker.setLatLng(e.latlng);
          await reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when coordinates change from parent
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Browser Geolocation Trigger
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. You can select location manually on the map.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Check if within Nashik bounds
        const b = NASHIK_COORDINATES.bounds;
        const isInsideNashik = lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;

        if (!isInsideNashik) {
          setErrorMsg('Detected GPS is outside Nashik city limits. Defaulting marker to Nashik Center, but you can adjust manually.');
        }

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        await reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg('Location permission was denied or timed out. Please click on the map or type your locality below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search locality in Nashik
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);

    try {
      const q = encodeURIComponent(`${searchQuery}, Nashik, Maharashtra`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
        headers: { 'User-Agent': 'CleanTrackNashik/1.0' },
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        const detectedZ = detectZone(lat, lng);
        onLocationChange(lat, lng, data[0].display_name, detectedZ);
      } else {
        setErrorMsg('Locality not found in Nashik. Try another landmark like "Ramkund", "College Road", or "Untwadi".');
      }
    } catch (err) {
      setErrorMsg('Search request failed. Please drag the pin on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar: GPS Button + Search Input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow flex items-center justify-center space-x-2 transition shrink-0"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location (GPS)'}</span>
        </button>

        <form onSubmit={handleAddressSearch} className="flex-grow flex gap-1">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search landmark (e.g. Ramkund, Thatte Nagar, Bytco Point)..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition shrink-0"
          >
            {isSearching ? '...' : 'Search'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow text-[11px] text-slate-700 font-medium">
          💡 Click or drag the marker to fine-tune exact location
        </div>
      </div>

      {/* Selected Location Summary Box */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-sky-900 uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Confirmed Coordinates</span>
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
        </div>

        <div className="text-sm text-slate-800 font-medium">
          <span className="font-bold text-slate-900">Address: </span>
          {address || 'Locating address...'}
        </div>

        <div className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded bg-white text-civic-800 border border-sky-300 shadow-sm">
          <span>Assigned Zone:</span>
          <span className="font-bold text-civic-900">{zoneName}</span>
        </div>
      </div>
    </div>
  );
};
