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
  const [radiusKm, setRadiusKm] = useState('50');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [useAI, setUseAI] = useState(false);

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
          // AI failed, just use raw input
          normalizedStack = stack;
          confidence = 0.5;
        }
      }

      const res = await submitSalary({
        stack,
        amount: Number(amount),
        city,
        latitude: Number(lat),
        longitude: Number(lng),
      });
      
      setMessage(
        useAI
          ? `Submitted! Raw: "${stack}" → AI Normalized: "${normalizedStack}" (${(confidence * 100).toFixed(0)}% confidence)`
          : `Submitted! Stack: "${stack}"`
      );
      setStack('');
      setAmount('');
      setCity('');
      setTimeout(() => setMessage(''), 5000);
    } catch {
      setMessage('Error submitting salary');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setSearched(false);
    try {
      const res = await searchByRadius({
        lat: Number(lat),
        lng: Number(lng),
        radiusKm: Number(radiusKm),
        stack: stack || undefined,
      });
      setResults(res.data.results || []);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">💰 CheckSalary</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {(['submit', 'search', 'dashboard'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded font-medium capitalize ${
                tab === t ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {t === 'submit' ? 'Submit' : t === 'search' ? 'Search' : 'Dashboard'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <div className="max-w-7xl mx-auto px-4">
              <Dashboard />
            </div>
          </div>
        )}

        {/* Submit Tab */}
        {tab === 'submit' && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Submit Salary</h2>

            {/* Toggle — above stack input */}
            <label className="flex items-center gap-2 mb-3 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={e => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              Use AI to normalize stack name
              <span className="text-gray-500">({useAI ? 'AI enabled' : 'using exact input'})</span>
            </label>

            <input
              className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600"
              placeholder="Stack (e.g. C-Sharp)"
              value={stack}
              onChange={e => setStack(e.target.value)}
              required
            />

            <input
              className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600"
              type="number"
              placeholder="Amount (₽)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />

            <div className="relative">
              <input
                className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600"
                placeholder="City"
                value={city}
                onChange={e => handleCityInput(e.target.value)}
                required
              />
              {citySuggestions.length > 0 && (
                <div className="absolute z-10 bg-gray-700 w-full rounded-b border border-gray-600">
                  {citySuggestions.map(c => (
                    <div
                      key={c}
                      className="p-2 hover:bg-gray-600 cursor-pointer"
                      onClick={() => { setCity(c); setCitySuggestions([]); }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-3">
              <input
                className="w-1/2 p-2 rounded bg-gray-700 border border-gray-600"
                type="number"
                step="any"
                placeholder="Latitude"
                value={lat}
                onChange={e => setLat(e.target.value)}
              />
              <input
                className="w-1/2 p-2 rounded bg-gray-700 border border-gray-600"
                type="number"
                step="any"
                placeholder="Longitude"
                value={lng}
                onChange={e => setLng(e.target.value)}
              />
            </div>

            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            {message && (
              <p className="mt-3 text-sm p-2 rounded bg-green-900 text-green-300">
                {message}
              </p>
            )}
          </form>
        )}

        {/* Search Tab */}
        {tab === 'search' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Search by Radius</h2>

              <div className="flex gap-3 mb-3">
                <input
                  className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
                  placeholder="Stack (optional)"
                  value={stack}
                  onChange={e => setStack(e.target.value)}
                />
                <input
                  className="w-32 p-2 rounded bg-gray-700 border border-gray-600"
                  type="number"
                  placeholder="Radius km"
                  value={radiusKm}
                  onChange={e => setRadiusKm(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mb-3">
                <input
                  className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                />
                <input
                  className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                />
              </div>

              <button onClick={handleSearch} className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold">
                Search within {radiusKm}km
              </button>
            </div>

            {/* Loading */}
            {searching && (
              <div className="text-center py-8 text-gray-400 text-lg">
                🔍 Searching...
              </div>
            )}

            {/* Map + Results */}
            {!searching && results.length > 0 && (
              <div className="space-y-4">
                <SearchMap
                  center={[Number(lat), Number(lng)]}
                  radiusKm={Number(radiusKm)}
                  results={results}
                />

                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{r.city} — {r.stack}</p>
                        <p className="text-sm text-gray-400">Samples: {r.sampleSize} | Distance: {r.distanceKm.toFixed(1)} km</p>
                      </div>
                      <p className="text-xl font-bold text-green-400">{r.averageSalary.toLocaleString()} ₽</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty */}
            {!searching && results.length === 0 && searched && (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-xl mb-2">😕 No results found</p>
                <p className="text-gray-400">
                  No salary data found within {radiusKm}km of this location{stack ? ` for ${stack}` : ''}.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try increasing the radius or removing the stack filter.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;