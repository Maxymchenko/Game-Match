
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import { signIn, signUp } from '../api/auth';
import { getPreferences } from '../api/preferences';
import { isSupabaseConfigured } from '../api/supabase';
import { useOnboardingStore } from '../store/onboardingStore';

function AuthPage() {
  const navigate = useNavigate();
  const setPreferences = useOnboardingStore((state) => state.setPreferences);
  const resetPreferences = useOnboardingStore((state) => state.resetPreferences);
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (mode === 'sign-up') {
        const result = await signUp(email.trim(), password);
        if (result.user && (result.user.identities?.length ?? 0) === 0) {
          setError('Акаунт із такою поштою вже створений. Перемкнись на «Увійти».');
        } else if (result.session) {
          resetPreferences();
          navigate('/onboarding/platforms', { replace: true });
        } else {
          setMessage('Акаунт створено. Перевір пошту та підтвердь адресу, а потім увійди.');
        }
      } else {
        await signIn(email.trim(), password);
        const preferences = await getPreferences();
        if (preferences) setPreferences(preferences);
        else resetPreferences();
        navigate(preferences ? '/deck' : '/onboarding/platforms', { replace: true });
      }
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : '';
      const normalized = message.toLowerCase();
      setError(
        normalized.includes('already registered') || normalized.includes('already exists') || normalized.includes('user already')
          ? 'Акаунт із такою поштою вже створений. Перемкнись на «Увійти».'
          : message || 'Не вдалося виконати запит. Спробуй ще раз.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <header className="topbar">
          <AppLogo />
          <Link className="button button--quiet" to="/welcome">
            На головну
          </Link>
        </header>
        <section className="auth-panel" aria-labelledby="auth-title">
          <p className="auth-eyebrow">ТВІЙ ІГРОВИЙ ПРОСТІР</p>
          <h1 id="auth-title">{mode === 'sign-up' ? 'Створи акаунт' : 'З поверненням!'}</h1>
          <p className="auth-description">
            {mode === 'sign-up'
              ? 'Зареєструйся, щоб зберігати вподобання та свою ігрову бібліотеку.'
              : 'Увійди, щоб продовжити пошук своєї наступної гри.'}
          </p>
          {!isSupabaseConfigured && (
            <p className="auth-message auth-message--error" role="alert">
              Supabase ще не налаштований. Перевір локальний файл .env і перезапусти Vite.
            </p>
          )}
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">Електронна пошта</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <label htmlFor="auth-password">Пароль</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Щонайменше 6 символів"
              minLength={6}
              required
            />
            {error && (
              <p className="auth-message auth-message--error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}
            <button
              className="button button--primary auth-submit"
              type="submit"
              disabled={!isSupabaseConfigured || loading}
            >
              {loading ? 'Зачекай…' : mode === 'sign-up' ? 'Створити акаунт' : 'Увійти'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="auth-switch">
            {mode === 'sign-up' ? 'Вже маєш акаунт?' : 'Ще не маєш акаунта?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up');
                setMessage('');
                setError('');
              }}
            >
              {mode === 'sign-up' ? 'Увійти' : 'Зареєструватися'}
            </button>
          </p>
          <p className="auth-privacy">
            Пароль використовується лише для входу в твій акаунт GameMatch.
          </p>
        </section>
      </div>
    </main>
  );
}

export default AuthPage;
