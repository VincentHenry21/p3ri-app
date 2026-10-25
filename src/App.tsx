import { useEffect, useMemo, useRef, useState } from 'react';
import AuthModal from './components/auth/AuthModal';
import PeriMascot3D from './components/mascot/PeriMascot3D';
import CycleArcGauge from './components/mascot/CycleArcGauge';
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
  downloadFile, emptyLog, exportLogsCsv, getFirebaseConfigText, getGeminiKey,
  loadLogs, loadProfile, saveLogs, saveProfile, setFirebaseConfigText, setGeminiKey,
  type DailyLog, type Profile,
} from './lib/store';
import {
  firebaseStatus, initFirebase, onUserChanged, signOutUser, syncDocToFirestore,
} from './lib/firebase';
import type { User } from 'firebase/auth';

export const MOODS = ['Energized', 'Calm', 'Anxious', 'Irritable', 'Brain fog', 'Extra sensitive', 'Cravings', 'Happy', 'Low energy', 'Sleepy', 'Starry', 'Cozy'];

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
  }, [phase.bleed]);

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
    };
    updateProfile(p);
  };

  if (!profile) return <div className="app"><AuthModal onGuest={startGuest} /></div>;

  const selLog = logs[selectedDate] ?? emptyLog(selectedDate);
  const doneHabits = todayLog.completedHabits;
  const nextHabit = HABITS.find((h) => !doneHabits.includes(h)) ?? '';

  return (
    <div className="app">
      <header>
        <div>
          <span className="pill">Day {day} · {phase.label}</span>{' '}
          <span className="pill">{streak} day streak</span>
        </div>
        <h1>Hey {profile.displayName || 'bestie'}, ready for a good day?</h1>
        <p className="status">{user ? `Signed in as ${user.email ?? user.uid}` : firebaseStatus().projectId ? 'Firebase config saved on this device' : 'Guest mode · saved on this device only'}</p>
      </header>

      {tab === 'home' && (
        <section>
          <PeriMascot3D
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
          />
          <CycleArcGauge day={day} cycleLength={profile.averageCycleLength} color={phase.color} onScrub={setPreviewDay} />
          {previewDay !== null && (
            <div className="card">
              <b>Arc preview: Day {previewDay}</b>
              <p>
                {phaseForDay(previewDay, profile.averageCycleLength, profile.averagePeriodLength).label} ·{' '}
                {addDays(profile.lastPeriodStart, previewDay - 1)}
                {previewDay === profile.averageCycleLength - 14 ? ' · Ovulation day ✦' : ''}
                {previewDay >= profile.averageCycleLength - 14 - 5 && previewDay < profile.averageCycleLength - 14 ? ' · Fertile window' : ''}
              </p>
              <button type="button" className="ghost small" onClick={() => setPreviewDay(null)}>Clear preview</button>
            </div>
          )}
          <p className="status" style={{ textAlign: 'center' }}>Drag along the arc to preview another cycle day.</p>
          <p style={{ textAlign: 'center' }} className="status">Next period: {predictedNextStart(profile.lastPeriodStart, profile.averageCycleLength)} · Ovulation: {predictedOvulation(profile.lastPeriodStart, profile.averageCycleLength)} · Cycle: {profile.averageCycleLength} days</p>
          <QuickActionDock log={todayLog} onChange={(patch) => updateLog(today, patch)} />
          <TodayProgressBanner done={doneHabits.length} total={HABITS.length} next={nextHabit} />
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
          <h2>Tracker</h2>
          <StreakHeader logs={logs} streak={streak} />
          <CycleCalendar
            logs={logs} lastPeriodStart={profile.lastPeriodStart} cycleLength={profile.averageCycleLength}
            periodLength={profile.averagePeriodLength} selected={selectedDate} onSelect={setSelectedDate}
          />
          <div className="card">
            <b>Daily log</b>
            <p className="status">Logging: {selectedDate} · Cycle day {cycleDay(profile.lastPeriodStart, selectedDate, profile.averageCycleLength)} · {phaseForDay(cycleDay(profile.lastPeriodStart, selectedDate, profile.averageCycleLength), profile.averageCycleLength, profile.averagePeriodLength).label}</p>
            <label>Flow</label>
            <select value={selLog.flow} onChange={(e) => updateLog(selectedDate, { flow: e.target.value, flowLevel: ['', 'Spotting', 'Light', 'Medium', 'Heavy', 'Super Heavy'].indexOf(e.target.value) })}>
              <option value="">None</option><option>Spotting</option><option>Light</option><option>Medium</option><option>Heavy</option><option>Super Heavy</option>
            </select>
            <label>Pain (0 to 10): {selLog.pain}</label>
            <input type="range" min={0} max={10} value={selLog.pain} onChange={(e) => updateLog(selectedDate, { pain: Number(e.target.value) })} />
            <label>Discharge</label>
            <select value={selLog.discharge} onChange={(e) => updateLog(selectedDate, { discharge: e.target.value })}>
              <option value="">None</option><option>Dry</option><option>Sticky</option><option>Creamy</option><option>Egg-white</option>
            </select>
            <label>Mood</label>
            <div>
              {MOODS.map((m) => (
                <button type="button" key={m} className={`chip${selLog.moods.includes(m) ? ' on' : ''}`} onClick={() => updateLog(selectedDate, { moods: selLog.moods.includes(m) ? selLog.moods.filter((x) => x !== m) : [...selLog.moods, m] })}>{m}</button>
              ))}
            </div>
            <label>Notes</label>
            <textarea rows={3} value={selLog.notes} onChange={(e) => updateLog(selectedDate, { notes: e.target.value })} />
            <p className="status">Logs save automatically on this device, and sync to your Firestore when you are signed in.</p>
          </div>
          <BentoStatsGrid logs={logs} today={todayLog} />
        </section>
      )}

      {tab === 'health' && (
        <section>
          <h2>Health Check</h2>
          <HealthCheckCenter
            profile={profile} todayLog={todayLog} cycleDay={day}
            onToggleSymptom={(s) => updateLog(today, { symptoms: todayLog.symptoms.includes(s) ? todayLog.symptoms.filter((x) => x !== s) : [...todayLog.symptoms, s] })}
          />
        </section>
      )}

      {tab === 'ask' && (
        <section>
          <h2>Ask Peri</h2>
          <AskPeriCoach phase={phase} cycleDay={day} onOpenHealth={() => setTab('health')} />
        </section>
      )}

      {tab === 'settings' && (
        <section>
          <h2>Settings</h2>
          <div className="card">
            <b>Profile and cycle</b>
            <label>Name</label>
            <input value={profile.displayName} onChange={(e) => updateProfile({ ...profile, displayName: e.target.value })} />
            <label>Last period start</label>
            <input type="date" value={profile.lastPeriodStart} onChange={(e) => updateProfile({ ...profile, lastPeriodStart: e.target.value })} />
            <label>Average cycle length (days)</label>
            <input type="number" min={21} max={45} value={profile.averageCycleLength} onChange={(e) => updateProfile({ ...profile, averageCycleLength: Number(e.target.value) || 28 })} />
            <label>Average period length (days)</label>
            <input type="number" min={2} max={10} value={profile.averagePeriodLength} onChange={(e) => updateProfile({ ...profile, averagePeriodLength: Number(e.target.value) || 5 })} />
            <label>Peri style</label>
            <select value={profile.mascotStyle} onChange={(e) => updateProfile({ ...profile, mascotStyle: e.target.value as 'plush' | 'jelly' })}>
              <option value="plush">Plush Peri</option>
              <option value="jelly">Jelly Cloud Peri</option>
            </select>
            <p className="status">Settings save automatically.</p>
            {user && <button type="button" className="ghost" onClick={() => void signOutUser()}>Sign out</button>}
          </div>

          <div className="card">
            <b>Saved locally, no Firebase needed</b>
            <p className="status">Your profile, logs, and health checks live on this device in local storage. The app works fully without any Firebase account. Firebase below is only an optional cloud sync.</p>
          </div>

          <div className="card">
            <b>Optional cloud sync (Firebase, not required)</b>
            <p className="status">Only if you want cloud sync: paste your Firebase web config JSON here. It is stored only in this browser (localStorage), never sent to Muse or committed anywhere. Live Google and email sign-in need a real Firebase project with those methods enabled. Reload the page after saving for the new config to take effect. Without it, everything still saves locally.</p>
            <FirebaseConfigEditor onSaved={(msg) => setFbNote(msg)} />
            <p className="status">{fbNote || (firebaseStatus().projectId ? `Config saved for project: ${firebaseStatus().projectId}` : 'No Firebase config saved. App runs in local guest mode.')}</p>
          </div>

          <div className="card">
            <b>Ask Peri API key (optional)</b>
            <p className="status">Stored only in this browser. Never paste a key in chat. Clear it any time.</p>
            <ApiKeyEditor onSaved={(msg) => setApiNote(msg)} />
            <p className="status">{apiNote || (getGeminiKey() ? 'API key saved on this device.' : 'No API key saved. Ask Peri uses rule-based answers.')}</p>
          </div>

          <div className="card">
            <b>Data · local files</b>
            <p className="status">Save a backup file to your device, or restore one later. No account or cloud needed.</p>
            <button type="button" onClick={() => downloadFile('p3ri-export.json', JSON.stringify({ profile, logs }, null, 2))}>Export JSON</button>{' '}
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
        </section>
      )}

      <nav className="nav" aria-label="Main navigation">
        {([['home', '🏠', 'Home'], ['tracker', '📅', 'Tracker'], ['health', '🩺', 'Health'], ['ask', '💬', 'Ask Peri'], ['settings', '⚙️', 'Settings']] as const).map(([key, icon, label]) => (
          <button key={key} type="button" className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>{icon}<br />{label}</button>
        ))}
      </nav>
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
          onSaved('Firebase config saved on this device. Reload the page to connect.');
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
