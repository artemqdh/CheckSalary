import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getOverview, getTopCities, getTopStacks } from '../services/api';
import type { OverviewStats, CityStat, StackStat } from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function Dashboard({ isDark }: { isDark: boolean }) {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [cities, setCities] = useState<CityStat[]>([]);
    const [stacks, setStacks] = useState<StackStat[]>([]);
    const [levelFilter, setLevelFilter] = useState('All');
    const [stackFilter, setStackFilter] = useState('All');

    useEffect(() => {
        const lvl = levelFilter === 'All' ? undefined : levelFilter;
        const stk = stackFilter === 'All' ? undefined : stackFilter;
        getOverview(lvl, stk).then(res => setOverview(res.data));
        getTopCities(stk, lvl).then(res => setCities(res.data));
        getTopStacks(lvl, stk).then(res => setStacks(res.data));
    }, [levelFilter, stackFilter]);

    const card = isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';
    const chartGrid = isDark ? '#374151' : '#e5e7eb';
    const chartText = isDark ? '#9ca3af' : '#6b7280';
    const tooltipBg = isDark ? '#1f2937' : '#ffffff';
    const tooltipText = isDark ? '#fff' : '#1f2937';

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">📊 Dashboard</h2>

            <div className="flex gap-2">
                <select
                    value={stackFilter}
                    onChange={e => setStackFilter(e.target.value)}
                    className={`text-sm rounded-lg px-3 py-2 border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                    <option value="All">All Stacks</option>
                    <option value="C#">C#</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="Go">Go</option>
                    <option value="C++">C++</option>
                    <option value="Rust">Rust</option>
                </select>
                <select
                    value={levelFilter}
                    onChange={e => setLevelFilter(e.target.value)}
                    className={`text-sm rounded-lg px-3 py-2 border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                    <option value="All">All Levels</option>
                    <option value="Junior">Junior</option>
                    <option value="Middle">Middle</option>
                    <option value="Senior">Senior</option>
                </select>
            </div>

            {overview && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className={`${card} p-6 rounded-lg text-center`}>
                        <p className="text-4xl font-bold text-blue-400">{overview.totalSubmissions}</p>
                        <p className={`${subText} mt-2`}>Total Submissions</p>
                    </div>
                    <div className={`${card} p-6 rounded-lg text-center`}>
                        <p className="text-4xl font-bold text-purple-400">{overview.uniqueCities}</p>
                        <p className={`${subText} mt-2`}>Unique Cities</p>
                    </div>
                    <div className={`${card} p-6 rounded-lg text-center`}>
                        <p className="text-4xl font-bold text-teal-400">{overview.uniqueStacks}</p>
                        <p className={`${subText} mt-2`}>Unique Stacks</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-6">
                <div className={`${card} p-6 rounded-lg`}>
                    <h3 className="text-lg font-semibold mb-4">Top Cities by Average Salary</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cities}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                            <XAxis dataKey="city" stroke={chartText} />
                            <YAxis stroke={chartText} />
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipText }} />
                            <Bar dataKey="averageSalary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={`${card} p-6 rounded-lg`}>
                    <h3 className="text-lg font-semibold mb-4">Top Stacks Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={stacks} dataKey="sampleSize" nameKey="stack" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
                                {stacks.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipText }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}