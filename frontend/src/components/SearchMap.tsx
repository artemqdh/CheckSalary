import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import type { GeoSearchResult } from '../services/api';

interface Props {
  center: [number, number];
  radiusKm: number;
  results: GeoSearchResult[];
}

export default function SearchMap({ center, radiusKm, results }: Props) {
    return (
        <>
            <MapContainer
                center={center}
                zoom={9}
                style={{ height: '400px', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}>
                    <Popup>Search center</Popup>
                </Marker>
                <Circle
                    center={center}
                    radius={radiusKm * 1000}
                    pathOptions={{ color: '#3b82f6', fillOpacity: 0.1 }}
                />
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
            <style>{`
              .leaflet-control-attribution {
                background: #000 !important;
                color: #1a1a1a !important;
                font-size: 8px !important;
                padding: 1px 3px !important;
                border-radius: 2px 0 0 0 !important;
                position: relative !important;
              }
              .leaflet-control-attribution::after {
                content: '' !important;
                position: absolute !important;
                inset: 0 !important;
                background: #000 !important;
                border-radius: 2px 0 0 0 !important;
              }
              .leaflet-control-attribution a {
                color: #1a1a1a !important;
                pointer-events: none !important;
              }
            `}</style>
        </>
    );
}