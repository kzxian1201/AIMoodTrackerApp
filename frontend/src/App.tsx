import { useState, useEffect } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

interface HabitLog {
  id: string;
  habitName: string;
  completed: boolean;
}

interface DailyEntry {
  id: string;
  entryDate: string;
  journalContent: string;
  moodScore: number;
  aiSummary: string;
  habitLogs: HabitLog[];
}

function App() {
  const [journal, setJournal] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');

  const HABIT_LIST = ['🏃 Run', '💧 Water', '📚 Read', '🧘 Meditate'];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      const sortedData = data.sort((a: DailyEntry, b: DailyEntry) => 
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
      const hasHabit = entry.habitLogs.some(h => h.habitName === habitName);
      if (hasHabit) {
        streak++;
      } else {
        break;
      }
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

  const handleSubmit = async () => {
    if (!journal) return alert("Please write something!");
    
    setLoading(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journal, habits })
      });
      
      if (res.ok) {
        setJournal('');
        setHabits([]);
        fetchHistory();
        setActiveTab('history');
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 18) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 15) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-red-50 text-red-800 border-red-200';
  };

  const chartData = entries.slice(-7).map(entry => ({
    date: entry.entryDate.slice(5),
    score: entry.moodScore
  }));

  const averageMood = entries.length > 0 
    ? (entries.reduce((acc, curr) => acc + curr.moodScore, 0) / entries.length).toFixed(1)
    : "0.0";

  return (
    <div className="h-screen w-full bg-gray-100 font-sans text-gray-900 overflow-hidden flex justify-center">
      
      {/* App Container */}
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col relative">
        
        {/* Header */}
        <header className="flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 pt-8 shadow-lg z-20">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">MoodEcho</h1>
              <p className="text-indigo-100 text-xs opacity-90 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Gemini 2.5 Flash Active</span>
              </p>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div className="text-2xl font-bold">{averageMood}</div>
              <div className="text-[10px] text-indigo-100 uppercase tracking-wider">Avg Mood</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
          <div className="p-4 pb-24 space-y-6">
            
            {activeTab === 'input' ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Journal Input */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <label htmlFor="journal" className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                    <span>✍️</span>
                    <span>How was your day?</span>
                  </label>
                  <textarea 
                    id="journal"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none transition-all text-gray-700 leading-relaxed"
                    placeholder="Today I felt..."
                    value={journal}
                    onChange={e => setJournal(e.target.value)}
                  />
                </div>

                {/* Habits */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 px-1 flex justify-between items-center">
                    <span>Daily Habits</span>
                    <span className="text-xs font-normal text-gray-400">Tap to track</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {HABIT_LIST.map(habit => {
                      const streak = calculateStreak(habit);
                      return (
                        <button
                          key={habit}
                          onClick={() => toggleHabit(habit)}
                          className={`relative p-4 rounded-xl text-left transition-all duration-200 border ${
                            habits.includes(habit) 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="font-bold text-sm">{habit}</div>
                          <div className="text-[10px] mt-1 opacity-80 font-medium">
                            {streak > 0 ? `🔥 ${streak} day streak` : 'Start a streak!'}
                          </div>
                          {habits.includes(habit) && (
                            <div className="absolute top-3 right-3 bg-white/20 rounded-full p-1">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>AI Analyzing...</span>
                    </span>
                  ) : 'Check In'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Chart Section */}
                {entries.length > 1 && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <span>📈</span>
                      <span>Mood Flow</span>
                    </h3>
                    <div className="w-full aspect-[2/1] min-h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 10, fill: '#9ca3af'}} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={10}
                            interval="preserveStartEnd"
                          />
                          <YAxis domain={[0, 10]} hide />
                          <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#4f46e5" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Entries */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-800 px-1">Recent Insights</h2>
                  {[...entries].reverse().map(entry => (
                    <div key={entry.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded-md">
                          {entry.entryDate}
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMoodColor(entry.moodScore)}`}>
                          Mood: {entry.moodScore}/20
                        </span>
                      </div>
                      
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl mb-4 border border-indigo-100/50">
                        <div className="flex gap-2">
                          <span className="text-lg">✨</span>
                          <p className="text-sm text-indigo-900 font-medium leading-relaxed italic">
                            "{entry.aiSummary}"
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 leading-relaxed pl-1">
                        {entry.journalContent}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {entry.habitLogs.length > 0 ? (
                          entry.habitLogs.map(log => (
                            <span key={log.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
                              {log.habitName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">No habits</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <nav className="flex-none bg-white border-t border-gray-200 flex justify-around p-3 pb-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <button 
            onClick={() => setActiveTab('input')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'input' ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'input' ? 'bg-indigo-50' : ''}`}>
              <span className="text-2xl">📝</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide">Journal</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'history' ? 'bg-indigo-50' : ''}`}>
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide">Insights</span>
          </button>
        </nav>

      </div>
    </div>
  );
}

export default App;