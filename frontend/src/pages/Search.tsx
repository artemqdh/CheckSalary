import { useState } from 'react';
import { searchByRadius } from '../services/api';
import type { GeoSearchResult } from '../services/api';
import SearchMap from '../components/SearchMap';

interface Props {
    isDark: boolean;
}

export default function Search({ isDark }: Props)
{
    const [stack, setStack] = useState('');
    const [lat, setLat] = useState('52.52');
    const [lng, setLng] = useState('13.40');
    const [radiusKm, setRadiusKm] = useState('50');
    const [results, setResults] = useState<GeoSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    const card = isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm';
    const input = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';

    const handleSearch = async () => {
        setSearching(true); setSearched(false);
        try {
            const res = await searchByRadius({ lat: Number(lat), lng: Number(lng), radiusKm: Number(radiusKm), stack: stack || undefined });
            setResults(res.data.results || []); setSearched(true);
        } catch {
            setResults([]); setSearched(true);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <div className="max-w-6xl mx-auto px-4">
                <div className={`${card} p-6 rounded-lg mb-6`}>
                    <h2 className="text-xl font-semibold mb-4">Search by Radius</h2>
                    <div className="flex gap-3 mb-3">
                        <input className={`flex-1 p-2 rounded border ${input}`} placeholder="Stack (optional)" value={stack} onChange={e => setStack(e.target.value)} />
                        <input className={`w-32 p-2 rounded border ${input}`} type="number" placeholder="Radius km" value={radiusKm} onChange={e => setRadiusKm(e.target.value)} />
                    </div>
                    <div className="flex gap-3 mb-3">
                        <input className={`flex-1 p-2 rounded border ${input}`} type="number" step="any" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
                        <input className={`flex-1 p-2 rounded border ${input}`} type="number" step="any" placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} />
                    </div>
                    <button onClick={handleSearch} className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold">
                        Search within {radiusKm}km
                    </button>
                </div>

                {searching && (<div className="text-center py-8 text-gray-400 text-lg">🔍 Searching...</div>)}

                {!searching && results.length > 0 && (
                    <div className="space-y-4">
                        <SearchMap center={[Number(lat), Number(lng)]} radiusKm={Number(radiusKm)} results={results} />
                        <div className="space-y-3">
                            {results.map((r, i) => (
                                <div key={i} className={`${card} p-4 rounded-lg flex justify-between items-center`}>
                                    <div>
                                        <p className="font-semibold">{r.city} — {r.stack} ({r.level})</p>
                                        <p className={`text-sm ${subText}`}>Samples: {r.sampleSize} | Distance: {r.distanceKm.toFixed(1)} km</p>
                                    </div>
                                    <p className="text-xl font-bold text-green-400">{r.averageSalary.toLocaleString()} ₽</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!searching && results.length === 0 && searched && (
                    <div className={`${card} p-8 rounded-lg text-center`}>
                        <p className="text-xl mb-2">😕 No results found</p>
                        <p className={subText}>No salary data found within {radiusKm}km of this location{stack ? ` for ${stack}` : ''}.</p>
                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Try increasing the radius or removing the stack filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}