'use client';

import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { useEffect, useMemo, useRef, useState } from 'react';
import Label from '@/components/ui/label';

type LatLng = { lat: number; lng: number };

let mapsOptionsKey: string | null = null;

function ensureMapsOptions(apiKey: string) {
  if (!apiKey) return;
  if (mapsOptionsKey === apiKey) return;
  // js-api-loader requires setOptions() to be called once globally.
  if (mapsOptionsKey) return;
  setOptions({ key: apiKey, v: 'weekly' });
  mapsOptionsKey = apiKey;
}

function parseCoordsFromUrl(url: string): LatLng | null {
  const s = url.trim();
  if (!s) return null;
  const at = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) return { lat: Number(at[1]), lng: Number(at[2]) };
  const q = s.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (q) return { lat: Number(q[1]), lng: Number(q[2]) };
  const ll = s.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (ll) return { lat: Number(ll[1]), lng: Number(ll[2]) };
  return null;
}

function toMapsUrl(coords: LatLng) {
  return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
}

export interface MapPickerProps {
  value: string;
  onValueChange: (url: string) => void;
  onResolvedAddress?: (address: {
    formattedAddress: string;
    city: string;
    state: string;
    pinCode: string;
    lat: number;
    lng: number;
  }) => void;
  label: string;
}

function componentsToAddress(result: google.maps.GeocoderResult) {
  const comps = result.address_components || [];
  const byType = (t: string) => comps.find((c) => c.types.includes(t))?.long_name || '';
  const city = byType('locality') || byType('sublocality') || byType('administrative_area_level_2');
  const state = byType('administrative_area_level_1');
  const pinCode = byType('postal_code');
  return {
    formattedAddress: result.formatted_address || '',
    city,
    state,
    pinCode,
  };
}

function findPostalCode(results: google.maps.GeocoderResult[]) {
  for (const r of results) {
    const comps = r.address_components || [];
    const pc = comps.find((c) => c.types.includes('postal_code'))?.long_name;
    if (pc) return pc;
  }
  return '';
}

export default function MapPicker({ value, onValueChange, onResolvedAddress, label }: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '';
  const [coords, setCoords] = useState<LatLng>(() => parseCoordsFromUrl(value) ?? { lat: 28.6139, lng: 77.209 });
  const [searchText, setSearchText] = useState('');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const resolvedKey = useMemo(() => value.trim(), [value]);

  const lastResolvedInput = useRef<string>('');
  useEffect(() => {
    const parsed = parseCoordsFromUrl(resolvedKey);
    if (parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
      setCoords(parsed);
    }
  }, [resolvedKey]);

  void lastResolvedInput;

  const geocodeReq = useRef(0);
  useEffect(() => {
    if (!apiKey) return;
    if (!onResolvedAddress) return;
    if (!('google' in window) || !google.maps) return;

    const id = ++geocodeReq.current;
    const t = window.setTimeout(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (id !== geocodeReq.current) return;
        if (status !== 'OK' || !results || results.length === 0) return;
        const best = results[0];
        const addr = componentsToAddress(best);
        const pinCode = addr.pinCode || findPostalCode(results);
        onResolvedAddress({
          ...addr,
          pinCode,
          lat: coords.lat,
          lng: coords.lng,
        });
      });
    }, 500);

    return () => window.clearTimeout(t);
  }, [apiKey, coords, onResolvedAddress]);

  useEffect(() => {
    if (!apiKey) return;
    ensureMapsOptions(apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    const el = boxRef.current;
    if (!el) return;

    let destroyed = false;

    Promise.all([importLibrary('maps'), importLibrary('places')])
      .then(() => {
        if (destroyed) return;
        const map = new google.maps.Map(el, {
          center: coords,
          zoom: 16,
          ...(mapId ? { mapId } : {}),
          mapTypeControl: true,
          fullscreenControl: false,
          streetViewControl: false,
        });
        mapRef.current = map;

        const m = new google.maps.Marker({ map, position: coords, draggable: true });
        markerRef.current = m;
        m.addListener('dragend', () => {
          const pos = m.getPosition();
          if (!pos) return;
          const next = { lat: pos.lat(), lng: pos.lng() };
          setCoords(next);
          onValueChange(toMapsUrl(next));
        });

        const input = inputRef.current;
        if (input) {
          const autocomplete = new google.maps.places.Autocomplete(input, {
            fields: ['formatted_address', 'geometry', 'address_components'],
          });
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            const next = { lat: loc.lat(), lng: loc.lng() };
            setCoords(next);
            onValueChange(toMapsUrl(next));
            if (place.formatted_address) setSearchText(place.formatted_address);
            if (onResolvedAddress) {
              const comps = (place.address_components || []) as google.maps.GeocoderAddressComponent[];
              const byType = (t: string) => comps.find((c) => c.types.includes(t))?.long_name || '';
              const city =
                byType('locality') || byType('sublocality') || byType('administrative_area_level_2');
              const state = byType('administrative_area_level_1');
              const pinCode = byType('postal_code');
              onResolvedAddress({
                formattedAddress: place.formatted_address || '',
                city,
                state,
                pinCode,
                lat: next.lat,
                lng: next.lng,
              });
            }
          });
        }
      })
      .catch(() => {
        // If loader fails, we fall back to blank map area (handled below).
      });

    return () => {
      destroyed = true;
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    const m = markerRef.current;
    const map = mapRef.current;
    if (!m || !map) return;
    map.setCenter(coords);
    m.setPosition(coords);
  }, [coords]);

  return (
    <div className="space-y-3 rounded-xl border-2 border-black/10 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor="mapsUrl">{label} *</Label>
        </div>
      </div>

      <input
        id="mapsUrl"
        autoComplete="off"
        className="block w-full rounded-xl border-2 border-black/10 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Type address to search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        ref={inputRef}
      />

      <div className="h-[320px] w-full overflow-hidden rounded-xl border-2 border-black/10 bg-[#F3F4F6]">
        {apiKey ? <div ref={boxRef} className="h-full w-full" /> : null}
      </div>
    </div>
  );
}

