import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { LogOut, PenLine, BarChart3, History, Flame, CheckCircle2, Trash2, Edit3, X } from 'lucide-react';

// Custom Hooks
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(() => {
        if (typeof globalThis !== 'undefined') {
            return globalThis.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const media = globalThis.matchMedia(query);
        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
};

// Interfaces
interface HabitLog {
    id: string;
    habitName: string;
    completed: boolean;
}

interface DailyEntry {
    id: number;
    entryDate: string;
    journalContent: string;
    moodScore: number;
    aiSummary: string;
    habitLogs: HabitLog[];
}

interface InputSectionProps {
    journal: string;
    setJournal: (value: string) => void;
    habits: string[];
    toggleHabit: (habit: string) => void;
    calculateStreak: (habit: string) => number;
    handleSubmit: () => void;
    loading: boolean;
    editId: number | null;
    handleCancelEdit: () => void;
}

interface HistorySectionProps {
    entries: DailyEntry[];
    chartData: { date: string; score: number }[];
    handleDelete: (id: number) => void;
    handleEdit: (entry: DailyEntry) => void;
}

// Sub-Components
const HABIT_LIST = ['🏃 Run', '💧 Water', '📚 Read', '🧘 Meditate'];

const getMoodColor = (score: number) => {
    if (score >= 8)
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 5)
        return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
};

const InputSection = ({
    journal, setJournal, habits, toggleHabit, calculateStreak, handleSubmit, loading, editId, handleCancelEdit
    }: InputSectionProps) => {
    
    let buttonClass = "w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all active:scale-95 ";
    let buttonText = "Check In";

    if (loading) {
        buttonClass += "bg-gray-400 cursor-not-allowed";
        buttonText = "AI Analyzing...";
    } else if (editId) {
        buttonClass += "bg-amber-600 hover:bg-amber-700 shadow-amber-200";
        buttonText = "Update Entry";
    } else {
        buttonClass += "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:-translate-y-0.5 shadow-indigo-200";
    }

    return (
        <div className="space-y-6 h-full">
        <div className={`p-6 rounded-2xl shadow-sm border transition-all ${editId ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
            <label htmlFor="journal" className={`text-lg font-bold flex items-center gap-2 ${editId ? 'text-amber-800' : 'text-gray-800'}`}>
                <PenLine className="w-5 h-5" />
                <span>{editId ? 'Editing Entry...' : 'How was your day?'}</span>
            </label>
            {editId && (
                <button onClick={handleCancelEdit} className="text-xs flex items-center gap-1 text-amber-700 hover:underline">
                <X size={14} /> Cancel
                </button>
            )}
            </div>
            <textarea
                id="journal"
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none transition-all text-gray-700 placeholder-gray-400"
                placeholder={editId ? "Update your thoughts..." : "I felt productive today because..."}
                value={journal}
                onChange={e => setJournal(e.target.value)}
            />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            <span>Daily Habits</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
            {HABIT_LIST.map(habit => {
                const streak = calculateStreak(habit);
                const isSelected = habits.includes(habit);
                return (
                    <button
                        key={habit}
                        onClick={() => toggleHabit(habit)}
                        className={`relative p-3 rounded-xl text-left transition-all duration-200 border ${
                        isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-white'
                        }`}
                    >
                        <div className="font-bold text-sm">{habit}</div>
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                        <Flame size={10} />
                        <span>{streak} day streak</span>
                        </div>
                    </button>
                );
            })}
            </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className={buttonClass}>
            {buttonText}
        </button>
        </div>
    );
};

const HistorySection = ({ entries, chartData, handleDelete, handleEdit }: HistorySectionProps) => {
    // force a small delay to ensure the DOM wrapper has fully calculated its dimensions
    const [isChartReady, setIsChartReady] = useState(false);

    useEffect(() => {
        // use setTimeout to delay chart rendering to ensure the DOM wrapper has fully calculated its dimensions
        const timer = setTimeout(() => {
            setIsChartReady(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6 h-full">
        {entries.length > 1 ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <span>Mood Flow</span>
            </h3>
            
            {/* Explicit inline style for width/height prevents the calculation error */}
            <div className="w-full h-64 min-w-0" style={{ width: '100%', height: '250px' }}>
                {isChartReady && chartData && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                </ResponsiveContainer>
                )}
            </div>
            </div>
        ) : (
            <div className="bg-indigo-50 p-8 rounded-2xl text-center border border-indigo-100">
            <p className="text-indigo-600 font-medium">Add a few entries to unlock your mood chart!</p>
            </div>
        )}

        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <span>Recent Insights</span>
            </h3>
            {[...entries].reverse().map(entry => (
            <div key={entry.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
                <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleEdit(entry)} className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-all" title="Edit Entry">
                    <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(entry.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Delete Entry">
                    <Trash2 size={16} />
                </button>
                </div>
                <div className="flex justify-between items-center mb-4 pr-16">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-3 py-1 rounded-full">
                    {entry.entryDate}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMoodColor(entry.moodScore)}`}>
                    Mood: {entry.moodScore}/10
                </span>
                </div>
                {entry.aiSummary && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl mb-4 border border-indigo-100/50 group-hover:border-indigo-200 transition-colors">
                    <div className="flex gap-3">
                    <span className="text-xl">✨</span>
                    <p className="text-sm text-indigo-900 font-medium leading-relaxed italic">"{entry.aiSummary}"</p>
                    </div>
                </div>
                )}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed pl-1">{entry.journalContent}</p>
                {entry.habitLogs?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                    {entry.habitLogs.map(log => (
                        <span key={log.id} className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-gray-200">{log.habitName}</span>
                    ))}
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
};

// Main Component
const Dashboard = () => {
    const [journal, setJournal] = useState('');
    const [habits, setHabits] = useState<string[]>([]);
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');
    const [editId, setEditId] = useState<number | null>(null);
    
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/entries');
            const sortedData = res.data.sort((a: DailyEntry, b: DailyEntry) =>
                new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
            );
            setEntries(sortedData);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const calculateStreak = (habitName: string) => {
        let streak = 0;
        for (let i = entries.length - 1; i >= 0; i--) {
            const entry = entries[i];
            const hasHabit = entry.habitLogs?.some(h => h.habitName === habitName);
            if (hasHabit)
                streak++;
            else
                break;
        }
        return streak;
    };

    const toggleHabit = (habit: string) => {
        if (habits.includes(habit)) {
            setHabits(habits.filter(h => h !== habit));
        } else {
            setHabits([...habits, habit]);
        }
    };

    const handleDelete = async (id: number) => {
        if (!globalThis.confirm("Are you sure you want to delete this entry?")) return;
        
        try {
            await api.delete(`/entries/${id}`);
            setEntries(prev => prev.filter(e => e.id !== id));
            if (editId === id)
                handleCancelEdit();
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Failed to delete entry");
        }
    };

    const handleEdit = (entry: DailyEntry) => {
        setJournal(entry.journalContent);

        const existingHabits = entry.habitLogs?.map(h => h.habitName) || [];
        
        setHabits(existingHabits);
        setEditId(entry.id);
        setActiveTab('input');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setJournal('');
        setHabits([]);
        setEditId(null);
    };

    const handleSubmit = async () => {
        if (!journal.trim())
            return alert("Please write something!");
        
        setLoading(true);
        
        try {
            if (editId) {
                await api.put(`/entries/${editId}`, { journal, habits });
            } else {
                await api.post('/entries', { journal, habits });
            }

            handleCancelEdit();
            fetchHistory();
            setActiveTab('history');
        } catch (error) {
            console.error("Error saving entry:", error);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const chartData = entries.slice(-7).map(entry => ({
        date: entry.entryDate.slice(5),
        score: entry.moodScore
    }));

    const averageMood = entries.length > 0
        ? (entries.reduce((acc, curr) => acc + curr.moodScore, 0) / entries.length).toFixed(1)
        : "0.0";

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">MoodEcho</h1>
                    <p className="text-indigo-500 text-[10px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Gemini AI Active</span>
                    </p>
                </div>
                </div>
                <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <div className="text-sm font-bold text-gray-900">{averageMood} / 10</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Mood</div>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Logout">
                    <LogOut size={20} />
                </button>
                </div>
            </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isDesktop ? (
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-4">
                <InputSection
                    journal={journal} setJournal={setJournal} habits={habits} toggleHabit={toggleHabit}
                    calculateStreak={calculateStreak} handleSubmit={handleSubmit} loading={loading}
                    editId={editId} handleCancelEdit={handleCancelEdit}
                />
                </div>
                <div className="col-span-8">
                <HistorySection
                    entries={entries} chartData={chartData} handleDelete={handleDelete} handleEdit={handleEdit}
                />
                </div>
            </div>
            ) : (
            <div className="pb-20">
                {activeTab === 'input' ? (
                <InputSection
                    journal={journal} setJournal={setJournal} habits={habits} toggleHabit={toggleHabit}
                    calculateStreak={calculateStreak} handleSubmit={handleSubmit} loading={loading}
                    editId={editId} handleCancelEdit={handleCancelEdit}
                />
                ) : (
                <HistorySection
                    entries={entries} chartData={chartData} handleDelete={handleDelete} handleEdit={handleEdit}
                />
                )}
            </div>
            )}
        </main>

        {!isDesktop && (
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <button onClick={() => setActiveTab('input')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'input' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <PenLine size={24} strokeWidth={activeTab === 'input' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Journal</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <BarChart3 size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Insights</span>
            </button>
            </nav>
        )}
        </div>
    );
};

export default Dashboard;