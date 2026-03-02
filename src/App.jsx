import React, { useState, useEffect, Component, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ComposedChart, Bar
} from 'recharts';
import { 
  Pill, Moon, Sun, Home, Activity, Calendar, Database,
  AlertCircle, Plus, Minus, X, Check, Zap,
  TrendingUp, Clock, FileText, User, Edit3, CloudSun, Trash2, Share2
} from 'lucide-react';

// --- 1. 錯誤邊界元件 ---
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("App Crash Log:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center h-screen flex flex-col items-center justify-center bg-slate-50">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <h2 className="text-lg font-black text-slate-800 mb-2">分頁載入失敗</h2>
          <p className="text-sm text-slate-400 mb-6">您的資料格式可能與新版本不相容</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold">清除損壞資料並重新啟動</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 2. 常數與工具 ---
const DEFAULT_MEDS = [
  {
    id: 'm1', name: '鋰鹽（Lithium）', dose: '300mg', manufacturer: '優良化學',
    category: '情緒穩定劑', status: 'active',
    mySideEffects: '血清濃度夠的時候手會微抖，但情緒最穩。',
    trendData: [{ date: '02／20', total: 4.0, by: 'doctor', reason: '初始' }]
  }
];

const WEATHER_OPTIONS = ['大太陽', '晴朗', '陰晴不定', '陰天', '微雨', '下雨', '其他'];
const MOOD_TAGS = ['平靜', '憂鬱', '焦慮', '煩躁', '愉快', '躁動', '疲憊', '失眠', '食慾不振'];

const getTodayKey = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}／${String(d.getDate()).padStart(2, '0')}`;
};

const getTodayFullStr = () => {
  const d = new Date();
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
  return `${d.getMonth() + 1} ／ ${d.getDate()} (${week})`;
};

const safeParseDate = (str) => {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.replace(/\//g, '／').split('／');
  if (parts.length < 2) return 0;
  return Number(parts[0]) * 100 + Number(parts[1]);
};

// --- 3. UI 元件 ---
const SidebarItem = ({ icon: Icon, label, active, onClick, color = "text-slate-900" }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : `hover:bg-slate-50 text-slate-400 ${color}`}`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="font-black text-sm">{label}</span>
  </button>
);

const TimelineCard = ({ title, icon: Icon, color, activeBg, data, onAction }) => {
  const isDone = !!data;
  const displayTime = (typeof data === 'object' && data !== null) ? data.time : data;
  return (
    <div onClick={onAction} className={`relative p-4 rounded-3xl transition-all border-2 cursor-pointer ${isDone ? `${activeBg} border-transparent shadow-sm` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      {isDone && <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-${color}-500`}></div>}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${isDone ? `bg-white text-${color}-600` : 'bg-slate-50 text-slate-400'}`}><Icon size={24} /></div>
        <div className="flex-1">
          <div className="flex justify-between items-center"><span className={`font-bold ${isDone ? `text-${color}-900` : 'text-slate-500'}`}>{title}</span>{isDone && <span className="text-sm font-black text-slate-400">{displayTime || '--:--'} <Edit3 size={12} className="inline ml-1 opacity-40"/></span>}</div>
          {isDone && typeof data === 'object' && data?.items && (
            <div className={`mt-2 space-y-1 bg-white/50 p-2 rounded-xl text-sm font-bold text-slate-600`}>
              {(data.items || []).filter(Boolean).map((item, idx) => (<div key={idx} className="flex justify-between"><span>{item?.name}</span><span>{item?.dose} 顆</span></div>))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MedCard = ({ med, onEdit, onDelete }) => (
  <div className={`p-6 rounded-[32px] border shadow-sm bg-white border-slate-100 ${med?.status === 'archived' ? 'grayscale opacity-70' : ''}`}>
    <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex gap-2 mb-1"><span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded font-black uppercase">{med?.manufacturer || '一般'}</span><span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded font-black uppercase">{med?.category || '藥物'}</span></div>
          <h3 className="text-xl font-black text-slate-800">{String(med?.name || "").split('（')[0]} <span className="text-sm text-slate-300 font-bold ml-1">{med?.dose}</span></h3>
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-rose-200 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-slate-200 hover:text-indigo-500 transition-colors"><Edit3 size={18} /></button>
        </div>
    </div>
    <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50/50 mb-3 font-medium text-indigo-900 italic text-sm">{med?.mySideEffects || '尚無筆記'}</div>
  </div>
);

// --- 4. 主程式 ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  // 核心資料庫初始化
  const [medsDB, setMedsDB] = useState(() => {
    try {
      const s = localStorage.getItem('psych_meds');
      const parsed = s ? JSON.parse(s) : DEFAULT_MEDS;
      return Array.isArray(parsed) ? parsed.filter(m => m && typeof m === 'object' && m.id) : DEFAULT_MEDS;
    } catch(e) { return DEFAULT_MEDS; }
  });

  const [historyDB, setHistoryDB] = useState(() => {
    try {
      const s = localStorage.getItem('psych_history');
      const parsed = s ? JSON.parse(s) : [];
      return Array.isArray(parsed) ? parsed.filter(h => h && h.date).map(h => ({ 
        ...h, 
        moodTags: Array.isArray(h.moodTags) ? h.moodTags : [],
        events: Array.isArray(h.events) ? h.events : [] 
      })) : [];
    } catch(e) { return []; }
  });

  const [todayRecord, setTodayRecord] = useState(() => {
    const todayKey = getTodayKey();
    const found = historyDB.find(h => h && h.date === todayKey);
    return found || { date: todayKey, weekday: ['日','一','二','三','四','五','六'][new Date().getDay()], wake: null, bed: null, weather: '晴朗', mood: 5, moodTags: [], events: [], diary: '' };
  });

  useEffect(() => { localStorage.setItem('psych_meds', JSON.stringify(medsDB)); }, [medsDB]);
  
  useEffect(() => {
    const newHist = [...historyDB];
    const idx = newHist.findIndex(h => h && h.date === todayRecord.date);
    if (idx > -1) newHist[idx] = todayRecord; else newHist.unshift(todayRecord);
    const sorted = newHist.sort((a,b) => safeParseDate(b.date) - safeParseDate(a.date));
    setHistoryDB(sorted);
    localStorage.setItem('psych_history', JSON.stringify(sorted));
  }, [todayRecord]);

  // Modals
  const [medModal, setMedModal] = useState({ show: false, slotKey: '', slotLabel: '' });
  const [timeModal, setTimeModal] = useState({ show: false, slotKey: '', title: '', time: '' });
  const [dbModal, setDbModal] = useState({ show: false, isNew: false, data: {} });
  const [dayEditor, setDayEditor] = useState({ show: false, data: null });
  const [trendModal, setTrendModal] = useState({ show: false, date: '', dose: '', by: 'doctor', reason: '' });
  const [modalTime, setModalTime] = useState('');
  const [modalDoses, setModalDoses] = useState({});
  const [selectedTrendMedId, setSelectedTrendMedId] = useState(medsDB[0]?.id || '');

  // 趨勢圖數據預處理
  const trendChartData = useMemo(() => {
    if (!medsDB.length) return [];
    const med = medsDB.find(m => m.id === selectedTrendMedId) || medsDB[0];
    const medName = String(med?.name || "").split('（')[0];
    return [...historyDB].reverse().map(h => {
      const dayDose = (h.events || []).reduce((s, e) => s + ((e.items || []).find(i => i.name === medName)?.dose || 0), 0);
      return { date: h.date, mood: h.mood || 5, total: dayDose };
    });
  }, [historyDB, medsDB, selectedTrendMedId]);

  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <div className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col p-6 z-40 shrink-0">
          <div className="mb-10 px-2">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Pill className="text-indigo-600" size={24} /> PsychMedMVP
            </h1>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Clinic Ready System</p>
          </div>
          
          <nav className="flex-1 space-y-2">
            <SidebarItem icon={Home} label="每天記錄" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <SidebarItem icon={TrendingUp} label="用藥劑量" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} color="text-emerald-500" />
            <SidebarItem icon={Calendar} label="回診手冊" active={activeTab === 'history'} onClick={() => setActiveTab('history')} color="text-indigo-600" />
            <SidebarItem icon={Database} label="藥藥寶典" active={activeTab === 'database'} onClick={() => setActiveTab('database')} color="text-amber-600" />
          </nav>

          <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 mb-1">穩定度分析</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[85%]"></div>
              </div>
              <span className="text-[10px] font-black text-slate-600">85%</span>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-[1000px] mx-auto w-full">
              
              {/* HOME TAB */}
              {activeTab === 'home' && (
                <div className="p-4 md:p-8 flex flex-col animate-in fade-in pb-32 md:pb-8">
                  <div className="flex justify-between items-start mb-8 px-2 shrink-0">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">{getTodayFullStr()}</h1>
                      <p className="text-xs md:text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">妳每天都很棒棒棒！加油！</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl px-3 py-2 shadow-sm flex items-center gap-2">
                      <CloudSun size={18} className="text-slate-400" />
                      <select 
                        value={todayRecord.weather} 
                        onChange={e => setTodayRecord({...todayRecord, weather: e.target.value})} 
                        className="text-xs md:text-sm font-black text-slate-600 outline-none bg-transparent"
                      >
                        {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 space-y-4 relative">
                      <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-slate-100 -z-10"></div>
                      <TimelineCard title="起床" icon={Sun} color="amber" activeBg="bg-amber-50" data={todayRecord.wake} onAction={() => { if(todayRecord.wake) setTimeModal({show:true, slotKey:'wake', title:'起床', time:todayRecord.wake}); else setTodayRecord({...todayRecord, wake: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}); }} />
                      <TimelineCard title="用藥一" icon={Pill} color="emerald" activeBg="bg-emerald-50" data={(todayRecord.events || []).find(e => e.label === '用藥一')} onAction={() => { const ex = (todayRecord.events || []).find(e => e.label === '用藥一'); setMedModal({show: true, slotKey:'med1', slotLabel:'用藥一'}); setModalTime(ex?.time || todayRecord.wake || '08:30'); const ds = {}; (ex?.items || []).forEach(i=>{ const m=medsDB.find(md=>md.name.includes(i.name)); if(m) ds[m.id]=i.dose; }); setModalDoses(ds); }} />
                      <TimelineCard title="用藥二" icon={Pill} color="emerald" activeBg="bg-emerald-50" data={(todayRecord.events || []).find(e => e.label === '用藥二')} onAction={() => { const ex = (todayRecord.events || []).find(e => e.label === '用藥二'); setMedModal({show: true, slotKey:'med2', slotLabel:'用藥二'}); setModalTime(ex?.time || '22:00'); const ds = {}; (ex?.items || []).forEach(i=>{ const m=medsDB.find(md=>md.name.includes(i.name)); if(m) ds[m.id]=i.dose; }); setModalDoses(ds); }} />
                      <TimelineCard title="就寢" icon={Moon} color="indigo" activeBg="bg-indigo-50" data={todayRecord.bed} onAction={() => { if(todayRecord.bed) setTimeModal({show:true, slotKey:'bed', title:'就寢', time:todayRecord.bed}); else setTodayRecord({...todayRecord, bed: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}); }} />
                      <div className="pt-2">
                        <TimelineCard title="必要時用藥" icon={Zap} color="rose" activeBg="bg-rose-50" data={(todayRecord.events || []).find(e => e.label === '必要時用藥')} onAction={() => { const ex = (todayRecord.events || []).find(e => e.label === '必要時用藥'); setMedModal({show: true, slotKey:'prn', slotLabel:'必要時用藥'}); setModalTime(ex?.time || new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})); const ds = {}; (ex?.items || []).forEach(i=>{ const m=medsDB.find(md=>md.name.includes(i.name)); if(m) ds[m.id]=i.dose; }); setModalDoses(ds); }} />
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Activity size={20} className="text-indigo-500"/> 情緒與狀態</h2>
                          <div className="flex gap-2 items-center">
                            <span className={`text-[11px] font-black px-3 py-1 rounded-xl bg-slate-50 text-slate-400`}>{ (todayRecord.moodTags || []).length > 0 ? todayRecord.moodTags.join('/') : '平常' }</span>
                            <span className="text-2xl font-black text-indigo-600">{todayRecord.mood || 5}</span>
                          </div>
                        </div>
                        <input type="range" min="1" max="10" value={todayRecord.mood || 5} onChange={e => setTodayRecord({...todayRecord, mood: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-8" />
                        <div className="flex flex-wrap gap-2.5">
                          {MOOD_TAGS.map(tag => (
                            <button key={tag} onClick={() => { 
                              const cur = todayRecord.moodTags || []; 
                              const nxt = cur.includes(tag) ? cur.filter(t=>t!==tag) : [...cur, tag]; 
                              setTodayRecord({...todayRecord, moodTags: nxt}); 
                            }} className={`text-[11px] font-bold px-4 py-2 rounded-2xl border transition-all ${todayRecord.moodTags?.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-slate-400"/> 今日心得</h2>
                        <textarea value={todayRecord.diary || ''} onChange={e => setTodayRecord({...todayRecord, diary: e.target.value})} placeholder="今天發生了什麼特別的事嗎？" className="w-full h-40 bg-slate-50 rounded-[28px] p-6 text-sm md:text-base outline-none resize-none border-none leading-relaxed" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ANALYSIS TAB */}
              {activeTab === 'analysis' && (
                <div className="p-4 md:p-8 flex flex-col h-full animate-in fade-in pb-32 md:pb-8">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-800 px-2 pt-2">用藥劑量</h1>
                  {medsDB.length === 0 ? <div className="p-10 text-center text-slate-400 font-bold">請先新增藥物。</div> : (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">切換藥物檢視</p>
                        <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                          {medsDB.map(m => (
                            <button key={m.id} onClick={() => setSelectedTrendMedId(m.id)} className={`px-6 py-4 rounded-[24px] text-sm font-black whitespace-nowrap border transition-all text-left flex justify-between items-center ${selectedTrendMedId === m.id ? 'bg-slate-800 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-400 hover:border-slate-300'}`}>
                              <span>{String(m.name || "藥物").split('（')[0]}</span>
                              {selectedTrendMedId === m.id && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm h-[400px] md:h-[500px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={trendChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} />
                                <YAxis yAxisId="left" domain={[0, 10]} hide />
                                <YAxis yAxisId="right" hide />
                                <RechartsTooltip contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar yAxisId="right" dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} opacity={0.4} />
                                <Line yAxisId="left" type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={5} dot={{r:6, fill:'#6366f1', strokeWidth:3, stroke:'#fff'}} activeDot={{r:8}} />
                              </ComposedChart>
                           </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <div className="p-4 md:p-8 flex flex-col h-full animate-in fade-in pb-32 md:pb-8">
                   <div className="flex justify-between items-center mb-10 px-2 pt-2 shrink-0">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">回診手冊</h1>
                        <p className="text-xs md:text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Past Clinical Records</p>
                      </div>
                      <button onClick={() => { 
                        const recent = historyDB.slice(0, 7).reverse(); let t = `🏥 【PsychMedMVP 回診紀錄】\n`; 
                        recent.forEach(day => { t += `--------------------\n📅 ${day.date} | 情緒: ${day.mood || 5}\n`; });
                        navigator.clipboard.writeText(t); alert('已複製 7 天紀錄！'); 
                      }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <Share2 size={18} /> 匯出紀錄
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {historyDB.map((day, idx) => (
                       <div key={idx} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 shrink-0 flex flex-col">
                         <div className="flex justify-between items-center mb-6">
                           <h2 className="text-2xl font-black text-slate-800">{day.date} <span className="text-base text-slate-300 ml-1">({day.weekday})</span></h2>
                           <button onClick={() => setDayEditor({show: true, data: day})} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-300 shadow-sm hover:text-indigo-500 transition-all"><Edit3 size={20}/></button>
                         </div>
                         <div className="bg-amber-50/30 p-6 rounded-[28px] border border-amber-50/50 mb-6 text-sm font-bold text-slate-700 leading-relaxed italic">{day.diary || '這天沒有任何筆記...'}</div>
                         <div className="relative pl-6 space-y-6 mt-auto">
                            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                            {day.wake && <div className="relative flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm -ml-[11px] z-10"></div><span className="text-base font-black text-slate-700">{day.wake} 起床</span></div>}
                            {day.bed && <div className="relative flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-indigo-400 border-2 border-white shadow-sm -ml-[11px] z-10"></div><span className="text-base font-black text-slate-700">{day.bed} 就寢</span></div>}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* DATABASE TAB */}
              {activeTab === 'database' && (
                <div className="p-4 md:p-8 flex flex-col h-full animate-in fade-in pb-32 md:pb-8">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 px-2 pt-2 tracking-tight">藥藥寶典</h1>
                  <p className="text-xs md:text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest mb-10 px-2">Manage Your Medical Database</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button onClick={() => setDbModal({show: true, isNew: true, data: { status:'active' }})} className="h-full min-h-[160px] py-6 border-2 border-dashed border-slate-200 rounded-[40px] text-slate-400 font-black text-lg flex items-center justify-center gap-3 hover:bg-white hover:border-indigo-200 transition-all">
                      <Plus size={32}/> 新增藥款
                    </button>
                    {medsDB.map(m => (<MedCard key={m.id} med={m} onEdit={() => setDbModal({show: true, isNew: false, data: m})} onDelete={() => { if(confirm('確定刪除？')) setMedsDB(medsDB.filter(x=>x?.id!==m.id)); }} />))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* MOBILE BOTTOM NAV */}
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-8 pt-4 pb-10 flex justify-between items-center z-40 shrink-0">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'home' ? 'text-slate-900' : 'text-slate-300'}`}><Home size={28} /><span className="text-[10px] font-black uppercase">每天記錄</span></button>
            <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'analysis' ? 'text-emerald-500' : 'text-slate-300'}`}><TrendingUp size={28} /><span className="text-[10px] font-black uppercase">用藥劑量</span></button>
            <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-300'}`}><Calendar size={28} /><span className="text-[10px] font-black uppercase">回診手冊</span></button>
            <button onClick={() => setActiveTab('database')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'database' ? 'text-amber-600' : 'text-slate-300'}`}><Database size={28} /><span className="text-[10px] font-black uppercase">藥藥寶典</span></button>
          </div>
        </div>

        {/* MODALS */}
        {timeModal.show && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <h2 className="text-2xl font-black text-slate-800 mb-8">{timeModal.title}時間編輯</h2>
              <input type="time" value={timeModal.time} onChange={e => setTimeModal({...timeModal, time: e.target.value})} className="w-full bg-slate-50 p-6 rounded-[24px] text-3xl font-black text-center mb-10 outline-none" />
              <button onClick={() => { setTodayRecord({...todayRecord, [timeModal.slotKey]: timeModal.time}); setTimeModal({show: false}); }} className="w-full py-5 bg-slate-800 text-white rounded-[28px] font-black text-xl shadow-xl">確認儲存</button>
            </div>
          </div>
        )}

        {medModal.show && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black">{medModal.slotLabel}編輯</h2><button onClick={() => setMedModal({show: false})} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={24}/></button></div>
              <div className="space-y-6 mb-10">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-300 uppercase block mb-2">服藥時間</label>
                  <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {medsDB.filter(m => m && m.status !== 'archived').map(m => {
                    const dose = modalDoses[m.id] || 0;
                    return (
                      <div key={m.id} className={`flex justify-between items-center p-5 border-2 rounded-[28px] transition-all ${dose > 0 ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                        <div><span className="font-bold text-slate-700">{String(m.name || "").split('（')[0]}</span><p className="text-[10px] font-black text-slate-400 uppercase">{m.dose}</p></div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setModalDoses({...modalDoses, [m.id]: Math.max(0, dose - 0.25)})} className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-500 active:scale-90 transition"><Minus size={18}/></button>
                          <span className="w-6 text-center font-black text-lg text-slate-800">{dose}</span>
                          <button onClick={() => setModalDoses({...modalDoses, [m.id]: dose + 0.25})} className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center active:scale-90 transition shadow-lg"><Plus size={18}/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => {
                const items = Object.entries(modalDoses).filter(([_, d]) => d > 0).map(([id, d]) => ({ name: String(medsDB.find(m => m.id === id)?.name || "").split('（')[0], dose: d }));
                const newEvents = [...(todayRecord.events || []).filter(e => e && e.label !== medModal.slotLabel)];
                if (items.length > 0) newEvents.push({ label: medModal.slotLabel, time: modalTime, items });
                setTodayRecord({...todayRecord, events: newEvents});
                setMedModal({show: false});
              }} className="w-full py-5 bg-slate-800 text-white rounded-[28px] font-black text-xl shadow-2xl active:scale-95 transition-all">確認紀錄</button>
            </div>
          </div>
        )}

        {dbModal.show && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-black text-slate-800 mb-8">{dbModal.isNew ? '新增藥物' : '編輯藥物'}</h2>
              <div className="space-y-5 mb-8">
                <input type="text" placeholder="藥物名稱" value={dbModal.data?.name || ''} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, name: e.target.value}})} className="w-full bg-slate-50 p-5 rounded-[24px] font-bold border-none outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="劑量" value={dbModal.data?.dose || ''} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, dose: e.target.value}})} className="bg-slate-50 p-5 rounded-[24px] font-bold border-none outline-none" />
                  <select value={dbModal.data?.status || 'active'} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, status: e.target.value}})} className="bg-slate-50 p-5 rounded-[24px] font-bold border-none outline-none">
                    <option value="active">服役中</option><option value="prn">必要時用</option><option value="archived">冷宮</option>
                  </select>
                </div>
                <textarea placeholder="我的副作用筆記" value={dbModal.data?.mySideEffects || ''} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, mySideEffects: e.target.value}})} className="w-full h-32 bg-slate-50 p-5 rounded-[24px] border-none outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDbModal({show:false})} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[28px] font-black">取消</button>
                <button onClick={() => {
                  const newData = dbModal.isNew ? { ...dbModal.data, id: 'm'+Date.now() } : dbModal.data;
                  setMedsDB(dbModal.isNew ? [...medsDB, newData] : medsDB.map(m => m.id === newData.id ? newData : m));
                  setDbModal({show:false});
                }} className="flex-[2] py-5 bg-slate-800 text-white rounded-[28px] font-black shadow-lg">儲存藥物</button>
              </div>
            </div>
          </div>
        )}

        {dayEditor.show && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black mb-8">編輯 {dayEditor.data?.date} 紀錄</h2>
              <div className="space-y-6 text-left mb-10">
                <div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">起床時間</label><input type="time" value={dayEditor.data?.wake || ''} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, wake: e.target.value}})} className="w-full bg-white p-3 rounded-xl font-black text-xl outline-none" /></div>
                <div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">就寢時間</label><input type="time" value={dayEditor.data?.bed || ''} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, bed: e.target.value}})} className="w-full bg-white p-3 rounded-xl font-black text-xl outline-none" /></div>
                <div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">情緒評分</label><input type="number" value={dayEditor.data?.mood || 5} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, mood: parseInt(e.target.value)}})} className="w-full bg-white p-3 rounded-xl font-black text-xl outline-none" /></div>
                <div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">心情筆記</label><textarea value={dayEditor.data?.diary || ''} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, diary: e.target.value}})} className="w-full h-32 bg-white p-3 rounded-xl text-sm font-medium resize-none outline-none" /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDayEditor({show:false})} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[28px] font-black">取消</button>
                <button onClick={() => {
                  const newHist = historyDB.map(h => h.date === dayEditor.data.date ? dayEditor.data : h);
                  setHistoryDB(newHist);
                  if (dayEditor.data.date === todayRecord.date) setTodayRecord(dayEditor.data);
                  setDayEditor({show:false});
                }} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[28px] font-black shadow-lg">儲存變更</button>
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </ErrorBoundary>
  );
}
