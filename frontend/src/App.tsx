import { useState } from 'react';
import { submitSalary, searchByRadius, autocompleteCity, normalizeStack } from './services/api';
import type { GeoSearchResult } from './services/api';
import Dashboard from './pages/Dashboard';
import SearchMap from './components/SearchMap';

function App() {
    const [tab, setTab] = useState<'submit' | 'search' | 'dashboard'>('submit');
    const [stack, setStack] = useState('');
    const [amount, setAmount] = useState('');
    const [city, setCity] = useState('');
    const [lat, setLat] = useState('52.52');
    const [lng, setLng] = useState('13.40');
    const [level, setLevel] = useState('Middle');
    const [radiusKm, setRadiusKm] = useState('50');
    const [message, setMessage] = useState('');
    const [results, setResults] = useState<GeoSearchResult[]>([]);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const isDark = theme === 'dark';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        try {
            let normalizedStack = stack;
            let confidence = 1.0;
            if (useAI) {
                try {
                    const normRes = await normalizeStack(stack);
                    normalizedStack = normRes.data.normalized;
                    confidence = normRes.data.confidence;
                } catch {
                    normalizedStack = stack;
                    confidence = 0.5;
                }
            }
            await submitSalary({ stack, amount: Number(amount), city, latitude: Number(lat), longitude: Number(lng), level });
            setMessage(useAI ? `Submitted! Raw: "${stack}" → AI Normalized: "${normalizedStack}" (${(confidence * 100).toFixed(0)}% confidence)` : `Submitted! Stack: "${stack}"`);
            setStack(''); setAmount(''); setCity('');
            setTimeout(() => setMessage(''), 5000);
        } catch {
            setMessage('Error submitting salary');
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setSubmitting(false);
        }
    };

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

    const handleCityInput = async (value: string) => {
        setCity(value);
        if (value.length >= 2) {
            const res = await autocompleteCity(value);
            setCitySuggestions(res.data);
        } else {
            setCitySuggestions([]);
        }
    };

    const bg = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const text = isDark ? 'text-white' : 'text-gray-900';
    const card = isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm';
    const input = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';
    const headerBg = isDark ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-gray-200';

    return (
        <div className={`min-h-screen flex flex-col ${bg} ${text}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-sm ${headerBg}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <span className="text-xl font-bold">CheckSalary</span>
                    </div>
                    <nav className="flex gap-1">
                        {(['submit', 'search', 'dashboard'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                    tab === t
                                        ? 'bg-blue-600 text-white'
                                        : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </nav>
                    <select
                        value={theme}
                        onChange={e => setTheme(e.target.value as 'dark' | 'light')}
                        className={`text-sm rounded-lg px-3 py-2 border cursor-pointer ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                        <option value="dark">🌙 Dark</option>
                        <option value="light">☀️ Light</option>
                    </select>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 flex-grow">
                {/* Dashboard Tab */}
                {tab === 'dashboard' && (
                    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
                        <div className="max-w-7xl mx-auto px-4">
                            <Dashboard isDark={isDark} />
                        </div>
                    </div>
                )}

                {/* Submit Tab */}
                {tab === 'submit' && (
                    <form onSubmit={handleSubmit} className={`${card} p-6 rounded-lg mb-8 max-w-md mx-auto`}>
                        <h2 className="text-xl font-semibold mb-4">Submit Salary</h2>
                        <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
                            <input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                            <span className={subText}>Use AI to normalize stack name</span>
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>({useAI ? 'AI enabled' : 'using exact input'})</span>
                        </label>
                        <input className={`w-full p-2 mb-3 rounded border ${input}`} placeholder="Stack (e.g. C-Sharp)" value={stack} onChange={e => setStack(e.target.value)} required />
                        <select className={`w-full p-2 mb-3 rounded border ${input}`} value={level} onChange={e => setLevel(e.target.value)}>
                            <option value="Junior">Junior</option>
                            <option value="Middle">Middle</option>
                            <option value="Senior">Senior</option>
                        </select>
                        <input className={`w-full p-2 mb-3 rounded border ${input}`} type="number" placeholder="Amount (₽)" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <div className="relative">
                            <input className={`w-full p-2 mb-3 rounded border ${input}`} placeholder="City" value={city} onChange={e => handleCityInput(e.target.value)} required />
                            {citySuggestions.length > 0 && (
                                <div className={`absolute z-10 w-full rounded-b border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                    {citySuggestions.map(c => (
                                        <div key={c} className={`p-2 cursor-pointer ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`} onClick={() => { setCity(c); setCitySuggestions([]); }}>{c}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mb-3">
                            <input className={`w-1/2 p-2 rounded border ${input}`} type="number" step="any" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
                            <input className={`w-1/2 p-2 rounded border ${input}`} type="number" step="any" placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} />
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                        {message && (
                            <p className={`mt-3 text-sm p-2 rounded ${message.startsWith('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                )}

                {/* Search Tab */}
                {tab === 'search' && (
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
                )}
            </div>

            {/* Footer */}
            <footer className={`border-t mt-16 py-6 ${isDark ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                <div className="max-w-6xl mx-auto px-4 text-center text-sm">
                    <p>Built with .NET 8 · React</p>
                    <p className="mt-1">© {new Date().getFullYear()} CheckSalary</p>
                </div>
            </footer>
        </div>
    );
}

export default App;