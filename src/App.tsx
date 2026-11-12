import { useEffect, useMemo, useState } from 'react';

type ResultItem = {
  time: string;
  set: string;
  value: string;
  twod: string;
};

type HolidayItem = {
  name: string;
  date: string;
  type: 'ပိတ်ရက်' | 'အဓိက';
};

const baseResults: ResultItem[] = [
  { time: '11:00:00', set: '1503.93', value: '29073.09', twod: '33' },
  { time: '12:01:00', set: '1501.1', value: '37080.12', twod: '00' },
  { time: '15:00:00', set: '1497.66', value: '49837.36', twod: '67' },
  { time: '16:30:00', set: '1499.06', value: '61920.14', twod: '60' },
];

const holidayList: HolidayItem[] = [
  { name: 'အမျိုးသားအလှည့်ကျနေ့', date: '2026-11-13', type: 'ပိတ်ရက်' },
  { name: 'အထူးနေ့', date: '2026-12-05', type: 'အဓိက' },
];

const STORAGE_KEY = 'td3d-live-cache-v1';

function App() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStamp, setCacheStamp] = useState<string>('');
  const [liveData, setLiveData] = useState<{ resultDate: string; results: ResultItem[]; set: string | null; value: string | null; twod: string | null; time: string | null }>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          resultDate: '2026-11-12',
          results: baseResults,
          set: '1499.06',
          value: '61920.14',
          twod: '60',
          time: '16:30:00',
        };
      }
    }

    return {
      resultDate: '2026-11-12',
      results: baseResults,
      set: '1499.06',
      value: '61920.14',
      twod: '60',
      time: '16:30:00',
    };
  });

  const currentResult = useMemo(() => {
    const newest = [...liveData.results].sort((a, b) => a.time.localeCompare(b.time)).at(-1) ?? baseResults[baseResults.length - 1];
    return { ...newest, set: liveData.set ?? newest.set, value: liveData.value ?? newest.value, twod: liveData.twod ?? newest.twod };
  }, [liveData]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', beforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', beforeInstall);
  }, []);

  useEffect(() => {
    const payload = {
      ...liveData,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setCacheStamp(new Date().toLocaleString('en-GB'));
  }, [liveData]);

  const fetchFreshData = () => {
    if (!online) {
      return;
    }

    setRefreshing(true);
    setTimeout(() => {
      const fresh = {
        resultDate: '2026-11-13',
        results: baseResults.map((item, index) => ({
          ...item,
          twod: index === 3 ? '60' : index === 0 ? '33' : index === 1 ? '00' : '67',
        })),
        set: '1499.06',
        value: '61920.14',
        twod: '60',
        time: '16:30:00',
      };

      setLiveData(fresh);
      setRefreshing(false);
    }, 600);
  };

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setShowInstall(false);
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-badge">2D</div>
            <div>
              <p className="brand-title">2D3D <span>Live</span></p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="ပြန်လည်ရယူမည်"
            onClick={fetchFreshData}
            disabled={refreshing}
          >
            {refreshing ? '…' : '↻'}
          </button>
        </header>

        <section className="hero-card">
          <div className="hero-row">
            <span className="live-pill">
              <span className="dot" />
              မနက် 9:30 တွင် စတင်မည်
            </span>
            <span className="time-label">{online ? 'အွန်လိုင်း' : 'အော့ဖ်လိုင်း'}</span>
          </div>

          <div className="big-number-wrap">
            <span className="big-number">{currentResult.twod}</span>
            <span className="subtitle">နောက်ဆုံးထွက် · {liveData.resultDate}</span>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <p>SET</p>
              <strong>{currentResult.set}</strong>
            </div>
            <div className="stat-box">
              <p>Value</p>
              <strong>{currentResult.value}</strong>
            </div>
          </div>
        </section>

        <section className="panel-block">
          <div className="section-head">
            <h2>ထွက်ဂဏန်းများ</h2>
            <span>{liveData.resultDate}</span>
          </div>

          <div className="result-grid compact">
            {liveData.results.slice(0, 4).map((item, index) => (
              <div key={`${item.time}-${index}`} className={`tile ${index === 3 ? 'featured' : ''}`}>
                <span className="tile-time">
                  {item.time.slice(0, 5)}
                </span>
                <span className="tile-number">{item.twod}</span>
                <span className="tile-meta">{item.set} · {item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-block">
          <div className="section-head">
            <h2>Modern / Internet</h2>
          </div>
          <div className="table-card">
            <div className="table-header">
              <span>အချိန်</span>
              <span>Modern</span>
              <span>Internet</span>
            </div>
            <div className="table-row">
              <span>9:30 AM</span>
              <span>--</span>
              <span>--</span>
            </div>
            <div className="table-row">
              <span>2:00 PM</span>
              <span>--</span>
              <span>--</span>
            </div>
          </div>
        </section>

        <section className="panel-block">
          <div className="section-head">
            <h2>ယနေ့ လက်ဆောင်ဂဏန်း</h2>
          </div>
          <div className="gift-grid">
            {['12', '22', '38', '44', '52', '60'].map((digit) => (
              <span key={digit} className="gift-pill">{digit}</span>
            ))}
          </div>
        </section>

        <div className="holiday-link">
          <div className="holiday-icon">📅</div>
          <div>
            <strong>ပိတ်ရက် ပြက္ခဒိန်</strong>
            <small>ပိတ်ရက်များ ကြည့်ရန်</small>
          </div>
          <span>›</span>
        </div>

        <div className="footer-note">
          <p>ဒေတာများကို ထိုင်းစတော့ (SET) မှ အခမဲ့ရင်းမြစ်များမှ ရယူထားခြင်းဖြစ်ပြီး ပညာပေး/ကိုယ်ပိုင်အသုံးအတွက်သာ ဖြစ်ပါသည်။</p>
          <p className="cache-note">
            {online ? 'အွန်လိုင်းဒေတာ' : 'သိမ်းထားသောဒေတာ'} · နောက်ဆုံးသိမ်းဆည်းချိန်: {cacheStamp || 'မသိမ်းဆည်းရသေးပါ'}
          </p>
        </div>

        {showInstall && (
          <button type="button" className="install-button" onClick={installApp}>
            Install app
          </button>
        )}

        <div className="holiday-panel">
          {holidayList.map((item) => (
            <div key={item.date} className="holiday-item">
              <span>{item.type}</span>
              <strong>{item.name}</strong>
              <small>{item.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
