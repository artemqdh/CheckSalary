interface Props {
    isDark: boolean;
    onNavigate: (tab: 'submit' | 'search' | 'dashboard') => void;
}

export default function Home({ isDark, onNavigate }: Props)
{
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';
    const card = isDark ? 'bg-gray-800 border border-gray-700/50' : 'bg-white border border-gray-200 shadow-sm';

    return (
        <div className="max-w-4xl mx-auto text-center py-12">
            <div className="mb-8">
                <span className="text-6xl">💰</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
                Welcome to <span className="text-blue-400">CheckSalary</span>
            </h1>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${subText}`}>
                Anonymous salary comparison platform for developers. Submit your salary, search by city and tech stack, and explore data on an interactive map.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                {[
                    { icon: '📝', title: 'Submit', desc: 'Share your salary anonymously with AI-powered stack normalization', tab: 'submit' as const },
                    { icon: '🔍', title: 'Search', desc: 'Find salaries by radius — "C# within 50km of Berlin"', tab: 'search' as const },
                    { icon: '📊', title: 'Dashboard', desc: 'Explore trends with interactive charts and statistics', tab: 'dashboard' as const },
                ].map(f => (
                    <button
                        key={f.tab}
                        onClick={() => onNavigate(f.tab)}
                        className={`${card} p-6 rounded-xl text-left hover:scale-[1.02] transition-all duration-200`}
                    >
                        <div className="text-3xl mb-3">{f.icon}</div>
                        <h3 className="font-semibold mb-1">{f.title}</h3>
                        <p className={`text-sm ${subText}`}>{f.desc}</p>
                    </button>
                ))}
            </div>

            <div className={`text-sm ${subText}`}>
                <p>Your data is anonymous. No email, no registration.</p>
            </div>
        </div>
    );
}