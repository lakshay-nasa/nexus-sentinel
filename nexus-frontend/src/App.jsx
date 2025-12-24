import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Search, 
  Database, 
  ExternalLink, 
  BookOpen, 
  Download, 
  Cloud, 
  PlayCircle,
  Wifi,
  WifiOff,
  RefreshCcw
} from 'lucide-react';
import axios from 'axios';

function App() {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isDataHubOnline, setIsDataHubOnline] = useState(null);

  // --- SMART STATUS CHECK ---
  // This pings the local DataHub port to see if the environment is ready
  const checkDataHubStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/health/datahub');
      setIsDataHubOnline(response.data.online);
    } catch (err) {
      setIsDataHubOnline(false);
    }
  };

  useEffect(() => {
    checkDataHubStatus();
    // Re-check status every 30 seconds
    const interval = setInterval(checkDataHubStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setShowSetupGuide(false);

    try {
      // Connects to your local FastAPI backend
      const response = await axios.get(`http://127.0.0.1:8000/sync/${ticker}`);
      setResult(response.data);
    } catch (err) {
      // If backend fails, we proactively help the user
      setError("Local Connection Refused");
      setShowSetupGuide(true);
      setResult(null);
      checkDataHubStatus(); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a101f] text-white font-sans p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* --- SMART HEADER SECTION --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Database size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Nexus Sentinel</h1>
              <p className="text-slate-400 text-sm italic">AI Data Governance Gateway</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={checkDataHubStatus}
                className="p-2 text-slate-500 hover:text-white transition-colors"
                title="Refresh Environment Status"
              >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <a 
                href="http://localhost:9002" 
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => {
                  if (isDataHubOnline === false) {
                    e.preventDefault();
                    setShowSetupGuide(true);
                    setError("Local DataHub Instance Not Found");
                  }
                }}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all border ${
                  isDataHubOnline === false 
                  ? "bg-red-500/10 border-red-500/50 text-red-400" 
                  : isDataHubOnline === true
                  ? "bg-green-500/10 border-green-500/50 text-green-400"
                  : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {isDataHubOnline === false ? <WifiOff size={14}/> : <Wifi size={14} />}
                {isDataHubOnline === false ? "DataHub Offline" : isDataHubOnline === true ? "DataHub Online" : "Checking DataHub..."}
                <ExternalLink size={12} className="ml-1 opacity-50" />
              </a>
            </div>
          </div>
        </header>

        {/* --- MAIN GOVERNANCE INTERFACE --- */}
        <main className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="mb-8">
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Inspect Market Asset Quality</label>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Enter Ticker (e.g., TSLA, BTC-USD)" 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSync()}
              />
              <button 
                onClick={handleSync}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                {loading ? "Analyzing..." : <><Search size={22}/> Run Governance Check</>}
              </button>
            </div>
            {error && (
              <p className="mt-4 text-red-400 text-sm font-medium flex items-center gap-2">
                <ShieldAlert size={16} /> {error}. Check the Setup Guide below.
              </p>
            )}
          </div>

          {/* --- RESULTS DISPLAY --- */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in">
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Activity size={12}/> Live Market Feed
                </h3>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="text-slate-400 text-sm font-medium">{result.market_data.ticker} / USD</div>
                    <div className="text-4xl font-black tracking-tighter">${result.market_data.price}</div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full border ${result.market_data.volatility > 2.5 ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
                    {result.market_data.volatility}% Vol
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-500 ${result.market_data.is_trustworthy ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"}`}>
                {result.market_data.is_trustworthy ? (
                  <ShieldCheck size={56} className="text-green-500 mb-3 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"/>
                ) : (
                  <ShieldAlert size={56} className="text-red-500 mb-3 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"/>
                )}
                <div className="text-2xl font-black uppercase tracking-tight">
                  {result.governance_tag.split(':').pop()}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Metadata Tag Applied to DataHub
                </div>
              </div>
            </div>
          )}

          {/* --- USER ONBOARDING GUIDE --- */}
          {showSetupGuide && (
            <div className="mt-8 p-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl animate-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><BookOpen size={20}/></div>
                <h3 className="text-blue-400 font-bold text-lg">Project Setup Guide</h3>
              </div>
              
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Nexus Sentinel is a full-stack governance gateway. To see it communicate with **DataHub** in real-time, your local environment must be active.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <a 
                  href="https://datahubproject.io/docs/quickstart" 
                  target="_blank" 
                  className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all group shadow-xl"
                >
                  <Download className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
                  <div className="font-bold text-sm">1. Deploy DataHub</div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">datahub docker quickstart</div>
                </a>

                <a 
                  href="https://datahub.com/products/why-datahub-cloud/" 
                  target="_blank" 
                  className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-purple-500 transition-all group shadow-xl"
                >
                  <Cloud className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
                  <div className="font-bold text-sm">2. DataHub Cloud</div>
                  <div className="text-xs text-slate-500 mt-2">Enterprise Metadata SaaS</div>
                </a>
              </div>

              {/* <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                <p className="text-xs text-slate-500 font-semibold mb-4 uppercase tracking-widest text-center">No environment? Watch the system in action:</p>
                <a 
                  href="https://www.youtube.com/"
                  target="_blank"
                  className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-400 transition-colors group shadow-lg"
                >
                  <PlayCircle size={20} className="group-hover:scale-110 transition-transform" /> 
                  Watch Demo Video
                </a>
              </div> */}
            </div>
          )}
        </main>

        {/* --- PROFESSIONAL FOOTER --- */}
        <footer className="mt-16 flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-700">
            <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
              <div className={`w-2 h-2 rounded-full ${isDataHubOnline ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500"}`}></div> DataHub GMS 
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> FastAPI Emitter
            </span>
          </div>
          <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.5em] text-center px-4 leading-loose">
            Nexus Sentinel • Metadata Governance Gateway • Built by Lakshay Nasa
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;