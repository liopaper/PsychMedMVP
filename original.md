import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Pill, Moon, Sun, Home, Activity, Calendar, Database,
  AlertCircle, Plus, Minus, X, Check, Zap,
  TrendingUp, Clock, FileText, User, Edit3, CloudSun
} from 'lucide-react';

// --- 全域資料庫 ---
const MEDS_DB = [
  {
    id: 'm1', name: '鋰鹽（Lithium）', dose: '300mg', manufacturer: '優良化學',
    category: '情緒穩定劑', status: 'active',
    officialSideEffects: '手抖、口渴、頻尿、甲狀腺低下。',
    mySideEffects: '血清濃度夠的時候手會微抖，但情緒最穩。',
    trendData: [
      { date: '11／01', total: 2.0, reason: '初始', by: 'doctor' },
      { date: '12／15', total: 3.0, reason: '焦慮加重', by: 'doctor' },
      { date: '02／10', total: 4.0, reason: '加量', by: 'doctor' },
      { date: '02／16', total: 5.0, reason: '維持最高劑量', by: 'doctor' }
    ]
  },
  {
    id: 'm2', name: '樂命達（Lamictal）', dose: '50mg', manufacturer: '葛蘭素史克',
    category: '情緒穩定劑／抗癲癇', status: 'active',
    officialSideEffects: '皮疹、頭暈、失眠。',
    mySideEffects: '目前適應良好，沒有長疹子。',
    trendData: [
      { date: '12／01', total: 0.5, reason: '緩慢滴定', by: 'doctor' },
      { date: '01／15', total: 2.0, reason: '達標劑量', by: 'doctor' },
      { date: '02／16', total: 2.0, reason: '維持', by: 'doctor' }
    ]
  },
  {
    id: 'm3', name: '利福全（Rivotril）', dose: '0.5mg', manufacturer: '羅氏',
    category: '抗焦慮／鎮定', status: 'active',
    officialSideEffects: '嗜睡、肌肉無力、注意力不集中。',
    mySideEffects: '睡前吃能放鬆，但白天吃會有點昏沉。',
    trendData: [
      { date: '11／01', total: 1.0, reason: '睡前幫助', by: 'doctor' },
      { date: '01／15', total: 1.5, reason: '近期壓力大', by: 'self' },
      { date: '02／10', total: 1.0, reason: '壓力解除減量', by: 'self' },
      { date: '02／16', total: 1.0, reason: '維持', by: 'self' }
    ]
  },
  {
    id: 'm4', name: '美得眠（Modipanol）', dose: '1mg', manufacturer: '瑞士藥廠',
    category: '安眠藥', status: 'active',
    officialSideEffects: '嗜睡、記憶模糊、口渴。',
    mySideEffects: '吃完半小時內一定得躺下，不然會斷片。',
    trendData: [
      { date: '11／01', total: 1.0, reason: '失眠', by: 'doctor' },
      { date: '01／01', total: 2.0, reason: '產生耐受性', by: 'doctor' },
      { date: '02／10', total: 1.5, reason: '嘗試減藥', by: 'self' },
      { date: '02／16', total: 1.5, reason: '維持', by: 'self' }
    ]
  },
  {
    id: 'm5', name: '利他能（Ritalin）', dose: '10mg', manufacturer: '諾華',
    category: '中樞神經刺激劑', status: 'prn',
    officialSideEffects: '心悸、食慾不振、失眠。',
    mySideEffects: '需要極度專注時才吃半顆，吃多會心慌。',
    trendData: []
  },
  {
    id: 'm6', name: '怡必隆（Epival）', dose: '500mg', manufacturer: '亞培',
    category: '情緒穩定劑', status: 'archived',
    officialSideEffects: '腸胃不適、體重增加、掉髮。',
    mySideEffects: '狂掉頭髮且一直變胖，無法忍受。',
    trendData: [
      { date: '08／01', total: 1.0, reason: '初始', by: 'doctor' },
      { date: '09／01', total: 2.0, reason: '加量', by: 'doctor' },
      { date: '10／01', total: 0.0, reason: '副作用停藥', by: 'doctor' }
    ]
  }
];

const INITIAL_HISTORY = [
  {
    date: '02／16', weekday: '五', prevBed: '23:30', wake: '08:00', weather: '微雨',    
    events: [
      { type: 'med', time: '08:30', label: '用藥一', items: [{name: '鋰鹽', dose: 1.5}, {name: '樂命達', dose: 1.0}] },
      { type: 'med', time: '14:00', label: '必要時用藥', items: [{name: '利他能', dose: 0.5}] },
      { type: 'med', time: '22:30', label: '用藥二', items: [{name: '鋰鹽', dose: 1.5}, {name: '樂命達', dose: 1.0}, {name: '利福全', dose: 1.0}, {name: '美得眠', dose: 1.5}] },
    ],
    diary: '今天開會被主管唸了一下，整天心情都有點悶。下午吃了半顆利他能撐過會議，晚上吃了利福全才比較放鬆。'
  },
  {
    date: '02／15', weekday: '四', prevBed: '23:00', wake: '07:30', weather: '陰天',    
    events: [
      { type: 'med', time: '10:00', label: '用藥一', items: [{name: '鋰鹽', dose: 1.5}, {name: '樂命達', dose: 1.0}] },
      { type: 'med', time: '23:00', label: '用藥二', items: [{name: '鋰鹽', dose: 1.5}, {name: '樂命達', dose: 1.0}, {name: '美得眠', dose: 2.0}] },
    ],
    diary: '週末快到了，趕報告壓力很大。'
  }
];

const WEATHER_OPTIONS = ['大太陽', '晴朗', '陰晴不定', '陰天', '微雨', '下雨', '其他'];

// --- 獨立元件區 ---
const PageHeader = ({ title, subtitle, rightElement }) => (
  <div className="flex justify-between items-start mb-6 px-2 pt-2 shrink-0">
    <div>
      <h1 className="text-2xl font-black text-slate-800">{title}</h1>
      <p className="text-xs font-bold text-slate-400 mt-1">{subtitle}</p>
    </div>
    {rightElement}
  </div>
);

const TimelineCard = ({ slotKey, title, icon: Icon, color, activeBg, data, onAction, isDashed }) => {
  const isDone = !!data;
  return (
    <div 
      onClick={onAction}
      className={`relative p-4 rounded-3xl transition-all cursor-pointer border-2
        ${isDone ? `${activeBg} border-transparent shadow-sm` : `bg-white ${isDashed ? 'border-dashed' : 'border-solid'} border-slate-200 hover:border-slate-300`}`}
    >
      {isDone && !isDashed && <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-${color}-500`}></div>}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${isDone ? `bg-white text-${color}-600 shadow-sm` : 'bg-slate-50 text-slate-400'}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className={`font-bold ${isDone ? `text-${color}-900` : 'text-slate-500'}`}>{title}</span>
            {isDone && (
              <span className={`text-sm font-black text-${color}-600 flex items-center gap-1 bg-white／50 px-2 py-0.5 rounded-lg`}>
                {(typeof data === 'object' && data !== null) ? data.time : data} <Edit3 size={12} className="opacity-60 ml-1"/>
              </span>
            )}
          </div>
          {isDone && typeof data === 'object' && data.items && (
            <div className={`mt-2 space-y-1 bg-white／50 p-2 rounded-xl text-sm font-bold text-${color}-800`}>
              {data.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="opacity-80">{item.dose} 顆</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MedCard = ({ med, isArchived, onEdit }) => (
  <div className={`p-5 rounded-3xl border shadow-sm shrink-0 mb-4 transition-all
    ${isArchived ? 'bg-slate-100 border-slate-200 grayscale opacity-80' : 'bg-white border-slate-100'}`}>
    <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold inline-block">
              {med.manufacturer}
            </span>
            <span className="text-[10px] text-slate-400 font-bold border border-slate-200 px-1.5 py-0.5 rounded">
              {med.category}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            {med.name.split('（')[0]}
            <span className="text-sm text-slate-400 font-normal">{med.dose}</span>
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={onEdit}
            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition"
          >
            <Edit3 size={14} />
          </button>
          <div className={`px-2 py-1 rounded-lg text-[10px] font-bold 
            ${isArchived ? 'bg-slate-200 text-slate-500' :
              med.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isArchived ? '❄️ 冷宮' : med.status === 'active' ? '服役中' : '必要時'}
          </div>
        </div>
    </div>

    <div className="grid gap-3">
        <div className={`p-4 rounded-2xl border ${isArchived ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50／50 border-indigo-100 ring-2 ring-indigo-50'}`}>
          <h4 className={`text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1 ${isArchived ? 'text-slate-500' : 'text-indigo-500'}`}>
            <User size={12}/> 我的副作用
          </h4>
          <p className={`text-sm font-medium leading-relaxed ${isArchived ? 'text-slate-500' : 'text-indigo-900'}`}>{med.mySideEffects}</p>
        </div>
        <div className={`p-4 rounded-2xl ${isArchived ? 'bg-transparent' : 'bg-slate-50 border border-slate-100'}`}>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
            <AlertCircle size={12}/> 原廠副作用
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">{med.officialSideEffects}</p>
        </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [medsDB, setMedsDB] = useState(MEDS_DB);
  const [historyDB, setHistoryDB] = useState(INITIAL_HISTORY);
  
  // --- 每天記錄狀態 ---
  const [dailyStatus, setDailyStatus] = useState({
    wake: null, med1: null, med2: null, prn: null, bed: null
  });
  const [diaryText, setDiaryText] = useState('');
  
  const [weather, setWeather] = useState('晴朗');
  const [customWeather, setCustomWeather] = useState('');
  
  const todayStr = new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'long' }).format(new Date()).replace('/', '／');

  // --- Modal 狀態 ---
  const [medModal, setMedModal] = useState({ show: false, mode: '', slotKey: '', slotLabel: '', dayIdx: null, evIdx: null });
  const [modalTime, setModalTime] = useState('');
  const [modalDoses, setModalDoses] = useState({});
  const [timeModal, setTimeModal] = useState({ show: false, slotKey: '', title: '', time: '' });
  const [dbModal, setDbModal] = useState({ show: false, isNew: false, data: {} });
  
  // 回診手冊：全天編輯 Modal 狀態
  const [dayEditModal, setDayEditModal] = useState({ show: false, dayIdx: null });
  const [editDayForm, setEditDayForm] = useState(null);

  // --- 趨勢頁狀態 ---
  const [selectedTrendMedId, setSelectedTrendMedId] = useState('m1');
  const [trendRange, setTrendRange] = useState('1M'); 
  const [showChangeModal, setShowChangeModal] = useState(false);
  
  // 趨勢：調整劑量表單狀態
  const [changeForm, setChangeForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    dose: '', 
    by: 'doctor', 
    reason: '維持', 
    otherReason: '' 
  });
  
  // --- 回診手冊狀態 ---
  const [historyRange, setHistoryRange] = useState('1W'); 

  // --- 處理作息打卡 ---
  const handleTimeCheckIn = (slotKey, title) => {
    if (dailyStatus[slotKey]) {
      setTimeModal({ show: true, slotKey, title, time: dailyStatus[slotKey] });
    } else {
      const time = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
      setDailyStatus({ ...dailyStatus, [slotKey]: time });
    }
  };

  const saveBasicTime = () => {
    setDailyStatus({ ...dailyStatus, [timeModal.slotKey]: timeModal.time });
    setTimeModal({ show: false, slotKey: '', title: '', time: '' });
  };

  const setBasicTimeToNow = () => {
    setTimeModal({ ...timeModal, time: new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) });
  };

  const setMedTimeToNow = () => {
    setModalTime(new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}));
  };

  const openTodayMed = (slotKey, slotLabel) => {
    const existing = dailyStatus[slotKey];
    setModalTime(existing ? existing.time : new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}));
    const doses = {};
    if (existing && existing.items) {
      existing.items.forEach(i => {
        const m = medsDB.find(med => med.name.includes(i.name));
        if (m) doses[m.id] = i.dose;
      });
    }
    setModalDoses(doses);
    setMedModal({ show: true, mode: 'today', slotKey, slotLabel, dayIdx: null, evIdx: null });
  };

  const adjustDose = (medId, delta) => {
    const current = modalDoses[medId] || 0;
    const newDose = parseFloat((Math.max(0, current + delta)).toFixed(2));
    setModalDoses({ ...modalDoses, [medId]: newDose });
  };

  const saveMedModal = () => {
    const items = Object.entries(modalDoses).filter(([_,d])=>d>0).map(([id, d]) => ({
      name: medsDB.find(m=>m.id===id).name.split('（')[0],
      dose: d
    }));

    if (medModal.mode === 'today') {
      if (items.length > 0) {
        setDailyStatus({ ...dailyStatus, [medModal.slotKey]: { time: modalTime, items } });
      } else {
        setDailyStatus({ ...dailyStatus, [medModal.slotKey]: null }); 
      }
    } 
    setMedModal({ show: false, mode: '', slotKey: '', slotLabel: '', dayIdx: null, evIdx: null });
  };

  const saveDbModal = () => {
    if (dbModal.isNew) {
      setMedsDB([...medsDB, { ...dbModal.data, id: 'm' + Date.now(), trendData: [] }]);
    } else {
      setMedsDB(medsDB.map(m => m.id === dbModal.data.id ? dbModal.data : m));
    }
    setDbModal({ show: false, isNew: false, data: {} });
  };

  const calculateSleep = (bed, wake) => {
    if (!bed || !wake) return '--';
    let [bh, bm] = bed.split(':').map(Number);
    let [wh, wm] = wake.split(':').map(Number);
    let bedMins = bh * 60 + bm;
    let wakeMins = wh * 60 + wm;
    if (wakeMins < bedMins) wakeMins += 24 * 60; 
    return ((wakeMins - bedMins) / 60).toFixed(1);
  };

  // 開啟全天編輯 Modal
  const openDayEdit = (dayIdx) => {
    const dayData = JSON.parse(JSON.stringify(historyDB[dayIdx]));
    setEditDayForm(dayData);
    setDayEditModal({ show: true, dayIdx });
  };

  const handleDayEditChange = (field, value) => {
    setEditDayForm({ ...editDayForm, [field]: value });
  };

  const handleDayEventTimeChange = (eIdx, time) => {
    const newEvents = [...editDayForm.events];
    newEvents[eIdx].time = time;
    setEditDayForm({ ...editDayForm, events: newEvents });
  };

  const handleDayMedDoseChange = (eIdx, iIdx, delta) => {
    const newEvents = [...editDayForm.events];
    const current = newEvents[eIdx].items[iIdx].dose;
    newEvents[eIdx].items[iIdx].dose = parseFloat((Math.max(0, current + delta)).toFixed(2));
    setEditDayForm({ ...editDayForm, events: newEvents });
  };

  const saveDayEditModal = () => {
    const newHist = [...historyDB];
    const cleanedEvents = editDayForm.events.map(ev => {
       if (ev.type === 'med') {
         return { ...ev, items: ev.items.filter(item => item.dose > 0) };
       }
       return ev;
    }).filter(ev => ev.type !== 'med' || ev.items.length > 0);

    newHist[dayEditModal.dayIdx] = { ...editDayForm, events: cleanedEvents };
    setHistoryDB(newHist);
    setDayEditModal({ show: false, dayIdx: null });
  };

  // 儲存趨勢調整
  const saveTrendChange = () => {
    const newMedsDB = [...medsDB];
    const medIndex = newMedsDB.findIndex(m => m.id === selectedTrendMedId);
    if (medIndex > -1) {
      const dateObj = new Date(changeForm.date);
      const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}／${String(dateObj.getDate()).padStart(2, '0')}`;
      
      newMedsDB[medIndex].trendData.push({
        date: formattedDate,
        total: parseFloat(changeForm.dose) || 0,
        reason: changeForm.reason === '其他（手動輸入）' ? changeForm.otherReason : changeForm.reason,
        by: changeForm.by
      });
      newMedsDB[medIndex].trendData.sort((a, b) => {
         const [m1, d1] = a.date.split('／').map(Number);
         const [m2, d2] = b.date.split('／').map(Number);
         return (m1 * 100 + d1) - (m2 * 100 + d2);
      });
      
      setMedsDB(newMedsDB);
    }
    setShowChangeModal(false);
    setChangeForm({ date: new Date().toISOString().split('T')[0], dose: '', by: 'doctor', reason: '維持', otherReason: '' });
  };

  // --- 渲染畫面 ---
  const renderHomeTab = () => (
    <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar pb-24 animate-in fade-in">
      <div className="flex justify-between items-start mb-6 px-2 pt-2 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{todayStr}</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">妳每天都很棒棒棒！</p>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
            <CloudSun size={16} className="text-slate-400" />
            <select 
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none w-auto max-w-[80px]"
            >
               {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          {weather === '其他' && (
            <input 
              type="text" 
              placeholder="輸入天氣..." 
              value={customWeather}
              onChange={(e) => setCustomWeather(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none w-[100px] shadow-inner"
            />
          )}
        </div>
      </div>

      <div className="space-y-4 relative mb-6">
        <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-slate-100 -z-10"></div>
        <TimelineCard slotKey="wake" title="起床" icon={Sun} color="amber" activeBg="bg-amber-50" data={dailyStatus.wake} onAction={() => handleTimeCheckIn('wake', '起床')} />
        <TimelineCard slotKey="med1" title="用藥一" icon={Pill} color="emerald" activeBg="bg-emerald-50" data={dailyStatus.med1} onAction={() => openTodayMed('med1', '用藥一')} />
        <TimelineCard slotKey="med2" title="用藥二" icon={Pill} color="emerald" activeBg="bg-emerald-50" data={dailyStatus.med2} onAction={() => openTodayMed('med2', '用藥二')} />
        <TimelineCard slotKey="bed" title="就寢" icon={Moon} color="indigo" activeBg="bg-indigo-50" data={dailyStatus.bed} onAction={() => handleTimeCheckIn('bed', '就寢')} />
      </div>

      <div className="mb-6">
        <TimelineCard 
          slotKey="prn" title="必要時用藥（利他能）" icon={Zap} color="rose" activeBg="bg-rose-50" 
          data={dailyStatus.prn} onAction={() => openTodayMed('prn', '必要時用藥')} isDashed={true}
        />
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <FileText size={16} className="text-slate-400" /> 情緒與事件
        </h2>
        <textarea 
          value={diaryText}
          onChange={(e) => setDiaryText(e.target.value)}
          placeholder="紀錄今日發生的事與心情..."
          className="w-full flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 focus:ring-2 focus:ring-slate-300 outline-none resize-none min-h-[120px]"
        />
      </div>
    </div>
  );

  const renderTrendTab = () => {
    const selectedTrendMed = medsDB.find(m => m.id === selectedTrendMedId) || medsDB[0];
    const trendData = selectedTrendMed?.trendData || [];
    const lastTotal = trendData[trendData.length - 1]?.total || 0;
    const yTicks = Array.from({length: 11}, (_, i) => i * 0.5);
    
    const REASONS = ['維持', '加量', '減量', '副作用太強', '效果不佳', '其他（手動輸入）'];

    return (
      <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar pb-24 animate-in fade-in">
        <PageHeader 
          title="用藥劑量" 
          subtitle="體質特別 30 年沒看過！"
          rightElement={
            <select 
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-600 rounded-lg px-2 py-1 outline-none font-bold shadow-sm"
            >
              <option value="1W">一週</option>
              <option value="2W">雙週</option>
              <option value="1M">本月</option>
              <option value="1Y">本年</option>
            </select>
          } 
        />
        
        <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar -mx-4 px-4 shrink-0 items-center">
          {/* 新增藥物按鈕移到最前面 */}
          <button 
            onClick={() => setDbModal({ show: true, isNew: true, data: { status: 'active' } })}
            className="w-10 h-10 rounded-full border-2 border-slate-300 border-dashed text-slate-400 flex items-center justify-center shrink-0 hover:bg-slate-200 transition-all mr-1"
            title="新增藥物"
          >
            <Plus size={18} strokeWidth={3} />
          </button>

          {medsDB.map(med => (
            <button
              key={med.id}
              onClick={() => setSelectedTrendMedId(med.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all flex flex-col gap-1 shrink-0
                ${selectedTrendMedId === med.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200'}
                ${med.status === 'archived' && selectedTrendMedId !== med.id ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-1">
                {med.name.split('（')[0]}
                {med.status === 'archived' && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded">冷宮</span>}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm shrink-0">
           <div className="flex justify-between items-center mb-4 px-4 pt-4">
             <h3 className="font-bold text-slate-800">劑量調整</h3>
             <div className="text-sm font-black text-emerald-600">
               {lastTotal} 顆／日
             </div>
           </div>

           <div className="h-64 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis 
                    domain={[0, 5]} 
                    ticks={yTicks}
                    tick={{fontSize: 10}} 
                    axisLine={false} 
                    tickLine={false}
                    label={{ value: '總量（顆）', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)'}}
                    labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="total" 
                    name="總量"
                    stroke="#cbd5e1" 
                    strokeWidth={2} 
                    dot={(props) => {
                       const { cx, cy, payload } = props;
                       const isSelf = payload.by === 'self';
                       return (
                         <circle 
                           key={payload.date} cx={cx} cy={cy} r={5} 
                           fill={isSelf ? '#f59e0b' : '#10b981'} 
                           stroke="white" strokeWidth={2} 
                         />
                       );
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
           </div>
           
           <div className="px-4 pb-4 mt-4 flex justify-between items-center">
             <div className="flex gap-2 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 醫囑</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 自調</span>
             </div>
             <button 
                onClick={() => {
                  setChangeForm(prev => ({ ...prev, dose: lastTotal }));
                  setShowChangeModal(true);
                }}
                className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition"
             >
                <Edit3 size={12} /> 調整劑量
             </button>
           </div>
        </div>

        {/* 顯示變更紀錄 */}
        {trendData.length > 0 && (
          <div className="mt-6 shrink-0">
            <h3 className="text-sm font-bold text-slate-800 mb-3 px-1">變更紀錄</h3>
            <div className="space-y-3">
              {[...trendData].reverse().map((record, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                   <div>
                     <div className="text-xs font-bold text-slate-400 mb-1">{record.date}</div>
                     <div className="text-sm font-bold text-slate-700">{record.reason}</div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                     <span className="text-lg font-black text-slate-800">{record.total} <span className="text-xs font-normal text-slate-400">顆</span></span>
                     <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${record.by === 'self' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                       {record.by === 'self' ? '自行調整' : '醫囑'}
                     </span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 調整劑量 Modal */}
        {showChangeModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900／40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
               <div className="flex justify-between items-center mb-4 shrink-0">
                 <h2 className="text-xl font-black text-slate-800">調整 {selectedTrendMed?.name.split('（')[0]} 劑量</h2>
                 <button onClick={() => setShowChangeModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pb-6 pr-2">
                 <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">日期</label>
                   <input 
                      type="date" 
                      value={changeForm.date} 
                      onChange={e => setChangeForm({...changeForm, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-bold text-slate-700" 
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-500 mb-1 block">新劑量（顆／日）</label>
                     <input 
                        type="number" step="0.25" 
                        value={changeForm.dose}
                        onChange={e => setChangeForm({...changeForm, dose: e.target.value})}
                        placeholder="例如：1.5" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold text-slate-700" 
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 mb-1 block">調整決策</label>
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                       <button onClick={() => setChangeForm({...changeForm, by: 'doctor'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${changeForm.by === 'doctor' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>醫囑</button>
                       <button onClick={() => setChangeForm({...changeForm, by: 'self'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${changeForm.by === 'self' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}>自調</button>
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">變更原因</label>
                   <select 
                      value={changeForm.reason}
                      onChange={e => setChangeForm({...changeForm, reason: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold text-slate-700"
                   >
                      {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>

                 {changeForm.reason === '其他（手動輸入）' && (
                   <div>
                     <label className="text-xs font-bold text-slate-500 mb-1 block">請輸入原因</label>
                     <input 
                        type="text" 
                        value={changeForm.otherReason}
                        onChange={e => setChangeForm({...changeForm, otherReason: e.target.value})}
                        placeholder="自行輸入..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold text-slate-700" 
                     />
                   </div>
                 )}
               </div>

               <div className="pt-4 shrink-0 border-t border-slate-100 mt-2">
                 <button onClick={saveTrendChange} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
                   <Check size={20} /> 儲存至趨勢圖
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    const validSleeps = historyDB.map(day => Number(calculateSleep(day.prevBed, day.wake))).filter(n => !isNaN(n));
    const avgSleep = validSleeps.length > 0 ? (validSleeps.reduce((a, b) => a + b, 0) / validSleeps.length).toFixed(1) : '--';
    const rangeLabels = { '1W': '一週', '2W': '雙週', '1M': '本月', '1Y': '本年' };

    return (
      <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar pb-24 animate-in fade-in">
         <PageHeader 
          title="回診手冊" 
          subtitle="又見面了吳太醫！"
          rightElement={
            <select 
              value={historyRange}
              onChange={(e) => setHistoryRange(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg px-2 py-1 outline-none shadow-sm"
            >
              <option value="1W">一週</option>
              <option value="2W">雙週</option>
              <option value="1M">本月</option>
              <option value="1Y">本年</option>
           </select>
          } 
        />

         <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-sm shrink-0">
            <span className="text-sm font-bold text-indigo-900">{rangeLabels[historyRange]}平均睡眠</span>
            <div className="text-xl font-black text-indigo-600">
              {avgSleep} <span className="text-xs font-bold text-indigo-400">小時／日</span>
            </div>
         </div>

         <div className="space-y-6">
           {historyDB.map((day, dayIdx) => (
             <div key={dayIdx} className="bg-white rounded-[24px] border border-slate-200 shadow-md overflow-hidden shrink-0">
                
                <div className="bg-slate-100／70 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                   <div className="flex flex-col gap-2 flex-1">
                     <div className="flex items-baseline gap-2">
                       <span className="font-black text-slate-800 text-xl">{day.date}</span>
                       <span className="text-sm font-bold text-slate-500">（{day.weekday}）</span>
                     </div>
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                         <CloudSun size={12}/> {day.weather}
                       </span>
                       <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                         睡眠 {calculateSleep(day.prevBed, day.wake)} 小時
                       </span>
                     </div>
                   </div>
                   <button onClick={() => openDayEdit(dayIdx)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm active:scale-95 transition ml-2 shrink-0">
                     <Edit3 size={18} />
                   </button>
                </div>

                <div className="p-5 space-y-5">
                  <div className="bg-amber-50／80 border border-amber-100 p-4 rounded-2xl">
                    <h4 className="text-[11px] font-bold text-amber-700 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <FileText size={14}/> 事件與情緒
                    </h4>
                    <p className="text-sm text-amber-950 leading-relaxed font-medium">
                      {day.diary || '（本日無紀錄）'}
                    </p>
                  </div>

                  <div className="bg-slate-50／80 border border-slate-100 p-4 rounded-2xl">
                    <h4 className="text-[11px] font-bold text-slate-500 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                      <Activity size={14}/> 作息與用藥
                    </h4>
                    <div className="relative pl-3 space-y-5">
                      <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-200 rounded-full"></div>
                      
                      <div className="relative flex gap-4 items-start">
                        <div className="bg-white p-1 rounded-full shadow-sm z-10 -ml-1.5 border border-slate-100">
                          <Sun size={14} className="text-amber-500" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <span className="text-sm font-black text-slate-700 mr-2">{day.wake}</span>
                          <span className="text-xs font-bold text-slate-400">起床</span>
                        </div>
                      </div>

                      {day.events.map((ev, evIdx) => {
                        const isPrn = ev.label === '必要時用藥';
                        return (
                          <div key={evIdx} className="relative flex gap-4 items-start group">
                            <div className="bg-white p-1 rounded-full shadow-sm z-10 -ml-1.5 border border-slate-100">
                              {isPrn ? <Zap size={14} className="text-rose-500" /> : <Pill size={14} className="text-emerald-500" />}
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-black text-slate-700">{ev.time}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isPrn ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {ev.label}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {ev.items.map((i, iIdx) => (
                                  <div key={iIdx} className="flex justify-between items-center text-xs font-bold text-slate-600">
                                    <span>{i.name}</span>
                                    <span>{i.dose} 顆</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      <div className="relative flex gap-4 items-start">
                        <div className="bg-white p-1 rounded-full shadow-sm z-10 -ml-1.5 border border-slate-100">
                          <Moon size={14} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <span className="text-sm font-black text-slate-700 mr-2">{day.prevBed}</span>
                          <span className="text-xs font-bold text-slate-400">就寢</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
           ))}
         </div>
      </div>
    );
  };

  const renderDatabaseTab = () => {
    const activeMeds = medsDB.filter(m => m.status !== 'archived');
    const archivedMeds = medsDB.filter(m => m.status === 'archived');

    return (
      <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar pb-24 animate-in fade-in">
        <PageHeader title="藥藥寶典" subtitle="小主入宮！打入冷宮！" />
        
        <div className="mb-4">
          <button 
             onClick={() => setDbModal({ show: true, isNew: true, data: { status: 'active' } })}
             className="w-full bg-white border-2 border-dashed border-slate-200 text-slate-500 font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition"
          >
            <Plus size={18} /> 新增藥款
          </button>
        </div>

        <div className="space-y-2">
          {activeMeds.map(med => <MedCard key={med.id} med={med} isArchived={false} onEdit={() => setDbModal({ show: true, isNew: false, data: med })} />)}
          
          {archivedMeds.length > 0 && (
            <div className="flex items-center gap-4 my-8">
              <hr className="flex-1 border-slate-200 border-dashed"/>
              <span className="text-slate-400 font-bold text-sm bg-slate-100 px-4 py-1 rounded-full shadow-inner tracking-widest">❄️ 冷宮區</span>
              <hr className="flex-1 border-slate-200 border-dashed"/>
            </div>
          )}

          {archivedMeds.map(med => <MedCard key={med.id} med={med} isArchived={true} onEdit={() => setDbModal({ show: true, isNew: false, data: med })} />)}
        </div>
      </div>
    );
  };

  const visibleMedsInModal = medsDB.filter(m => m.status === 'active');
  const visiblePrnMeds = medsDB.filter(m => m.status === 'prn');

  return (
    <div className="w-[375px] h-[812px] mx-auto bg-slate-50 shadow-2xl relative flex flex-col font-sans selection:bg-indigo-100 sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 overflow-hidden shrink-0">
      
      <div className="flex-1 overflow-hidden bg-slate-50 relative">
         {activeTab === 'home' && renderHomeTab()}
         {activeTab === 'analysis' && renderTrendTab()}
         {activeTab === 'history' && renderHistoryTab()}
         {activeTab === 'database' && renderDatabaseTab()}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white／90 backdrop-blur-lg border-t border-slate-100 px-4 pt-3 pb-8 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'home' ? 'text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Clock size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">每天記錄</span>
          </button>
          
          <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'analysis' ? 'text-emerald-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <TrendingUp size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">用藥劑量</span>
          </button>

          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'history' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Calendar size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">回診手冊</span>
          </button>

          <button onClick={() => setActiveTab('database')} className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'database' ? 'text-amber-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Database size={24} strokeWidth={activeTab === 'database' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">藥藥寶典</span>
          </button>
        </div>
      </div>

      {/* 單純時間編輯 Modal (置中) */}
      {timeModal.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900／40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-black text-slate-800">編輯 {timeModal.title} 時間</h2>
              <button onClick={() => setTimeModal({ show: false, slotKey: '', title: '', time: '' })} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
            </div>
            <div className="mb-4">
               <div className="flex items-center gap-2 mb-2">
                 <input type="time" value={timeModal.time} onChange={(e) => setTimeModal({...timeModal, time: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-black text-slate-800 text-lg shadow-inner" />
                 <button onClick={setBasicTimeToNow} className="px-4 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl active:scale-95 transition whitespace-nowrap border border-indigo-100">現在時間</button>
               </div>
            </div>
            <button onClick={saveBasicTime} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
              <Check size={20} /> 完成儲存
            </button>
          </div>
        </div>
      )}

      {/* 首頁用藥編輯 Modal (置中) */}
      {medModal.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900／40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-black text-slate-800">編輯 {medModal.slotLabel}</h2>
              <button onClick={() => setMedModal({show: false, slotKey: '', slotLabel: ''})} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
            </div>
            <div className="mb-4 shrink-0">
               <label className="text-xs font-bold text-slate-500 mb-1 block">服藥時間</label>
               <div className="flex items-center gap-2">
                 <input type="time" value={modalTime} onChange={(e) => setModalTime(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-black text-slate-800 text-lg shadow-inner" />
                 <button onClick={setMedTimeToNow} className="px-4 py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl active:scale-95 transition whitespace-nowrap border border-emerald-100">現在時間</button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-2">
              {(medModal.slotKey === 'prn' ? visiblePrnMeds : visibleMedsInModal).map(med => {
                const dose = modalDoses[med.id] || 0;
                return (
                  <div key={med.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${dose > 0 ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 shadow-sm bg-white'}`}>
                    <div>
                      <div className="font-bold text-slate-800">{med.name.split('（')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{med.dose}</div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
                      <button onClick={() => adjustDose(med.id, -0.25)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600 active:scale-90"><Minus size={16}/></button>
                      <span className="w-8 text-center font-black text-lg text-slate-800">{dose}</span>
                      <button onClick={() => adjustDose(med.id, 0.25)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white active:scale-90"><Plus size={16}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-4 shrink-0 border-t border-slate-100 mt-2">
              <button onClick={saveMedModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
                <Check size={20} /> 完成儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 回診手冊的全天編輯 Modal (置中) */}
      {dayEditModal.show && editDayForm && (
         <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900／40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl p-6 w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
             <div className="flex justify-between items-center mb-4 shrink-0">
               <h2 className="text-xl font-black text-slate-800">編輯 {editDayForm.date}</h2>
               <button onClick={() => setDayEditModal({show: false, dayIdx: null})} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-2 pb-4">
                
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                   <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><FileText size={14}/> 事件與情緒</label>
                   <textarea
                     value={editDayForm.diary || ''}
                     onChange={e => handleDayEditChange('diary', e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm text-slate-700 resize-none min-h-[100px]"
                     placeholder="紀錄發生的事與心情..."
                   />
                </div>

                <div className="bg-amber-50／50 p-4 rounded-2xl border border-amber-100">
                   <label className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1"><Sun size={14}/> 起床時間</label>
                   <input type="time" value={editDayForm.wake} onChange={e => handleDayEditChange('wake', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-800 shadow-sm" />
                </div>

                {editDayForm.events.map((ev, eIdx) => (
                   <div key={eIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                         <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                           {ev.label === '必要時用藥' ? <Zap size={14} className="text-rose-500"/> : <Pill size={14} className="text-emerald-500"/>} 
                           {ev.label}
                         </label>
                         <input type="time" value={ev.time} onChange={e => handleDayEventTimeChange(eIdx, e.target.value)} className="w-28 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none font-bold text-slate-800 text-center shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        {ev.items.map((item, iIdx) => (
                           <div key={iIdx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                             <span className="font-bold text-sm text-slate-700 pl-2">{item.name}</span>
                             <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                                <button onClick={() => handleDayMedDoseChange(eIdx, iIdx, -0.25)} className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm text-slate-600 active:scale-90"><Minus size={12}/></button>
                                <span className="w-8 text-center font-black text-sm text-slate-800">{item.dose}</span>
                                <button onClick={() => handleDayMedDoseChange(eIdx, iIdx, 0.25)} className="w-6 h-6 rounded flex items-center justify-center bg-emerald-500 text-white active:scale-90"><Plus size={12}/></button>
                             </div>
                           </div>
                        ))}
                      </div>
                   </div>
                ))}

                <div className="bg-indigo-50／50 p-4 rounded-2xl border border-indigo-100">
                   <label className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1"><Moon size={14}/> 就寢時間</label>
                   <input type="time" value={editDayForm.prevBed} onChange={e => handleDayEditChange('prevBed', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-800 shadow-sm" />
                </div>
             </div>

             <div className="pt-4 shrink-0 border-t border-slate-100">
               <button onClick={saveDayEditModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
                 <Check size={20} /> 完成全天儲存
               </button>
             </div>
           </div>
         </div>
      )}

      {/* 藥典編輯 Modal (置中) */}
      {dbModal.show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900／40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-black text-slate-800">
                {dbModal.isNew ? '新增藥物' : '編輯藥物'}
              </h2>
              <button onClick={() => setDbModal({ show: false, isNew: false, data: {} })} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pb-6 pr-2">
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-1 block">藥物名稱</label>
                 <input 
                    type="text" value={dbModal.data.name || ''}
                    onChange={e => setDbModal({...dbModal, data: {...dbModal.data, name: e.target.value}})}
                    placeholder="例如：贊安諾" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold" 
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">劑量規格</label>
                   <input 
                      type="text" value={dbModal.data.dose || ''}
                      onChange={e => setDbModal({...dbModal, data: {...dbModal.data, dose: e.target.value}})}
                      placeholder="例如：0.5mg" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold" 
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">狀態（自動分類）</label>
                   <select 
                      value={dbModal.data.status || 'active'}
                      onChange={e => setDbModal({...dbModal, data: {...dbModal.data, status: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold"
                   >
                     <option value="active">服役中</option>
                     <option value="prn">必要時</option>
                     <option value="archived">冷宮區</option>
                   </select>
                </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 mb-1 block">原廠副作用</label>
                 <textarea 
                    value={dbModal.data.officialSideEffects || ''}
                    onChange={e => setDbModal({...dbModal, data: {...dbModal.data, officialSideEffects: e.target.value}})}
                    placeholder="輸入仿單上的副作用..." 
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 resize-none text-sm" 
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-indigo-500 mb-1 block">我的副作用筆記</label>
                 <textarea 
                    value={dbModal.data.mySideEffects || ''}
                    onChange={e => setDbModal({...dbModal, data: {...dbModal.data, mySideEffects: e.target.value}})}
                    placeholder="這顆藥吃起來感覺如何？" 
                    className="w-full h-24 bg-indigo-50／50 border border-indigo-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 resize-none text-sm text-indigo-900" 
                 />
              </div>
            </div>

            <div className="pt-4 shrink-0 border-t border-slate-100">
              <button onClick={saveDbModal} className="w-full mt-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
                <Check size={20} /> {dbModal.isNew ? '確認新增' : '儲存變更'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}