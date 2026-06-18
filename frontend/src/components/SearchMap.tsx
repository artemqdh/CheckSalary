import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import type { GeoSearchResult } from '../services/api';

interface Props {
  center: [number, number];
  radiusKm: number;
  results: GeoSearchResult[];
}

export default function SearchMap({ center, radiusKm, results }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={9}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Search center marker */}
      <Marker position={center}>
        <Popup>Search center</Popup>
      </Marker>

      {/* Radius circle */}
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{ color: '#3b82f6', fillOpacity: 0.1 }}
      />

      {/* Result markers */}
      {results.map((r, i) => (
        <Marker key={i} position={[r.latitude, r.longitude]}>
            <Popup>
            <div>
                <p className="font-bold">{r.city}</p>
                <p>{r.stack} — {r.averageSalary.toLocaleString()}₽</p>
                <p>Samples: {r.sampleSize} | {r.distanceKm.toFixed(1)} km</p>
            </div>
            </Popup>
        </Marker>
        ))}
    </MapContainer>
  );
}