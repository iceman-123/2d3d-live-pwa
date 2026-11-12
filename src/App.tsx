import { useEffect, useMemo, useState } from 'react';

type Result = { time: string; set: string; value: string; twod: string };
type Page = 'live' | 'history' | 'threed' | 'chat' | 'settings' | 'holidays';
type CachedState = { results: Result[]; resultDate: string; savedAt: string };
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const DEMO_RESULTS: Result[] = [
  { time: '11:00 AM', set: '1503.93', value: '29073.09', twod: '33' },
  { time: '12:01 PM', set: '1501.10', value: '37080.12', twod: '00' },
  { time: '3:00 PM', set: '1497.66', value: '49837.36', twod: '67' },
  { time: '4:30 PM', set: '1499.06', value: '61920.14', twod: '60' },
];
const CACHE_KEY = '2d3d-live-demo-v1';
const initialData: CachedState = { results: DEMO_RESULTS, resultDate: 'နမူနာဒေတာ', savedAt: '' };
const navItems: { page: Page; icon: string; label: string }[] = [
  { page: 'live', icon: '◉', label: 'Live' },
  { page: 'history', icon: '◷', label: '2D မှတ်တမ်း' },
  { page: 'threed', icon: '▣', label: '3D' },
  { page: 'chat', icon: '▤', label: 'ချက်တင်' },
  { page: 'settings', icon: '⚙', label: 'ဆက်တင်' },
];

function loadCachedData(): CachedState {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return initialData;
    const parsed = JSON.parse(stored) as CachedState;
    if (!Array.isArray(parsed.results) || typeof parsed.resultDate !== 'string') return initialData;
    return parsed;
  } catch {
    return initialData;
  }
}

function formatSavedAt(value: string) {
  if (!value) return 'နမူနာဒေတာ';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'နမူနာဒေတာ' : date.toLocaleString('my-MM');
}

function App() {
  const [page, setPage] = useState<Page>('live');
  const [online, setOnline] = useState(() => navigator.onLine);
  const [data, setData] = useState<CachedState>(loadCachedData);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [notice, setNotice] = useState('');
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState<string[]>(['မင်္ဂလာပါ။ ဤချက်တင်သည် နမူနာ UI ဖြစ်ပြီး server နှင့် မချိတ်ဆက်ထားပါ။']);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    const installHandler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    window.addEventListener('beforeinstallprompt', installHandler);
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, []);

  useEffect(() => {
    // Save the local demo dataset once; no remote/API request is made.
    if (!localStorage.getItem(CACHE_KEY)) {
      const seeded = { ...initialData, savedAt: new Date().toISOString() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(seeded));
      setData(seeded);
    }
  }, []);

  const latest = useMemo(() => data.results[data.results.length - 1] ?? DEMO_RESULTS[3], [data.results]);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const refresh = () => {
    showNotice('နမူနာဒေတာသာဖြစ်၍ အင်တာနက်မှ တိုက်ရိုက်ရယူခြင်း မရှိပါ။');
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const message = chatText.trim();
    if (!message) return;
    setMessages((current) => [...current, message]);
    setChatText('');
    showNotice('ချက်တင်ကို စက်ထဲတွင်သာ ပြသထားသည်။ Server မချိတ်ထားပါ။');
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-badge">2D</div>
            <div><p className="brand-title">2D3D <span>Live</span></p><p className="brand-caption">နမူနာ · API မချိတ်ထားပါ</p></div>
          </div>
          <button type="button" className="icon-button" aria-label="ပြန်လည်ရယူမည်" onClick={refresh}>↻</button>
        </header>

        <div className={`connection-banner ${online ? 'is-online' : 'is-offline'}`} role="status">
          <span className="connection-dot" />{online ? 'အင်တာနက်ရှိသည် · နမူနာဒေတာ' : 'အင်တာနက်မရှိပါ · သိမ်းထားသောဒေတာ'}
        </div>

        {page === 'live' && <>
          <section className="hero-card">
            <div className="hero-row"><span className="live-pill"><span className="dot" /> နမူနာ ရလဒ်</span><span className="time-label">API မချိတ်ထားပါ</span></div>
            <div className="big-number-wrap"><span className="big-number">{latest.twod}</span><span className="subtitle">နောက်ဆုံးပြသထားသော နမူနာဂဏန်း · {data.resultDate}</span></div>
            <div className="stats-grid"><div className="stat-box"><p>SET · DEMO</p><strong>{latest.set}</strong></div><div className="stat-box"><p>Value · DEMO</p><strong>{latest.value}</strong></div></div>
          </section>
          <section className="panel-block"><div className="section-head"><h2>ထွက်ဂဏန်းများ</h2><span>နမူနာ</span></div><div className="result-grid">
            {data.results.map((item) => <div key={item.time} className={`tile ${item.time === '12:01 PM' || item.time === '4:30 PM' ? 'featured' : ''}`}><span className="tile-time">{item.time}</span><span className="tile-number">{item.twod}</span><span className="tile-meta">{item.set} · {item.value}</span></div>)}
          </div></section>
          <section className="panel-block"><div className="section-head"><h2>Modern / Internet</h2><span>နမူနာအကွက်</span></div><div className="table-card"><div className="table-header"><span>အချိန်</span><span>Modern</span><span>Internet</span></div><div className="table-row"><span>9:30 AM</span><span>--</span><span>--</span></div><div className="table-row"><span>2:00 PM</span><span>--</span><span>--</span></div></div></section>
          <section className="panel-block"><div className="section-head"><h2>ယနေ့ လက်ဆောင်ဂဏန်း</h2><span>နမူနာ</span></div><div className="gift-grid">{['12', '22', '38', '44', '52', '60'].map((number) => <span key={number} className="gift-pill">{number}</span>)}</div></section>
          <button type="button" className="holiday-link" onClick={() => setPage('holidays')}><span className="holiday-icon">▦</span><span className="holiday-copy"><strong>ပိတ်ရက် ပြက္ခဒိန်</strong><small>နမူနာပြက္ခဒိန်ကို ကြည့်ရန်</small></span><span className="arrow">›</span></button>
        </>}

        {page === 'history' && <PageCard title="2D မှတ်တမ်း" subtitle="စက်ထဲတွင်ပါဝင်သော နမူနာမှတ်တမ်းများသာ ဖြစ်ပါသည်။"><div className="history-list">{['2026-11-12', '2026-11-11', '2026-11-10'].map((date, index) => <div className="history-day" key={date}><strong>{date}</strong><div className="history-numbers">{(index === 0 ? data.results : [...data.results].reverse()).map((item) => <span key={item.time}>{item.time.slice(0, 5)} · {item.twod}</span>)}</div></div>)}</div></PageCard>}
        {page === 'threed' && <PageCard title="3D" subtitle="ဤနေရာတွင်ပြထားသော အချက်အလက်များသည် နမူနာသာဖြစ်ပြီး တရားဝင်/တိုက်ရိုက်ရလဒ် မဟုတ်ပါ။"><div className="three-d-demo"><span>နမူနာ 3D</span><strong>---</strong><small>ဒေတာရင်းမြစ် မချိတ်ဆက်ထားပါ</small></div></PageCard>}
        {page === 'chat' && <PageCard title="ချက်တင်" subtitle="Local demo — မက်ဆေ့ချ်များကို server သို့ ပို့မည်မဟုတ်ပါ။"><div className="chat-list">{messages.map((message, index) => <div className={`chat-message ${index ? 'mine' : ''}`} key={`${index}-${message}`}>{message}</div>)}</div><form className="chat-form" onSubmit={sendMessage}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="မက်ဆေ့ချ်ရေးပါ…" aria-label="မက်ဆေ့ချ်"/><button type="submit">ပို့ရန်</button></form></PageCard>}
        {page === 'settings' && <PageCard title="ဆက်တင်" subtitle="ဤ web app သည် browser ထဲတွင်သာ အလုပ်လုပ်ပါသည်။"><div className="settings-row"><div><strong>အသိပေးချက်များ</strong><small>Demo toggle — notification service မချိတ်ထားပါ</small></div><button className={`toggle ${notifications ? 'on' : ''}`} onClick={() => setNotifications((value) => !value)} aria-pressed={notifications}>{notifications ? 'ဖွင့်' : 'ပိတ်'}</button></div><div className="settings-row"><div><strong>ဒေတာအခြေအနေ</strong><small>Static demo data · API မပါ</small></div><span className="setting-value">Local</span></div><div className="settings-row"><div><strong>နောက်ဆုံးသိမ်းဆည်းချိန်</strong><small>{formatSavedAt(data.savedAt)}</small></div><span className="setting-value">Offline</span></div>{installEvent && <button className="primary-button" onClick={install}>App အဖြစ် ထည့်သွင်းရန်</button>}</PageCard>}
        {page === 'holidays' && <PageCard title="ပိတ်ရက် ပြက္ခဒိန်" subtitle="ပြသထားသည့်ရက်စွဲများသည် နမူနာဖြစ်ပါသည်။"><div className="history-list"><div className="holiday-entry"><span>ပိတ်ရက်</span><strong>နမူနာ ပိတ်ရက်</strong><small>ရက်စွဲ သတ်မှတ်မထားပါ</small></div><button className="secondary-button" onClick={() => setPage('live')}>Live စာမျက်နှာသို့ ပြန်ရန်</button></div></PageCard>}

        <footer className="footer-note"><p>ဤ app သည် web-only နမူနာဖြစ်ပြီး API သို့မဟုတ် live SET data မချိတ်ဆက်ထားပါ။ အချက်အလက်များကို တရားဝင်ရလဒ်အဖြစ် မယူဆပါနှင့်။</p><p className="cache-note">နောက်ဆုံးသိမ်းဆည်းချိန်: {formatSavedAt(data.savedAt)}</p>{installEvent && page !== 'settings' && <button className="install-inline" onClick={install}>App အဖြစ် ထည့်သွင်းရန်</button>}</footer>
      </div>
      <nav className="bottom-nav" aria-label="အဓိကလမ်းညွှန်"><ul>{navItems.map((item) => <li key={item.page}><button className={page === item.page ? 'active' : ''} onClick={() => setPage(item.page)} aria-current={page === item.page ? 'page' : undefined}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button></li>)}</ul></nav>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}

function PageCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="page-card"><h1>{title}</h1><p className="page-subtitle">{subtitle}</p>{children}</section>;
}

export default App;
