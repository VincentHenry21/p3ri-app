import { useEffect, useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, initFirebase, isFirebaseConfigured } from '../../lib/firebase';

/**
 * Redesigned welcome screen: Google first, guest setup second, email hidden
 * behind one link. All primary actions are full width, same height, same
 * radius, so the screen reads as one clean flow instead of a pile of pills.
 * Firebase is initialised on mount here (not only in App's effect), so the
 * Google button never gets stuck on "not ready" after the first render.
 */
export default function AuthModal({ onGuest }: { onGuest: (lastPeriodStart: string, cycleLength: number, mascotStyle: 'plush' | 'jelly') => void }) {
  const [last, setLast] = useState('');
  const [cycle, setCycle] = useState(28);
  const [mascot, setMascot] = useState<'plush' | 'jelly'>('plush');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fbReady, setFbReady] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    initFirebase();
    setFbReady(isFirebaseConfigured());
  }, []);

  const friendly = (e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Something went wrong';
    if (msg.includes('auth/invalid-credential')) return 'That email or password does not match. Try again or sign up.';
    if (msg.includes('auth/user-not-found')) return 'No account with that email. Try signing up.';
    if (msg.includes('auth/email-already-in-use')) return 'That email already has an account. Try signing in.';
    if (msg.includes('auth/weak-password')) return 'Password needs at least 6 characters.';
    if (msg.includes('auth/unauthorized-domain')) return 'This site is not on the Firebase authorized domains list yet. Guest mode still works.';
    if (msg.includes('auth/operation-not-allowed')) return 'Google sign-in is not enabled in Firebase yet. Guest mode still works.';
    return msg;
  };

  const run = async (fn: () => Promise<void>) => {
    setError('');
    try { await fn(); } catch (e) { setError(friendly(e)); }
  };

  return (
    <div className="overlay auth-overlay" role="dialog" aria-label="Welcome to P3RI">
      <div className="sheet auth-sheet">
        <div className="auth-hero">
          <img className="auth-logo" src="icons/p3ri-icon-flame.svg" alt="P3RI logo" />
          <h2 className="auth-title">Welcome to P3RI</h2>
          <p className="auth-sub">Your cycle, in one calm place. Sign in to sync, or start as a guest in seconds.</p>
        </div>

        <button type="button" className="auth-google" disabled={!fbReady} onClick={() => run(signInWithGoogle)}>
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.7 39.6 16.3 44 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" /></svg>
          {fbReady ? 'Continue with Google' : 'Setting up Google sign-in…'}
        </button>

        <div className="auth-divider"><span>or start as a guest</span></div>

        <div className="auth-guest">
          <label>When did your last period start?</label>
          <input type="date" value={last} onChange={(e) => setLast(e.target.value)} />
          <label>Average cycle length</label>
          <div className="auth-stepper">
            <button type="button" aria-label="Decrease cycle length" onClick={() => setCycle((c) => Math.max(21, c - 1))}>−</button>
            <span>{cycle} days</span>
            <button type="button" aria-label="Increase cycle length" onClick={() => setCycle((c) => Math.min(45, c + 1))}>+</button>
          </div>
          <label>Pick your Peri style</label>
          <div className="auth-segment" role="group" aria-label="Peri style">
            <button type="button" className={mascot === 'plush' ? 'on' : ''} onClick={() => setMascot('plush')}>Plush Peri</button>
            <button type="button" className={mascot === 'jelly' ? 'on' : ''} onClick={() => setMascot('jelly')}>Jelly Cloud</button>
          </div>
          <button type="button" className="auth-primary" onClick={() => onGuest(last, cycle, mascot)}>Continue as guest</button>
          <button type="button" className="auth-link" onClick={() => onGuest('', 28, 'plush')}>Skip, use sample dates</button>
        </div>

        <button type="button" className="auth-link" onClick={() => setShowEmail((s) => !s)}>
          {showEmail ? 'Hide email sign-in' : 'Sign in with email instead'}
        </button>
        {showEmail && (
          <div className="auth-email">
            <div className="auth-segment" role="group" aria-label="Sign in or sign up">
              <button type="button" className={mode === 'signin' ? 'on' : ''} onClick={() => setMode('signin')}>Sign In</button>
              <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Sign Up</button>
            </div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            <label>Password</label>
            <div className="auth-password">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
              <button type="button" className="ghost small" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <button type="button" className="auth-primary" onClick={() => run(() => (mode === 'signin' ? signInWithEmail(email, password) : signUpWithEmail(email, password)))}>
              {mode === 'signin' ? 'Sign In' : 'Create account'}
            </button>
          </div>
        )}
        {error && <p className="bad auth-error">{error}</p>}
        <p className="status auth-foot">Guest data stays on this device. Signing in syncs your profile and logs to the cloud.</p>
        <p className="status auth-foot"><b>Developed by H3Nz</b></p>
      </div>
    </div>
  );
}
