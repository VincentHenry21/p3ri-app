import { useEffect, useMemo, useRef, useState } from 'react';
import AuthModal from './components/auth/AuthModal';
import HeroStage from './components/mascot/HeroStage';
import PeriSvg from './components/mascot/PeriSvg';
import JellySticker, { type StickerId } from './components/mascot/JellyStickers';
import { FlameIcon, MovementIcon, NavIcon, SleepMoonIcon, WaterGlassIcon } from './components/icons/P3riIcons';
import { iconThemeForPhase, updateDynamicAppIcon, type IconTheme } from './lib/appIcons';
import QuickActionDock from './components/dashboard/QuickActionDock';
import TodayProgressBanner from './components/dashboard/TodayProgressBanner';
import HabitChecklist, { HABITS } from './components/dashboard/HabitChecklist';
import StreakHeader from './components/tracker/StreakHeader';
import CycleCalendar from './components/tracker/CycleCalendar';
import BentoStatsGrid from './components/tracker/BentoStatsGrid';
import HealthCheckCenter from './components/health/HealthCheckCenter';
import AskPeriCoach from './components/chat/AskPeriCoach';
import {
  addDays, cycleDay, phaseForDay, predictedNextStart, predictedOvulation, todayISO,
} from './lib/cycleEngine';
import {
  downloadFile, emptyLog, exportLogsCsv, getFirebaseConfigText,
  loadLogs, loadProfile, saveLogs, saveProfile, setFirebaseConfigText, setGeminiKey,
  type DailyLog, type Profile,
} from './lib/store';
import {
  initFirebase, onUserChanged, signInWithGoogle, signOutUser, syncDocToFirestore,
} from './lib/firebase';
import type { User } from 'firebase/auth';

export const MOODS = ['Energized', 'Calm', 'Anxious', 'Irritable', 'Brain fog', 'Extra sensitive', 'Cravings', 'Happy', 'Low energy', 'Sleepy', 'Starry', 'Cozy'];

const MOOD_STICKERS: Record<string, StickerId> = {
  Energized: 'sparkle', Calm: 'calm', Anxious: 'sensitive', Irritable: 'dizzy',
  'Brain fog': 'fog', 'Extra sensitive': 'sensitive', Cravings: 'cookie',
  Happy: 'loved', 'Low energy': 'sleepy', Sleepy: 'sleepy', Starry: 'starry', Cozy: 'reader',
};

type Tab = 'home' | 'tracker' | 'health' | 'ask' | 'settings';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [logs, setLogs] = useState<Record<string, DailyLog>>(() => loadLogs());
  const [tab, setTab] = useState<Tab>('home');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [user, setUser] = useState<User | null>(null);
  const [previewDay, setPreviewDay] = useState<number | null>(null);
  const mergedUid = useRef<string | null>(null);
  const [fbNote, setFbNote] = useState('');
  const [apiNote, setApiNote] = useState('');
  const [dataNote, setDataNote] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const today = todayISO();
  const day = profile ? cycleDay(profile.lastPeriodStart, today, profile.averageCycleLength) : 1;
  const phase = profile ? phaseForDay(day, profile.averageCycleLength, profile.averagePeriodLength) : phaseForDay(1, 28, 5);
  const todayLog = logs[today] ?? emptyLog(today);

  useEffect(() => {
    initFirebase();
    return onUserChanged(setUser);
  }, []);

  // Guest-to-account merge (QA checkpoint 3): when a user signs in, push
  // everything logged locally in guest mode into their Firestore documents.
  // Local data stays the source of truth; sync failures are swallowed.
  useEffect(() => {
    if (!user || mergedUid.current === user.uid) return;
    mergedUid.current = user.uid;
    const p = loadProfile();
    if (p) void syncDocToFirestore(user.uid, 'profile', 'profile', p);
    const all = loadLogs();
    for (const [date, log] of Object.entries(all)) {
      void syncDocToFirestore(user.uid, 'dailyLogs', date, log);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.style.setProperty('--topbleed', phase.bleed);
    document.documentElement.style.setProperty('--bg-top-bleed', phase.bleed);
    document.documentElement.style.setProperty('--accent-primary', phase.color);
  }, [phase.bleed, phase.color]);

  // Dynamic home-screen icon: auto-switch by cycle phase, or the manual pick.
  useEffect(() => {
    const theme: IconTheme = profile?.iconAuto !== false
      ? iconThemeForPhase(phase.key)
      : (profile?.iconTheme ?? 'berry');
    updateDynamicAppIcon(theme);
  }, [phase.key, profile?.iconAuto, profile?.iconTheme]);

  const updateProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
    if (user) void syncDocToFirestore(user.uid, 'profile', 'profile', p);
  };

  const updateLog = (date: string, patch: Partial<DailyLog>) => {
    setLogs((prev) => {
      const next = { ...prev, [date]: { ...(prev[date] ?? emptyLog(date)), ...patch } };
      saveLogs(next);
      if (user) void syncDocToFirestore(user.uid, 'dailyLogs', date, next[date]);
      return next;
    });
  };

  const streak = useMemo(() => {
    let n = 0;
    const cur = new Date();
    for (;;) {
      const d = todayISO(cur);
      const l = logs[d];
      if (l && (l.flow || l.symptoms.length > 0 || l.waterMl > 0 || l.completedHabits.length > 0)) { n += 1; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return n;
  }, [logs]);

  const startGuest = (lastPeriodStart: string, cycleLength: number, mascotStyle: 'plush' | 'jelly') => {
    const p: Profile = {
      displayName: '', email: '', createdAt: new Date().toISOString(),
      averageCycleLength: cycleLength, averagePeriodLength: 5,
      lastPeriodStart: lastPeriodStart || todayISO(), mascotStyle, notificationsEnabled: false,
      iconTheme: 'berry', iconAuto: true,
    };
    updateProfile(p);
  };

  if (!profile) return <div className="app app-shell"><AuthModal onGuest={startGuest} /></div>;

  const selLog = logs[selectedDate] ?? emptyLog(selectedDate);
  const doneHabits = todayLog.completedHabits;
  const nextHabit = HABITS.find((h) => !doneHabits.includes(h)) ?? '';
  const avatarInitial = (profile.displayName || user?.email || 'P').trim().charAt(0).toUpperCase() || 'P';
  const navItems = (['home', 'tracker', 'health', 'ask', 'settings'] as Tab[]).map((key) => ({
    key,
    label: key === 'home' ? 'Home' : key === 'tracker' ? 'Tracker' : key === 'health' ? 'Health' : key === 'ask' ? 'Ask Peri' : 'Settings',
    icon: <NavIcon tab={key} active={tab === key} />,
  }));

  return (
    <div className="app app-shell">
      {tab === 'home' ? (
        <header>
          <div className="home-header">
            <h1>Home</h1>
            <div className="home-right">
              <span className="streak-pill">
                <FlameIcon size={16} />
                {streak}
              </span>
              <span className="avatar" aria-label="Profile">{avatarInitial}</span>
            </div>
          </div>
          <div>
            <span className="pill">Day {day} · {phase.label}</span>{' '}
            <span className="pill">{streak} day streak</span>
          </div>
          <h1>Hey {profile.displayName || 'bestie'}, ready for a good day?</h1>
          <p className="status">{user ? `Signed in as ${user.email ?? user.uid}` : 'Guest mode · saved on this device only'}</p>
        </header>
      ) : (
        <header className="compact-header">
          <h2>{tab === 'tracker' ? 'Tracker' : tab === 'health' ? 'Health Check' : tab === 'ask' ? 'Ask Peri' : 'Settings'}</h2>
          <span className="pill compact">Day {day} · {phase.label} · {streak}d streak</span>
        </header>
      )}

      {tab === 'home' && (
        <section>
          <HeroStage
            style={profile.mascotStyle}
            speech={phase.tip}
            context={{
              phase: phase.key,
              symptoms: todayLog.symptoms,
              moods: todayLog.moods,
              flow: todayLog.flow,
              sleepHours: todayLog.sleepHours,
              streak,
              journalDone: todayLog.completedHabits.includes('Write cycle journal'),
            }}
            day={day}
            cycleLength={profile.averageCycleLength}
            color={phase.color}
            onScrub={setPreviewDay}
          />
          {previewDay !== null && (
            <div className="card">
              <b>Arc preview: Day {previewDay}</b>
              <p>
                {phaseForDay(previewDay, profile.averageCycleLength, profile.averagePeriodLength).label} ·{' '}
                {addDays(profile.lastPeriodStart, previewDay - 1)}
                {previewDay === profile.averageCycleLength - 14 ? ' · Ovulation day ' : ''}
                {previewDay >= profile.averageCycleLength - 14 - 5 && previewDay < profile.averageCycleLength - 14 ? ' · Fertile window' : ''}{previewDay === profile.averageCycleLength - 14 && (<svg viewBox="0 0 24 24" width="13" height="13" fill="#FBBF24" aria-hidden="true" style={{ verticalAlign: 'middle' }}><path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.4-6.3-4.6-6.3 4.6L8 13.6 2 9.2h7.6z" /></svg>)}
              </p>
              <button type="button" className="ghost small" onClick={() => setPreviewDay(null)}>Clear preview</button>
            </div>
          )}
          <p className="status" style={{ textAlign: 'center' }}>Drag along the arc to preview another cycle day.</p>
          <p style={{ textAlign: 'center' }} className="status">Next period: {predictedNextStart(profile.lastPeriodStart, profile.averageCycleLength)} · Ovulation: {predictedOvulation(profile.lastPeriodStart, profile.averageCycleLength)} · Cycle: {profile.averageCycleLength} days</p>
          <QuickActionDock log={todayLog} onChange={(patch) => updateLog(today, patch)} />
          <div className="bento-home">
            <div className="bento-card"><span className="bento-icon"><WaterGlassIcon size={30} /></span><span className="bento-label">Water</span><b>{Math.round(todayLog.waterMl / 250)} Glasses</b><span className="bento-sub">{(todayLog.waterMl / 1000).toFixed(1)} L</span></div>
            <div className="bento-card"><span className="bento-icon"><SleepMoonIcon size={30} /></span><span className="bento-label">Sleep</span><b>{todayLog.sleepHours} Hours</b><span className="bento-sub">of 8 h goal</span></div>
            <div className="bento-card"><span className="bento-icon"><MovementIcon size={30} /></span><span className="bento-label">Exercise</span><b>{todayLog.exerciseMinutes} Mins</b><span className="bento-sub">of 60 min goal</span></div>
          </div>
          <TodayProgressBanner done={doneHabits.length} total={HABITS.length} next={nextHabit} style={profile.mascotStyle} />
          <div className="card">
            <b>Coach Peri insight</b>
            <p>Logging symptoms for 3 days in a row helps Peri calibrate your predictions. {phase.tip}</p>
            <button type="button" onClick={() => setTab('ask')}>Chat with Peri</button>
          </div>
          <HabitChecklist
            completed={doneHabits}
            onToggle={(habit, done) => updateLog(today, { completedHabits: done ? [...doneHabits, habit] : doneHabits.filter((h) => h !== habit) })}
          />
          <button type="button" onClick={() => updateProfile({ ...profile, lastPeriodStart: today })}>Mark today as period start</button>
        </section>
      )}

      {tab === 'tracker' && (
        <section>
          <StreakHeader logs={logs} streak={streak} style={profile.mascotStyle} />
          <CycleCalendar
            logs={logs} lastPeriodStart={profile.lastPeriodStart} cycleLength={profile.averageCycleLength}
            periodLength={profile.averagePeriodLength} selected={selectedDate} onSelect={setSelectedDate}
          />
          <BentoStatsGrid logs={logs} today={todayLog} />
          <div className="card">
            <b>Daily log</b>
            <p className="status">Logging: {selectedDate} · Cycle day {cycleDay(profile.lastPeriodStart, selectedDate, profile.averageCycleLength)} · {phaseForDay(cycleDay(profile.lastPeriodStart, selectedDate, profile.averageCycleLength), profile.averageCycleLength, profile.averagePeriodLength).label}</p>
            <label>Flow</label>
            <div className="segment-row">
              {(['', 'Spotting', 'Light', 'Medium', 'Heavy', 'Super Heavy'] as const).map((f) => (
                <button type="button" key={f || 'none'} className={`chip${selLog.flow === f ? ' on' : ''}`} onClick={() => updateLog(selectedDate, { flow: f, flowLevel: ['', 'Spotting', 'Light', 'Medium', 'Heavy', 'Super Heavy'].indexOf(f) })}>
                  <span className="flow-dot" style={{ background: ['', '#FBCFE8', '#F9A8D4', '#EC4899', '#DB2777', '#BE185D'][['', 'Spotting', 'Light', 'Medium', 'Heavy', 'Super Heavy'].indexOf(f)] }} />
                  {f || 'None'}
                </button>
              ))}
            </div>
            <label>Pain (0 to 10): {selLog.pain}</label>
            <input type="range" className="pain-slider" min={0} max={10} value={selLog.pain} onChange={(e) => updateLog(selectedDate, { pain: Number(e.target.value) })} />
            <label>Discharge</label>
            <div className="segment-row">
              {(['', 'Dry', 'Sticky', 'Creamy', 'Egg-white'] as const).map((d) => (
                <button type="button" key={d || 'none'} className={`chip${selLog.discharge === d ? ' on' : ''}`} onClick={() => updateLog(selectedDate, { discharge: d })}>
                  <span className="flow-dot" style={{ background: ['', '#FDE68A', '#FCD34D', '#FBBF24', '#38BDF8'][['', 'Dry', 'Sticky', 'Creamy', 'Egg-white'].indexOf(d)] }} />
                  {d || 'None'}
                </button>
              ))}
            </div>
            <label>Mood</label>
            <div className="mood-strip">
              {MOODS.map((m) => (
                <button type="button" key={m} className={`chip${selLog.moods.includes(m) ? ' on' : ''}`} onClick={() => updateLog(selectedDate, { moods: selLog.moods.includes(m) ? selLog.moods.filter((x) => x !== m) : [...selLog.moods, m] })}>{MOOD_STICKERS[m] && (<span className="mood-sticker"><JellySticker id={MOOD_STICKERS[m]} size={20} /></span>)}{m}</button>
              ))}
            </div>
            <label>Notes</label>
            <textarea rows={3} value={selLog.notes} onChange={(e) => updateLog(selectedDate, { notes: e.target.value })} />
            <p className="status">Logs save automatically on this device, and sync to your Firestore when you are signed in.</p>
          </div>
        </section>
      )}

      {tab === 'health' && (
        <section>
          <HealthCheckCenter
            profile={profile} todayLog={todayLog} cycleDay={day}
            onToggleSymptom={(s) => updateLog(today, { symptoms: todayLog.symptoms.includes(s) ? todayLog.symptoms.filter((x) => x !== s) : [...todayLog.symptoms, s] })}
          />
        </section>
      )}

      {tab === 'ask' && (
        <section>
          <AskPeriCoach
            phase={phase} cycleDay={day} mascotStyle={profile.mascotStyle}
            logSummary={`Today's log: flow ${todayLog.flow || 'not logged'}, sleep ${todayLog.sleepHours}h, water ${todayLog.waterMl}ml, exercise ${todayLog.exerciseMinutes}min, symptoms ${todayLog.symptoms.join(', ') || 'none'}.`}
            onOpenHealth={() => setTab('health')}
          />
        </section>
      )}

      {tab === 'settings' && (
        <section>
          <div className="card profile-card">
            <b>Profile &amp; Cycle</b>
            <label>Your Name</label>
            <input value={profile.displayName} onChange={(e) => updateProfile({ ...profile, displayName: e.target.value })} />
            <label>Last Period Start</label>
            <input type="date" className="date-input" value={profile.lastPeriodStart} onChange={(e) => updateProfile({ ...profile, lastPeriodStart: e.target.value })} />
            <label>Cycle Length</label>
            <Stepper value={profile.averageCycleLength} min={21} max={45} suffix="d" onChange={(v) => updateProfile({ ...profile, averageCycleLength: v })} />
            <label>Period Length</label>
            <Stepper value={profile.averagePeriodLength} min={2} max={10} suffix="d" onChange={(v) => updateProfile({ ...profile, averagePeriodLength: v })} />
            <label>Peri 3D Mascot Style</label>
            <div className="mascot-picks">
              <button type="button" className={`mascot-pick${profile.mascotStyle === 'plush' ? ' on' : ''}`} onClick={() => updateProfile({ ...profile, mascotStyle: 'plush' })} aria-pressed={profile.mascotStyle === 'plush'}>
                <span className="mascot-preview"><PeriSvg style="plush" small /></span>Plush 3D Buddy
              </button>
              <button type="button" className={`mascot-pick${profile.mascotStyle === 'jelly' ? ' on' : ''}`} onClick={() => updateProfile({ ...profile, mascotStyle: 'jelly' })} aria-pressed={profile.mascotStyle === 'jelly'}>
                <span className="mascot-preview"><PeriSvg style="jelly" small /></span>Glowing Jelly Cloud
              </button>
            </div>
            <p className="status">Settings save automatically.</p>
            {user && <button type="button" className="ghost" onClick={() => void signOutUser()}>Sign out</button>}
          </div>

          <div className="card">
            <b>App Icon</b>
            <label className="icon-toggle">
              <input type="checkbox" checked={profile.iconAuto !== false} onChange={(e) => updateProfile({ ...profile, iconAuto: e.target.checked })} />
              <span>Auto-Switch App Icon by Cycle Phase</span>
            </label>
            <div className="icon-picks">
              {([
                { key: 'berry' as IconTheme, label: 'Berry Flame', swatch: 'linear-gradient(135deg,#FF2A5F,#FF2E7E,#FF62E6)' },
                { key: 'cloudy' as IconTheme, label: 'Cloudy Peek', swatch: 'linear-gradient(135deg,#2538FF,#4659FF,#586BFF)' },
                { key: 'amber' as IconTheme, label: 'Amber Luteal', swatch: 'linear-gradient(135deg,#FF8C3B,#F97316)' },
              ]).map((opt) => (
                <button
                  key={opt.key} type="button"
                  className={`icon-pick${profile.iconAuto === false && profile.iconTheme === opt.key ? ' on' : ''}`}
                  onClick={() => updateProfile({ ...profile, iconTheme: opt.key, iconAuto: false })}
                  aria-pressed={profile.iconAuto === false && profile.iconTheme === opt.key}
                >
                  <span className="icon-swatch" style={{ background: opt.swatch }} />
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="status">Auto-switch follows your phase: Berry Flame on menstrual days, Cloudy Peek on follicular and ovulatory days, Amber Luteal on luteal days. Picking one manually turns auto-switch off.</p>
          </div>

          <div className="card">
            <b>Cloud Sync &amp; Account</b>
            <p className="status">{user ? `Signed in as ${user.email ?? user.uid}` : 'Guest mode · saved on this device only. Sign in to sync your data to the cloud.'}</p>
            {!user && (
              <button type="button" onClick={async () => { setGoogleError(''); try { await signInWithGoogle(); } catch (e) { setGoogleError(e instanceof Error ? e.message : 'Google sign-in failed.'); } }}>
                <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 8 }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" /></svg></span>
                Continue with Google
              </button>
            )}
            {googleError && <p className="bad">{googleError}</p>}
            <button type="button" className="ghost accordion-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>Advanced: Custom Firebase &amp; Gemini API Keys {showAdvanced ? '▾' : '▸'}</button>
            {showAdvanced && (
              <div className="advanced-drawer">
                <p className="status">Optional overrides, stored only in this browser. Leave these empty to use the built-in setup.</p>
                <FirebaseConfigEditor onSaved={(msg) => setFbNote(msg)} />
                {fbNote && <p className="status">{fbNote}</p>}
                <ApiKeyEditor onSaved={(msg) => setApiNote(msg)} />
                {apiNote && <p className="status">{apiNote}</p>}
              </div>
            )}
            <button type="button" className="ghost" onClick={() => downloadFile('p3ri-export.json', JSON.stringify({ profile, logs }, null, 2))}>Export Backup JSON</button>
          </div>

          <div className="card">
            <b>Data · local files</b>
            <p className="status">Save a backup file to your device, or restore one later. No account or cloud needed.</p>
            <button type="button" className="ghost" onClick={() => downloadFile('p3ri-export.csv', exportLogsCsv(logs))}>Export CSV</button>{' '}
            <label>Restore from a local JSON file</label>
            <input type="file" accept=".json,application/json" onChange={(e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const data = JSON.parse(String(reader.result)) as { profile?: typeof profile; logs?: typeof logs };
                  if (data.profile) { setProfile(data.profile); saveProfile(data.profile); }
                  if (data.logs) { setLogs(data.logs); saveLogs(data.logs); }
                  setDataNote('Local file restored on this device.');
                } catch { setDataNote('That file did not parse as a P3RI export.'); }
              };
              reader.readAsText(file);
            }} />{' '}
            <button type="button" className="ghost" onClick={() => {
              const next = { ...logs };
              for (let i = 0; i < 90; i++) {
                const d = addDays(today, -i);
                const lg = next[d] ?? emptyLog(d);
                const cd = cycleDay(profile.lastPeriodStart, d, profile.averageCycleLength);
                if (cd <= 5) { lg.flow = ['Light', 'Medium', 'Medium', 'Heavy', 'Light'][cd - 1]; lg.flowLevel = cd; }
                if (i % 3 === 0) lg.waterMl = 1500;
                if (i % 2 === 0) lg.sleepHours = 7.5;
                next[d] = lg;
              }
              setLogs(next); saveLogs(next); setDataNote('Sample 3-month history seeded locally.');
            }}>Seed sample 3-month history</button>{' '}
            <button type="button" className="ghost" onClick={() => {
              if (window.confirm('Clear all local P3RI data on this device?')) {
                localStorage.removeItem('p3ri-profile'); localStorage.removeItem('p3ri-logs'); window.location.reload();
              }
            }}>Clear all local data</button>
            <p className="status">{dataNote}</p>
          </div>
          <p className="status">P3RI · Local-first. Health information here is educational only and is not medical advice. If a pattern worries you, check in with a healthcare provider.</p>
          <p className="status">Developed by H3Nz</p>
        </section>
      )}
      <nav className="nav" aria-label="Main navigation">
        {navItems.map(({ key, label, icon }) => (
          <button key={key} type="button" className={tab === key ? 'on' : ''} onClick={() => setTab(key)} aria-label={label}>{icon}<span>{label}</span></button>
        ))}
      </nav>
    </div>
  );
}

function Stepper({ value, min, max, suffix, onChange }: { value: number; min: number; max: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span>{value}{suffix}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function FirebaseConfigEditor({ onSaved }: { onSaved: (msg: string) => void }) {
  const [text, setText] = useState(getFirebaseConfigText());
  return (
    <div>
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder='{"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}' />
      <button type="button" onClick={() => {
        try {
          const cfg = JSON.parse(text) as { apiKey?: string; authDomain?: string; projectId?: string; appId?: string };
          if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) { onSaved('That config is missing apiKey, authDomain, projectId, or appId.'); return; }
          setFirebaseConfigText(text);
          onSaved('Custom Firebase config saved. Reload the page to connect.');
        } catch { onSaved('That JSON did not parse. Paste the full Firebase web config object.'); }
      }}>Save Firebase config</button>{' '}
      <button type="button" className="ghost" onClick={() => { setFirebaseConfigText(''); setText(''); onSaved('Firebase config cleared. Reload the page to return to guest mode.'); }}>Clear config</button>
    </div>
  );
}

function ApiKeyEditor({ onSaved }: { onSaved: (msg: string) => void }) {
  const [key, setKey] = useState('');
  return (
    <div>
      <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Gemini API key, optional" />
      <button type="button" onClick={() => { if (!key.trim()) return; setGeminiKey(key.trim()); setKey(''); onSaved('API key saved on this device only.'); }}>Save key on this device</button>{' '}
      <button type="button" className="ghost" onClick={() => { setGeminiKey(''); onSaved('API key cleared.'); }}>Clear key</button>
    </div>
  );
}
