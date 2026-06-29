import { useState } from 'react';
import { submitSalary, autocompleteCity, normalizeStack } from '../services/api';
import type { CitySuggestion } from '../services/api';

interface Props {
    isDark: boolean;
}

export default function Submit({ isDark }: Props) {
    const [stack, setStack] = useState('');
    const [amount, setAmount] = useState('');
    const [city, setCity] = useState('');
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [level, setLevel] = useState('Middle');
    const [workExperience, setWorkExperience] = useState('');
    const [age, setAge] = useState('');
    const [companySize, setCompanySize] = useState('');
    const [message, setMessage] = useState('');
    const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [useAI, setUseAI] = useState(false);

    const card = isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm';
    const input = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lat === null || lng === null) {
            setMessage('Please select a city from the dropdown');
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        if (!workExperience) {
            setMessage('Please enter your work experience');
            setTimeout(() => setMessage(''), 5000);
            return;
        }
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
            await submitSalary({
                stack,
                amount: Number(amount),
                city,
                latitude: lat,
                longitude: lng,
                level,
                workExperience: Number(workExperience),
                age: age ? Number(age) : undefined,
                companySize: companySize ? Number(companySize) : undefined,
            });
            setMessage(useAI ? `Submitted! "${stack}" → "${normalizedStack}" (${(confidence * 100).toFixed(0)}%)` : `Submitted! "${stack}"`);
            setStack(''); setAmount(''); setCity(''); setLat(null); setLng(null);
            setWorkExperience(''); setAge(''); setCompanySize('');
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
        <form onSubmit={handleSubmit} className={`${card} p-6 rounded-lg mb-8 max-w-md mx-auto`}>
            <h2 className="text-xl font-semibold mb-4">Submit Salary</h2>

            <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
                <input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                <span className={subText}>Use AI to normalize stack name</span>
            </label>

            <input className={`w-full p-2 mb-3 rounded border ${input}`} placeholder="Stack (e.g. C-Sharp)" value={stack} onChange={e => setStack(e.target.value)} required />

            <select className={`w-full p-2 mb-3 rounded border ${input}`} value={level} onChange={e => setLevel(e.target.value)}>
                <option value="Junior">Junior</option>
                <option value="Middle">Middle</option>
                <option value="Senior">Senior</option>
            </select>

            <input className={`w-full p-2 mb-3 rounded border ${input}`} type="number" placeholder="Work Experience (years)" value={workExperience} onChange={e => setWorkExperience(e.target.value)} required />

            <input className={`w-full p-2 mb-3 rounded border ${input}`} type="number" placeholder="Age (optional)" min="16" max="100" value={age} onChange={e => setAge(e.target.value)} />

            <select className={`w-full p-2 mb-3 rounded border ${input}`} value={companySize} onChange={e => setCompanySize(e.target.value)}>
                <option value="">Company Size (optional)</option>
                <option value="10">1-10 employees</option>
                <option value="50">11-50 employees</option>
                <option value="200">51-200 employees</option>
                <option value="500">201-500 employees</option>
                <option value="1000">500+ employees</option>
            </select>

            <input className={`w-full p-2 mb-3 rounded border ${input}`} type="number" placeholder="Amount (₽)" value={amount} onChange={e => setAmount(e.target.value)} required />

            <div className="relative mb-3">
                <input className={`w-full p-2 rounded border ${input}`} placeholder="City" value={city} onChange={e => handleCityInput(e.target.value)} required />
                {citySuggestions.length > 0 && (
                    <div className={`absolute z-10 w-full rounded-b border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                        {citySuggestions.map(c => (
                            <div key={c.name} className={`p-2 cursor-pointer ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`} onClick={() => selectCity(c)}>{c.name}</div>
                        ))}
                    </div>
                )}
            </div>

            {lat !== null && lng !== null && (
                <p className={`text-xs mb-3 ${subText}`}>📍 {lat.toFixed(4)}, {lng.toFixed(4)}</p>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
            </button>

            {message && (
                <p className={`mt-3 text-sm p-2 rounded ${message.startsWith('Error') || message.startsWith('Please') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}