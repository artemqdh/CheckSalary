import { useState } from 'react';
import { submitSalary, autocompleteCity, normalizeStack } from '../services/api';

interface Props {
    isDark: boolean;
}

export default function Submit({ isDark }: Props)
{
    const [stack, setStack] = useState('');
    const [amount, setAmount] = useState('');
    const [city, setCity] = useState('');
    const [lat, setLat] = useState('52.52');
    const [lng, setLng] = useState('13.40');
    const [level, setLevel] = useState('Middle');
    const [message, setMessage] = useState('');
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [useAI, setUseAI] = useState(false);

    const card = isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm';
    const input = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';

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
            setMessage(useAI ? `Submitted! "${stack}" → "${normalizedStack}" (${(confidence * 100).toFixed(0)}%)` : `Submitted! "${stack}"`);
            setStack(''); setAmount(''); setCity('');
            setTimeout(() => setMessage(''), 5000);
        } catch {
            setMessage('Error submitting salary');
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setSubmitting(false);
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
    );
}