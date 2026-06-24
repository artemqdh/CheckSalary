import { useState } from 'react';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';

function App()
{
    const [tab, setTab] = useState<'home' | 'submit' | 'search' | 'dashboard'>('home');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const isDark = theme === 'dark';

    const bg = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const text = isDark ? 'text-white' : 'text-gray-900';
    const headerBg = isDark ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-gray-200';

    return (
        <div className={`min-h-screen flex flex-col ${bg} ${text}`}>
            <header className={`sticky top-0 z-50 border-b backdrop-blur-sm ${headerBg}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => setTab('home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">💰</span>
                        <span className="text-xl font-bold">CheckSalary</span>
                    </button>
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

            <div className="max-w-6xl mx-auto px-4 py-8 flex-grow">
                {tab === 'home' && <Home isDark={isDark} onNavigate={setTab} />}
                {tab === 'submit' && <Submit isDark={isDark} />}
                {tab === 'search' && <Search isDark={isDark} />}
                {tab === 'dashboard' && (
                    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
                        <div className="max-w-7xl mx-auto px-4">
                            <Dashboard isDark={isDark} />
                        </div>
                    </div>
                )}
            </div>

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