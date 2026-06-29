import { useState } from 'react';
import { searchByRadius, autocompleteCity } from '../services/api';
import type { GeoSearchResult, CitySuggestion } from '../services/api';
import SearchMap from '../components/SearchMap';

interface Props {
    isDark: boolean;
}

export default function Search({ isDark }: Props) {
    const [stack, setStack] = useState('');
    const [city, setCity] = useState('');
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [radiusKm, setRadiusKm] = useState('50');
    const [results, setResults] = useState<GeoSearchResult[]>([]);
    const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    const card = isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm';
    const input = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';

    const handleSearch = async () => {
        if (lat === null || lng === null) return;
        setSearching(true); setSearched(false);
        try {
            const res = await searchByRadius({ lat, lng, radiusKm: Number(radiusKm), stack: stack || undefined });
            setResults(res.data.results || []); setSearched(true);
        } catch {
            setResults([]); setSearched(true);
        } finally {
            setSearching(false);
        }
    };

    const handleCityInput = async (value: string) => {
        setCity(value);
        setLat(null);
        setLng(null);
        if (value.length >= 2) {
            const res = await autocompleteCity(value);
            setCitySuggestions(res.data);
        } else {
            setCitySuggestions([]);
        }
    };

    const selectCity = (suggestion: CitySuggestion) => {
        setCity(suggestion.name);
        setLat(suggestion.latitude);
        setLng(suggestion.longitude);
        setCitySuggestions([]);
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

                    <div className="relative mb-3">
                        <input className={`w-full p-2 rounded border ${input}`} placeholder="City" value={city} onChange={e => handleCityInput(e.target.value)} />
                        {citySuggestions.length > 0 && (
                            <div className={`absolute z-10 w-full rounded-b border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                {citySuggestions.map(c => (
                                    <div key={c.name} className={`p-2 cursor-pointer ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`} onClick={() => selectCity(c)}>
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {lat !== null && lng !== null && (
                        <p className={`text-xs mb-3 ${subText}`}>📍 {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                    )}

                    <button onClick={handleSearch} className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold" disabled={lat === null}>
                        Search within {radiusKm}km
                    </button>
                </div>

                {searching && (<div className="text-center py-8 text-gray-400 text-lg">🔍 Searching...</div>)}

                {!searching && results.length > 0 && (
                    <div className="space-y-4">
                        <SearchMap center={[lat!, lng!]} radiusKm={Number(radiusKm)} results={results} />
                        <div className="space-y-3">
                            {results.map((r, i) => (
                                <div key={i} className={`${card} p-4 rounded-lg flex justify-between items-start`}>
                                    <div>
                                        <p className="font-semibold">{r.city} — {r.stack} ({r.level})</p>
                                        <p className={`text-sm ${subText}`}>
                                            Samples: {r.sampleSize} | Distance: {r.distanceKm.toFixed(1)} km
                                        </p>
                                        {(r.avgWorkExperience || r.avgAge || r.avgCompanySize) && (
                                            <p className={`text-xs mt-1 ${subText}`}>
                                                {r.avgWorkExperience && `🛠 ${r.avgWorkExperience}y exp`}
                                                {r.avgAge && ` · 🎂 ~${r.avgAge}y`}
                                                {r.avgCompanySize && ` · 🏢 ~${r.avgCompanySize} emp`}
                                            </p>
                                        )}
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