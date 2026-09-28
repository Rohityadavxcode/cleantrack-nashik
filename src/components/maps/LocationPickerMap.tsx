'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NASHIK_COORDINATES, NASHIK_ZONES } from '@/lib/constants';
import { isWithinNashikServiceArea, reverseGeocodeAddress } from '@/lib/geo';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  Search,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Compass,
  Crosshair,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  locationSource?: 'GPS' | 'MANUAL';
  address: string;
  zoneName: string;
  language?: 'en' | 'mr';
  onLocationChange: (
    lat: number,
    lng: number,
    address: string,
    zoneName: string,
    accuracy: number | null,
    source: 'GPS' | 'MANUAL'
  ) => void;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  accuracy = null,
  locationSource = 'GPS',
  address,
  zoneName,
  language = 'en',
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    'IDLE' | 'DETECTING' | 'SUCCESS' | 'LOW_ACCURACY' | 'OUTSIDE_AREA' | 'DENIED'
  >('IDLE');
  const [detectedAccuracy, setDetectedAccuracy] = useState<number | null>(accuracy);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMarathi = language === 'mr';

  // Perform reverse geocode & notify parent
  const handleReverseGeocode = async (
    lat: number,
    lng: number,
    acc: number | null,
    source: 'GPS' | 'MANUAL'
  ) => {
    try {
      const geoResult = await reverseGeocodeAddress(lat, lng);
      onLocationChange(lat, lng, geoResult.address, geoResult.zoneName, acc, source);
    } catch (e) {
      onLocationChange(
        lat,
        lng,
        `Near ${lat.toFixed(5)}, ${lng.toFixed(5)}, Nashik`,
        zoneName,
        acc,
        source
      );
    }
  };

  // Initialize Leaflet Map
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
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-civic-pin',
          html: `<div style="background-color: #0284c7; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 2.5px solid white;">
                  <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 15px;">📍</div>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const marker = L.marker([latitude, longitude], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        // Drag marker: switches to MANUAL
        marker.on('dragend', async (e: any) => {
          const pos = e.target.getLatLng();
          setDetectedAccuracy(null);
          setGpsStatus('IDLE');
          setErrorMessage(null);

          // Verify bounds on drag
          const boundaryCheck = isWithinNashikServiceArea(pos.lat, pos.lng);
          if (!boundaryCheck.isWithin) {
            setGpsStatus('OUTSIDE_AREA');
            setErrorMessage(
              boundaryCheck.reason ||
                'This location appears to be outside the CleanTrack Nashik service area.'
            );
          }

          await handleReverseGeocode(pos.lat, pos.lng, null, 'MANUAL');
        });

        // Click map: moves marker, switches to MANUAL
        map.on('click', async (e: any) => {
          marker.setLatLng(e.latlng);
          setDetectedAccuracy(null);
          setGpsStatus('IDLE');
          setErrorMessage(null);

          const boundaryCheck = isWithinNashikServiceArea(e.latlng.lat, e.latlng.lng);
          if (!boundaryCheck.isWithin) {
            setGpsStatus('OUTSIDE_AREA');
            setErrorMessage(
              boundaryCheck.reason ||
                'This location appears to be outside the CleanTrack Nashik service area.'
            );
          }

          await handleReverseGeocode(e.latlng.lat, e.latlng.lng, null, 'MANUAL');
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

  // Update marker position and accuracy circle
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);

      // Draw or update accuracy circle if present
      if (detectedAccuracy && detectedAccuracy > 0) {
        import('leaflet').then((LModule) => {
          const L = LModule.default;
          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.remove();
          }
          accuracyCircleRef.current = L.circle([latitude, longitude], {
            radius: detectedAccuracy,
            color: '#0284c7',
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(mapInstanceRef.current);
        });
      } else if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }
    }
  }, [latitude, longitude, detectedAccuracy]);

  // Real-Time GPS Detection using navigator.geolocation
  const handleDetectGPS = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('DENIED');
      setErrorMessage(
        isMarathi
          ? 'तुमच्या ब्राउझरमध्ये GPS जिओलोकेशन सुविधा उपलब्ध नाही. कृपया नकाशावर ठिकाण निवडा.'
          : 'Geolocation is not supported by your browser. Please adjust marker on map.'
      );
      return;
    }

    setIsLocating(true);
    setGpsStatus('DETECTING');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
        setDetectedAccuracy(acc);

        // Check Nashik boundary
        const boundaryCheck = isWithinNashikServiceArea(lat, lng);

        if (!boundaryCheck.isWithin) {
          setGpsStatus('OUTSIDE_AREA');
          setErrorMessage(
            boundaryCheck.reason ||
              'This location appears to be outside the CleanTrack Nashik reporting area.'
          );
        } else if (acc && acc > 100) {
          setGpsStatus('LOW_ACCURACY');
        } else {
          setGpsStatus('SUCCESS');
        }

        // Pan map to detected coordinates
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        await handleReverseGeocode(lat, lng, acc, 'GPS');
      },
      (err) => {
        setIsLocating(false);
        setGpsStatus('DENIED');
        console.warn('Geolocation error:', err);
        setErrorMessage(
          isMarathi
            ? 'आम्हाला तुमचे वर्तमान स्थान मिळू शकले नाही. कृपया पुन्हा प्रयत्न करा किंवा नकाशावर स्वतः जागा निवडा.'
            : "We couldn't access your current location. Please verify browser location permissions or select manually on the map."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Search locality in Nashik
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const q = encodeURIComponent(`${searchQuery}, Nashik, Maharashtra`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`,
        { headers: { 'User-Agent': 'CleanTrackNashik/1.0' } }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        const boundaryCheck = isWithinNashikServiceArea(lat, lng);
        if (!boundaryCheck.isWithin) {
          setGpsStatus('OUTSIDE_AREA');
          setErrorMessage(
            boundaryCheck.reason ||
              'Found location is outside the Nashik municipal reporting boundary.'
          );
        } else {
          setGpsStatus('IDLE');
        }

        setDetectedAccuracy(null);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        await handleReverseGeocode(lat, lng, null, 'MANUAL');
      } else {
        setErrorMessage(
          isMarathi
            ? 'नाशिकमध्ये ठिकाण सापडले नाही. कृपया "रामकुंड", "कॉलेज रोड", किंवा "उंटवाडी" सारखे परिचित नाव शोधा.'
            : 'Locality not found in Nashik. Try landmarks like "Ramkund", "College Road", or "Untwadi".'
        );
      }
    } catch (err) {
      setErrorMessage(
        isMarathi
          ? 'शोध विनंती अयशस्वी झाली. कृपया नकाशावर पिन ड्रॅग करा.'
          : 'Search request failed. Please drag the pin on the map.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & GPS Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="px-4 py-3 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition shrink-0 active:scale-95"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {isMarathi ? 'स्थान शोधत आहे...' : 'Detecting GPS Location...'}
              </span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4 text-sky-300" />
              <span>
                {isMarathi ? '📍 माझे वर्तमान स्थान शोधा (GPS)' : '📍 Use Current GPS Location'}
              </span>
            </>
          )}
        </button>

        <form onSubmit={handleAddressSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isMarathi
                  ? 'नाशिकमधील परिसर शोधा (उदा. कॉलेज रोड, द्वारका, रामकुंड)...'
                  : 'Search landmark or locality in Nashik...'
              }
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs transition"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : isMarathi ? 'शोधा' : 'Search'}
          </button>
        </form>
      </div>

      {/* GPS Status Banners */}
      {gpsStatus === 'DETECTING' && (
        <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center space-x-2 text-xs text-sky-900 animate-pulse">
          <Loader2 className="w-4 h-4 text-civic-600 animate-spin shrink-0" />
          <div>
            <strong>{isMarathi ? '📍 तुमचे स्थान शोधत आहे...' : '📍 Detecting your location...'}</strong>
            <span className="block text-[11px] text-sky-700">
              {isMarathi
                ? 'कृपया थोडा वेळ थांबा, उपग्रह GPS शी संपर्क केला जात आहे...'
                : 'Please wait, acquiring high-accuracy satellite GPS coordinates...'}
            </span>
          </div>
        </div>
      )}

      {gpsStatus === 'SUCCESS' && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isMarathi ? '✓ स्थान यशस्वीरित्या नोंदवले' : '✓ Real-time Location Detected'}
              </div>
              <div className="text-[11px] text-emerald-800">
                Nashik, Maharashtra &bull;{' '}
                {detectedAccuracy ? (
                  <span>
                    {isMarathi
                      ? `अचूकता: अंदाजे ±${detectedAccuracy} मीटर`
                      : `Accuracy: approximately ±${detectedAccuracy} meters`}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
            Real GPS
          </span>
        </div>
      )}

      {gpsStatus === 'LOW_ACCURACY' && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-2 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">
              {isMarathi ? '⚠️ GPS अचूकता कमी आहे' : '⚠️ Location Accuracy is Low'}
            </div>
            <p className="text-[11px] text-amber-800">
              {isMarathi
                ? `सध्याची GPS अचूकता अंदाजे ±${detectedAccuracy} मीटर आहे. कृपया मोकळ्या जागेत जा किंवा अचूक ठिकाणासाठी नकाशावरील पिन योग्य जागेवर ड्रॅग करा.`
                : `Your location accuracy is currently low (±${detectedAccuracy}m). Please move to an open area or adjust the pin manually on the map.`}
            </p>
          </div>
        </div>
      )}

      {gpsStatus === 'OUTSIDE_AREA' && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start justify-between gap-3 text-xs text-rose-950">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                {isMarathi ? 'नाशिक कार्यक्षेत्राबाहेरील स्थान' : 'Outside CleanTrack Nashik Area'}
              </div>
              <p className="text-[11px] text-rose-800">
                {errorMessage ||
                  (isMarathi
                    ? 'हे ठिकाण नाशिक महानगरपालिकेच्या सेवा कार्यक्षेत्राबाहेर दिसते.'
                    : 'This location appears to be outside the current CleanTrack Nashik reporting area.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              // Center back to Nashik
              const center = NASHIK_COORDINATES.center;
              if (mapInstanceRef.current && markerRef.current) {
                mapInstanceRef.current.setView([center.lat, center.lng], 14);
                markerRef.current.setLatLng([center.lat, center.lng]);
              }
              handleReverseGeocode(center.lat, center.lng, null, 'MANUAL');
              setGpsStatus('IDLE');
              setErrorMessage(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 transition"
          >
            {isMarathi ? 'नाशिक केंद्र निवडा' : 'Adjust to Nashik'}
          </button>
        </div>
      )}

      {gpsStatus === 'DENIED' && (
        <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl flex items-start justify-between gap-2 text-xs text-slate-800">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                {isMarathi ? 'स्थान परवानगी मिळाली नाही' : "Couldn't Access Current Location"}
              </div>
              <p className="text-[11px] text-slate-600">
                {isMarathi
                  ? 'स्थान परवानगी नाकारली गेली आहे. काळजी करू नका, तुम्ही खालील नकाशावर थेट पिन हलवून योग्य ठिकाण निवडू शकता.'
                  : "We couldn't access your current location. You can still select the exact location manually on the map below."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetectGPS}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 font-bold text-[11px] text-slate-700 shrink-0 transition"
          >
            {isMarathi ? 'पुन्हा प्रयत्न करा' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Real Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="h-72 sm:h-96 w-full z-0" />

        {/* Floating Controls / Badge */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto flex flex-wrap items-center gap-2 pointer-events-none z-10">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold flex items-center space-x-1.5 shadow pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {locationSource === 'GPS'
                ? isMarathi
                  ? 'स्रोत: थेट GPS'
                  : 'Source: Real GPS'
                : isMarathi
                ? 'स्रोत: स्वतः निवडलेले (Manual)'
                : 'Source: Manual Pin'}
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-slate-800 text-[11px] font-bold shadow pointer-events-auto">
            <span>{zoneName}</span>
          </div>
        </div>

        {/* Map Tip */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-slate-600 text-[10px] font-medium shadow pointer-events-none hidden sm:block">
          {isMarathi ? '📍 अचूक जागेसाठी पिन ड्रॅग करा' : '📍 Drag marker to adjust location'}
        </div>
      </div>

      {/* Confirmed Coordinates & Address Card */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-slate-700">
            {isMarathi ? 'निश्चित केलेले ठिकाण' : 'Confirmed Location Details'}
          </span>
          <div className="font-mono text-[11px]">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
            {detectedAccuracy ? ` (±${detectedAccuracy}m)` : ''}
          </div>
        </div>

        <p className="text-xs text-slate-800 font-semibold leading-relaxed">
          {address}
        </p>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {isMarathi ? 'प्रशासकीय विभाग:' : 'Administrative Zone:'}{' '}
            <strong className="text-civic-800 font-bold">{zoneName}</strong>
          </span>
          <span className="text-[10px] text-slate-400">
            {isMarathi ? 'अचूक तक्रार निवारणासाठी' : 'Used for automated department routing'}
          </span>
        </div>
      </div>
    </div>
  );
};
