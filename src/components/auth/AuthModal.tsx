import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, isFirebaseConfigured } from '../../lib/firebase';

/**
 * Frictionless auth: 1-tap guest, 3-question onboarding, Google popup and
 * email/password. Guest mode works with no Firebase at all; the Firebase
 * buttons explain clearly when no config is present instead of failing silently.
 */
export default function AuthModal({ onGuest }: { onGuest: (lastPeriodStart: string, cycleLength: number, mascotStyle: 'plush' | 'jelly') => void }) {
  const [last, setLast] = useState('');
  const [cycle, setCycle] = useState(28);
  const [mascot, setMascot] = useState<'plush' | 'jelly'>('plush');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const friendly = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Something went wrong';
    if (msg.includes('auth/invalid-credential')) return 'That email or password does not match. Try again or sign up.';
    if (msg.includes('auth/user-not-found')) return 'No account with that email. Try signing up.';
    if (msg.includes('auth/email-already-in-use')) return 'That email already has an account. Try signing in.';
    if (msg.includes('auth/weak-password')) return 'Password needs at least 6 characters.';
    return msg;
  };

  const run = async (fn: () => Promise<void>) => {
    setError('');
    try { await fn(); } catch (e) { setError(friendly(e)); }
  };

  return (
    <div className="overlay" role="dialog" aria-label="Welcome to P3RI">
      <div className="sheet">
        <h2>Welcome to P3RI</h2>
        <p>Start in guest mode in seconds, or sign in with Google to sync. Google sign-in is built in, no setup needed.</p>
        <label>When did your last period start?</label>
        <input type="date" value={last} onChange={(e) => setLast(e.target.value)} />
        <label>Average cycle length? (default 28)</label>
        <input type="number" min={21} max={45} value={cycle} onChange={(e) => setCycle(Number(e.target.value) || 28)} />
        <label>Pick your Peri style</label>
        <select value={mascot} onChange={(e) => setMascot(e.target.value as 'plush' | 'jelly')}>
          <option value="plush">Plush Peri</option>
          <option value="jelly">Jelly Cloud Peri</option>
        </select>
        <button type="button" onClick={() => onGuest(last, cycle, mascot)}>Continue in Guest / Quick Mode</button>
        <button type="button" className="ghost" onClick={() => onGuest('', 28, 'plush')}>Skip, use sample dates</button>

        <h3>Sign in with Google</h3>
        {!isFirebaseConfigured() && <p className="status">Sign-in is not ready yet. Guest mode works now.</p>}
        <button type="button" className="ghost" onClick={() => run(signInWithGoogle)}>Continue with Google</button>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" className={mode === 'signin' ? '' : 'ghost'} onClick={() => setMode('signin')}>Sign In</button>
          <button type="button" className={mode === 'signup' ? '' : 'ghost'} onClick={() => setMode('signup')}>Sign Up</button>
        </div>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <label>Password</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button type="button" className="ghost small" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        <button type="button" className="ghost" onClick={() => run(() => (mode === 'signin' ? signInWithEmail(email, password) : signUpWithEmail(email, password)))}>
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
        {error && <p className="bad">{error}</p>}
        <p className="status">Guest data stays on this device. Signing in with Google syncs your profile and logs to the cloud.</p>
        <p className="status">Developed by H3Nz</p>
      </div>
    </div>
  );
}
