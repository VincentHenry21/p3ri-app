// Local-first store. Everything persists to localStorage immediately.
// When Firebase is configured and a user is signed in, the same documents
// are written to Firestore (best effort, never blocking the UI on failure).

export interface Profile {
  displayName: string;
  email: string;
  createdAt: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStart: string;
  mascotStyle: 'plush' | 'jelly';
  notificationsEnabled: boolean;
  iconTheme?: 'berry' | 'cloudy' | 'amber';
  iconAuto?: boolean;
}

export interface DailyLog {
  date: string;
  flowLevel: number; // 0 none, 1 spotting, 2 light, 3 medium, 4 heavy, 5 super heavy
  flow: string;
  symptoms: string[];
  moods: string[];
  waterMl: number;
  sleepHours: number;
  exerciseMinutes: number;
  exerciseType: string;
  pain: number;
  discharge: string;
  notes: string;
  completedHabits: string[];
}

export interface HealthCheck {
  id: string;
  date: string;
  type: 'regularity' | 'pcos_screen' | 'breast_exam' | 'iron_check';
  score: number;
  findings: string;
  recommendations: string;
}

export const FLOW_LABELS = ['', 'Spotting', 'Light', 'Medium', 'Heavy', 'Super Heavy'];

export function emptyLog(date: string): DailyLog {
  return {
    date, flowLevel: 0, flow: '', symptoms: [], moods: [],
    waterMl: 0, sleepHours: 0, exerciseMinutes: 0, exerciseType: '',
    pain: 0, discharge: '', notes: '', completedHabits: [],
  };
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/blocked: app still works in memory */ }
}

export function loadProfile(): Profile | null {
  return read<Profile | null>('p3ri-profile', null);
}

export function saveProfile(p: Profile): void {
  write('p3ri-profile', p);
}

export function loadLogs(): Record<string, DailyLog> {
  return read<Record<string, DailyLog>>('p3ri-logs', {});
}

export function saveLogs(logs: Record<string, DailyLog>): void {
  write('p3ri-logs', logs);
}

export function loadHealthChecks(): HealthCheck[] {
  return read<HealthCheck[]>('p3ri-health-checks', []);
}

export function saveHealthChecks(checks: HealthCheck[]): void {
  write('p3ri-health-checks', checks);
}

/** API key / Firebase config helpers: browser localStorage only, never in code. */
export function getGeminiKey(): string {
  try { return localStorage.getItem('p3ri-gemini-key') || ''; } catch { return ''; }
}
export function setGeminiKey(key: string): void {
  try {
    if (key) localStorage.setItem('p3ri-gemini-key', key);
    else localStorage.removeItem('p3ri-gemini-key');
  } catch { /* ignore */ }
}
export function getFirebaseConfigText(): string {
  try { return localStorage.getItem('p3ri-firebase-config') || ''; } catch { return ''; }
}
export function setFirebaseConfigText(text: string): void {
  try {
    if (text) localStorage.setItem('p3ri-firebase-config', text);
    else localStorage.removeItem('p3ri-firebase-config');
  } catch { /* ignore */ }
}

export function exportLogsCsv(logs: Record<string, DailyLog>): string {
  const rows = ['date,flow,pain,water_ml,sleep_h,exercise_min,symptoms,moods'];
  for (const date of Object.keys(logs).sort()) {
    const l = logs[date];
    rows.push([date, l.flow, l.pain, l.waterMl, l.sleepHours, l.exerciseMinutes,
      `"${l.symptoms.join(';')}"`, `"${l.moods.join(';')}"`].join(','));
  }
  return rows.join('\n');
}

export function downloadFile(name: string, text: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
