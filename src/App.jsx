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

// --- 1. 錯誤邊界元件 (防止全白畫面) ---
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

const calculateSleep = (bedTime, wakeTime) => {
  if (!bedTime || !wakeTime) return null;
  try {
    let [bh, bm] = bedTime.split(':').map(Number);
    let [wh, wm] = wakeTime.split(':').map(Number);
    if (isNaN(bh) || isNaN(wh)) return null;
    let bedMins = bh * 60 + bm;
    let wakeMins = wh * 60 + wm;
    if (wakeMins < bedMins) wakeMins += 24 * 60;
    return ((wakeMins - bedMins) / 60).toFixed(1);
  } catch (e) { return null; }
};

// --- 3. UI 元件 ---
const TimelineCard = ({ title, icon: Icon, color, activeBg, data, onAction }) => {
  const isDone = !!data;
  const displayTime = (typeof data === 'object' && data !== null) ? data.time : data;
  return (
    <div onClick={onAction} className={`relative p-4 rounded-3xl transition-all border-2 ${isDone ? `${activeBg} border-transparent shadow-sm` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
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
  <div className={`p-5 rounded-[32px] border shadow-sm mb-4 bg-white border-slate-100 ${med?.status === 'archived' ? 'grayscale opacity-70' : ''}`}>
    <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex gap-2 mb-1"><span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded font-black uppercase">{med?.manufacturer || '一般'}</span><span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded font-black uppercase">{med?.category || '藥物'}</span></div>
          <h3 className="text-xl font-black text-slate-800">{String(med?.name || "").split('（')[0]} <span className="text-sm text-slate-300 font-bold ml-1">{med?.dose}</span></h3>
        </div>
        <div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-rose-200 hover:text-rose-500"><Trash2 size={16}/></button><button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-200 hover:text-indigo-500"><Edit3 size={16} /></button></div>
    </div>
    <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50/50 mb-3 font-medium text-indigo-900 italic text-sm">{med?.mySideEffects || '尚無筆記'}</div>
  </div>
);

// --- 4. 主程式 ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  // 核心資料庫初始化與淨化
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

  // 跨日睡眠分析輔助
  const getPrevDayBedTime = (currentDate) => {
    const sorted = [...historyDB].sort((a,b) => safeParseDate(a.date) - safeParseDate(b.date));
    const idx = sorted.findIndex(h => h.date === currentDate);
    return idx > 0 ? sorted[idx - 1].bed : null;
  };

  // 趨勢圖數據預處理 (穩定化關鍵)
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
      <div className="w-full h-full max-w-[500px] mx-auto bg-slate-50 relative flex flex-col font-sans overflow-hidden sm:h-[812px] sm:rounded-[50px] sm:border-[10px] sm:border-slate-900 shadow-2xl safe-area-bottom">
        <div className="flex-1 overflow-hidden relative pt-4">
           {activeTab === 'home' && (
             <div className="p-4 flex flex-col h-full overflow-y-auto pb-32 animate-in fade-in custom-scrollbar">
               <div className="flex justify-between items-start mb-6 px-2 pt-2 shrink-0">
                 <div><h1 className="text-2xl font-black text-slate-800">{getTodayFullStr()}</h1><p className="text-xs font-bold text-slate-400 mt-1 uppercase">妳每天都很棒棒棒！</p></div>
                 <div className="bg-white border border-slate-100 rounded-xl px-2 py-1 shadow-sm flex items-center gap-1"><CloudSun size={14} className="text-slate-400" /><select value={todayRecord.weather} onChange={e => setTodayRecord({...todayRecord, weather: e.target.value})} className="text-[11px] font-black text-slate-600 outline-none bg-transparent">{WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
               </div>
               <div className="space-y-4 relative mb-6 shrink-0">
                 <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-slate-100 -z-10"></div>
                 <TimelineCard title="起床" icon={Sun} color="amber" activeBg="bg-amber-50" data={todayRecord.wake} onAction={() => { if(todayRecord.wake) setTimeModal({show:true, slotKey:'wake', title:'起床', time:todayRecord.wake}); else setTodayRecord({...todayRecord, wake: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}); }} />
                 <TimelineCard title="用藥一" icon={Pill} color="emerald" activeBg="bg-emerald-50" data={(todayRecord.events || []).find(e => e.label === '用藥一')} onAction={() => { const ex = (todayRecord.events || []).find(e => e.label === '用藥一'); setMedModal({show: true, slotKey:'med1', slotLabel:'用藥一'}); setModalTime(ex?.time || todayRecord.wake || '08:30'); const ds = {}; (ex?.items || []).forEach(i=>{ const m=medsDB.find(md=>md.name.includes(i.name)); if(m) ds[m.id]=i.dose; }); setModalDoses(ds); }} />
                 <TimelineCard title="用藥二" icon={Pill} color="emerald" activeBg="bg-emerald-50" data={(todayRecord.events || []).find(e => e.label === '用藥二')} onAction={() => { const ex = (todayRecord.events || []).find(e => e.label === '用藥二'); setMedModal({show: true, slotKey:'med2', slotLabel:'用藥二'}); setModalTime(ex?.time || '22:00'); const ds = {}; (ex?.items || []).forEach(i=>{ const m=medsDB.find(md=>md.name.includes(i.name)); if(m) ds[m.id]=i.dose; }); setModalDoses(ds); }} />
                 <TimelineCard title="就寢" icon={Moon} color="indigo" activeBg="bg-indigo-50" data={todayRecord.bed} onAction={() => { if(todayRecord.bed) setTimeModal({show:true, slotKey:'bed', title:'就寢', time:todayRecord.bed}); else setTodayRecord({...todayRecord, bed: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}); }} />
                 <div className="pt-2"><TimelineCard title="必要時用藥" icon={Zap} color="rose" activeBg="bg-rose-50" data={(todayRecord.events || []).find(e => e.label === '必要時用藥')} onAction={() => { const ex = (todayRecord.events || []).find(e => e.label === '必要時用藥'); setMedModal({show: true, slotKey:'prn', slotLabel:'必要時用藥'}); setModalTime(ex?.time || new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})); const ds = {}; (ex?.items || []).forEach(i=>{ const m=medsDB.find(md=>md.name.includes(i.name)); if(m) ds[m.id]=i.dose; }); setModalDoses(ds); }} /></div>
               </div>
               <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm mb-6 shrink-0">
                 <div className="flex justify-between items-center mb-4"><h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> 情緒與狀態</h2><div className="flex gap-2 items-center"><span className={`text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400`}>{ (todayRecord.moodTags || []).length > 0 ? todayRecord.moodTags.join('/') : '平常' }</span><span className="text-lg font-black text-indigo-600">{todayRecord.mood || 5}</span></div></div>
                 <input type="range" min="1" max="10" value={todayRecord.mood || 5} onChange={e => setTodayRecord({...todayRecord, mood: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-6" />
                 <div className="flex flex-wrap gap-2">{MOOD_TAGS.map(tag => (<button key={tag} onClick={() => { const cur = todayRecord.moodTags || []; const nxt = cur.includes(tag) ? cur.filter(t=>t!==tag) : [...cur, tag]; setTodayRecord({...todayRecord, moodTags: nxt}); }} className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${todayRecord.moodTags?.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{tag}</button>))}</div>
               </div>
               <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm shrink-0"><h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={16} className="text-slate-400"/> 心情筆記</h2><textarea value={todayRecord.diary || ''} onChange={e => setTodayRecord({...todayRecord, diary: e.target.value})} placeholder="紀錄今日發生的事..." className="w-full h-32 bg-slate-50 rounded-2xl p-4 text-sm outline-none resize-none border-none" /></div>
             </div>
           )}
           {activeTab === 'analysis' && (
             <div className="p-4 flex flex-col h-full overflow-y-auto pb-32 animate-in fade-in custom-scrollbar">
               <h1 className="text-2xl font-black text-slate-800 px-2 pt-2">用藥劑量</h1>
               {medsDB.length === 0 ? <div className="p-10 text-center text-slate-400 font-bold">請先新增藥物。</div> : (
                 <>
                   <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mt-4 shrink-0">{medsDB.map(m => (<button key={m.id} onClick={() => setSelectedTrendMedId(m.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all ${selectedTrendMedId === m.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}>{String(m.name || "藥物").split('（')[0]}</button>))}</div>
                   <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm mb-6 shrink-0 h-80">
                      <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={trendChartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} /><YAxis yAxisId="left" domain={[0, 10]} hide /><YAxis yAxisId="right" hide /><RechartsTooltip /><Bar yAxisId="right" dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} opacity={0.4} /><Line yAxisId="left" type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={4} dot={{r:4, fill:'#6366f1'}} /></ComposedChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex justify-center shrink-0"><button onClick={() => setTrendModal({show: true, date: getTodayKey(), dose: '', by: 'doctor', reason: ''})} className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black flex items-center gap-2 active:scale-95 transition-all"><Edit3 size={14}/> 調整醫囑劑量</button></div>
                 </>
               )}
             </div>
           )}
           {activeTab === 'history' && (
             <div className="p-4 flex flex-col h-full overflow-y-auto pb-32 animate-in fade-in custom-scrollbar">
                <div className="flex justify-between items-start mb-6 px-2 pt-2 shrink-0">
                   <div><h1 className="text-2xl font-black text-slate-800 tracking-tight">回診手冊</h1><p className="text-xs font-bold text-slate-400 mt-1 uppercase">PAST RECORDS</p></div>
                   <button onClick={() => { 
                     const recent = historyDB.slice(0, 7).reverse(); let t = `🏥 【PsychMedMVP 回診紀錄】\n`; 
                     recent.forEach(day => { t += `--------------------\n📅 ${day.date} | 情緒: ${day.mood || 5}\n`; });
                     navigator.clipboard.writeText(t); alert('已複製 7 天紀錄！'); 
                   }} className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg font-black text-xs">匯出紀錄</button>
                </div>
                <div className="space-y-8">{historyDB.map((day, idx) => (<div key={idx} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-7 shrink-0"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-slate-800">{day.date} <span className="text-base text-slate-300 ml-1">({day.weekday})</span></h2><button onClick={() => setDayEditor({show: true, data: day})} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-300 shadow-sm active:scale-95"><Edit3 size={20}/></button></div><div className="flex gap-2 mb-6 flex-wrap"><span className="bg-slate-50 text-slate-400 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5"><CloudSun size={14}/> {day.weather}</span><span className="bg-indigo-50 text-indigo-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter">程度: {day.mood}</span></div>{day.moodTags?.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">{day.moodTags.map(t => (<span key={t} className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">{t}</span>))}</div>}<div className="bg-amber-50/30 p-5 rounded-[28px] border border-amber-50/50 mb-6 text-sm font-bold text-slate-700 leading-relaxed italic">{day.diary || '無備註'}</div><div className="relative pl-6 space-y-6"><div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>{day.wake && <div className="relative flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm -ml-[11px] z-10"></div><span className="text-base font-black text-slate-700">{day.wake} 起床</span></div>}{(day.events || []).map((ev, eIdx) => (<div key={eIdx} className="relative"><div className={`w-3 h-3 rounded-full ${ev.label==='必要時用藥'?'bg-rose-400':'bg-emerald-400'} border-2 border-white shadow-sm -ml-1.5 absolute top-4 z-10`}></div><div className="bg-white border border-slate-50 rounded-[28px] p-5 shadow-sm ml-4"><div className="flex justify-between items-center mb-3"><span className="text-base font-black text-slate-700">{ev.time}</span><span className={`${ev.label==='必要時用藥'?'bg-rose-50 text-rose-500':'bg-emerald-50 text-emerald-500'} text-[9px] font-black px-2 py-1 rounded-md uppercase`}>{ev.label}</span></div><div className="space-y-1">{(ev.items || []).map((i, iIdx) => (<div key={iIdx} className="flex justify-between text-sm font-bold text-slate-500"><span>{i?.name}</span><span>{i?.dose} 顆</span></div>))}</div></div></div>))}{day.bed && <div className="relative flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-indigo-400 border-2 border-white shadow-sm -ml-[11px] z-10"></div><span className="text-base font-black text-slate-700">{day.bed} 就寢</span></div>}</div></div>))}</div>
             </div>
           )}
           {activeTab === 'database' && (
             <div className="p-4 flex flex-col h-full overflow-y-auto pb-32 animate-in fade-in custom-scrollbar">
               <h1 className="text-3xl font-black text-slate-800 mb-2 px-2 pt-2 tracking-tight">藥藥寶典</h1>
               <button onClick={() => setDbModal({show: true, isNew: true, data: { status:'active' }})} className="my-8 w-full py-6 border-2 border-dashed border-slate-100 rounded-[40px] text-slate-400 font-black text-lg flex items-center justify-center gap-3 hover:bg-white transition-all shrink-0"><Plus size={24}/> 新增藥款</button>
               {medsDB.map(m => (<MedCard key={m.id} med={m} onEdit={() => setDbModal({show: true, isNew: false, data: m})} onDelete={() => { if(confirm('確定刪除？')) setMedsDB(medsDB.filter(x=>x?.id!==m.id)); }} />))}
             </div>
           )}
        </div>
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100 px-8 pt-4 pb-10 flex justify-between items-center z-40 shrink-0"><button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-slate-900 scale-110' : 'text-slate-300'}`}><Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} /><span className="text-[10px] font-black uppercase">每天記錄</span></button><button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'analysis' ? 'text-emerald-500 scale-110' : 'text-slate-300'}`}><TrendingUp size={28} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} /><span className="text-[10px] font-black uppercase">用藥劑量</span></button><button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><Calendar size={28} strokeWidth={activeTab === 'history' ? 2.5 : 2} /><span className="text-[10px] font-black uppercase">回診手冊</span></button><button onClick={() => setActiveTab('database')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'database' ? 'text-amber-600 scale-110' : 'text-slate-300'}`}><Database size={28} strokeWidth={activeTab === 'database' ? 2.5 : 2} /><span className="text-[10px] font-black uppercase">藥藥寶典</span></button></div>
        
        {/* MODALS (全啟動) */}
        {timeModal.show && (<div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"><div className="bg-white w-full rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"><h2 className="text-2xl font-black text-slate-800 mb-8">{timeModal.title}時間編輯</h2><input type="time" value={timeModal.time} onChange={e => setTimeModal({...timeModal, time: e.target.value})} className="w-full bg-slate-50 p-6 rounded-[24px] text-3xl font-black text-center mb-10 outline-none" /><button onClick={() => { setTodayRecord({...todayRecord, [timeModal.slotKey]: timeModal.time}); setTimeModal({show: false}); }} className="w-full py-5 bg-slate-800 text-white rounded-[28px] font-black text-xl shadow-xl">確認儲存</button></div></div>)}
        {medModal.show && (<div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"><div className="bg-white w-full rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"><div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black">{medModal.slotLabel}編輯</h2><button onClick={() => setMedModal({show: false})} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={24}/></button></div><div className="space-y-6 mb-10"><div className="bg-slate-50 p-5 rounded-3xl border border-slate-100"><label className="text-[10px] font-black text-slate-300 uppercase block mb-2">服藥時間</label><input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" /></div><div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">{medsDB.filter(m => m && m.status !== 'archived').map(m => { const dose = modalDoses[m.id] || 0; return (<div key={m.id} className={`flex justify-between items-center p-5 border-2 rounded-[28px] transition-all ${dose > 0 ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50'}`}><div><span className="font-bold text-slate-700">{String(m.name || "").split('（')[0]}</span><p className="text-[10px] font-black text-slate-400 uppercase">{m.dose}</p></div><div className="flex items-center gap-3"><button onClick={() => setModalDoses({...modalDoses, [m.id]: Math.max(0, dose - 0.25)})} className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-500 active:scale-90 transition"><Minus size={18}/></button><span className="w-6 text-center font-black text-lg text-slate-800">{dose}</span><button onClick={() => setModalDoses({...modalDoses, [m.id]: dose + 0.25})} className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center active:scale-90 transition shadow-lg"><Plus size={18}/></button></div></div>); })}</div></div><button onClick={() => { const items = Object.entries(modalDoses).filter(([_, d]) => d > 0).map(([id, d]) => ({ name: String(medsDB.find(m => m.id === id)?.name || "").split('（')[0], dose: d })); const newEvents = [...(todayRecord.events || []).filter(e => e && e.label !== medModal.slotLabel)]; if (items.length > 0) newEvents.push({ label: medModal.slotLabel, time: modalTime, items }); setTodayRecord({...todayRecord, events: newEvents}); setMedModal({show: false}); }} className="w-full py-5 bg-slate-800 text-white rounded-[28px] font-black text-xl shadow-2xl active:scale-95 transition-all">確認紀錄</button></div></div>)}
        {dbModal.show && (<div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in"><div className="bg-white w-full rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar"><h2 className="text-2xl font-black text-slate-800 mb-8">{dbModal.isNew ? '新增藥物' : '編輯藥物'}</h2><div className="space-y-5 mb-8"><input type="text" placeholder="藥物名稱" value={dbModal.data?.name || ''} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, name: e.target.value}})} className="w-full bg-slate-50 p-5 rounded-[24px] font-bold border-none outline-none" /><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="劑量" value={dbModal.data?.dose || ''} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, dose: e.target.value}})} className="bg-slate-50 p-5 rounded-[24px] font-bold border-none outline-none" /><select value={dbModal.data?.status || 'active'} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, status: e.target.value}})} className="bg-slate-50 p-5 rounded-[24px] font-bold border-none outline-none"><option value="active">服役中</option><option value="prn">必要時用</option><option value="archived">冷宮</option></select></div><textarea placeholder="我的副作用筆記" value={dbModal.data?.mySideEffects || ''} onChange={e => setDbModal({...dbModal, data: {...dbModal.data, mySideEffects: e.target.value}})} className="w-full h-32 bg-slate-50 p-5 rounded-[24px] border-none outline-none resize-none" /></div><div className="flex gap-3"><button onClick={() => setDbModal({show:false})} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[28px] font-black">取消</button><button onClick={() => { const newData = dbModal.isNew ? { ...dbModal.data, id: 'm'+Date.now(), trendData: [] } : dbModal.data; setMedsDB(dbModal.isNew ? [...medsDB, newData] : medsDB.map(m => m.id === newData.id ? newData : m)); setDbModal({show:false}); }} className="flex-[2] py-5 bg-slate-800 text-white rounded-[28px] font-black shadow-lg">儲存藥物</button></div></div></div>)}
        {dayEditor.show && (<div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in"><div className="bg-white w-full rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-black mb-8">編輯 {dayEditor.data?.date} 紀錄</h2><div className="space-y-6 text-left mb-10"><div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">起床時間</label><input type="time" value={dayEditor.data?.wake || ''} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, wake: e.target.value}})} className="w-full bg-white p-3 rounded-xl font-black text-xl outline-none" /></div><div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">就寢時間</label><input type="time" value={dayEditor.data?.bed || ''} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, bed: e.target.value}})} className="w-full bg-white p-3 rounded-xl font-black text-xl outline-none" /></div><div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">情緒評分 (1-10)</label><input type="number" value={dayEditor.data?.mood || 5} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, mood: parseInt(e.target.value)}})} className="w-full bg-white p-3 rounded-xl font-black text-xl text-indigo-600 outline-none" /></div><div className="bg-slate-50 p-4 rounded-2xl"><label className="text-xs font-black text-slate-400 block mb-2 uppercase">心情筆記</label><textarea value={dayEditor.data?.diary || ''} onChange={e => setDayEditor({show: true, data: {...dayEditor.data, diary: e.target.value}})} className="w-full h-32 bg-white p-3 rounded-xl text-sm font-medium resize-none outline-none" /></div></div><div className="flex gap-3"><button onClick={() => setDayEditor({show:false})} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[28px] font-black">取消</button><button onClick={() => { const newHist = historyDB.map(h => h.date === dayEditor.data.date ? dayEditor.data : h); setHistoryDB(newHist); localStorage.setItem('psych_history', JSON.stringify(newHist)); if (dayEditor.data.date === todayRecord.date) setTodayRecord(dayEditor.data); setDayEditor({show:false}); }} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[28px] font-black shadow-lg">儲存變更</button></div></div></div>)}
      </div>
      <style>{`
        .safe-area-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 10px); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </ErrorBoundary>
  );
}