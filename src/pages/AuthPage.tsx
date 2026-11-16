import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import { sendPasswordReset, signIn, signUp, updatePassword } from '../api/auth';
import { getPreferences } from '../api/preferences';
import { isSupabaseConfigured } from '../api/supabase';
import { useOnboardingStore } from '../store/onboardingStore';

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'update-password';
type AuthAction = 'sign-in' | 'sign-up' | 'recovery' | 'update-password';

const minimumPasswordLength = 6;

function getInitialView(searchParams: URLSearchParams): AuthView {
  const mode = searchParams.get('mode');
  if (mode === 'reset') return 'update-password';
  if (mode === 'forgot') return 'forgot-password';
  return 'sign-in';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFriendlyAuthError(error: unknown, action: AuthAction) {
  const authError = error as { code?: unknown; message?: unknown; status?: unknown } | null;
  const code = typeof authError?.code === 'string' ? authError.code.toLocaleLowerCase() : '';
  const status = typeof authError?.status === 'number' ? authError.status : undefined;
  const message =
    typeof authError?.message === 'string' ? authError.message.toLocaleLowerCase() : '';

  if (code === 'over_email_send_rate_limit') {
    return 'Supabase тимчасово обмежив відправлення листів. Зачекай, поки ліміт оновиться. Для стабільної реєстрації власнику проєкту потрібно налаштувати власний SMTP.';
  }
  if (code === 'over_request_rate_limit') {
    return 'Supabase тимчасово обмежив запити з цієї мережі. Зачекай кілька хвилин перед наступною спробою.';
  }
  if (code === 'email_address_not_authorized') {
    return 'Стандартний SMTP Supabase надсилає листи лише адресам учасників організації. Власнику проєкту потрібно налаштувати власний SMTP для інших адрес.';
  }
  if (status === 429) {
    return 'Сервіс тимчасово обмежив запити. Зачекай перед наступною спробою; повторний запит автоматично не надсилається.';
  }

  if (message.includes('invalid login credentials')) {
    return 'Пошта або пароль неправильні. Перевір дані й спробуй ще раз.';
  }
  if (message.includes('email not confirmed')) {
    return 'Цей акаунт ще не підтверджений. Для нових акаунтів підтвердження не потрібне; звернись до власника проєкту щодо доступу до цього акаунта.';
  }
  if (
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('user already')
  ) {
    return 'Акаунт із такою поштою вже існує. Перемкнись на вхід.';
  }
  if (
    message.includes('password') &&
    ['weak', 'short', 'at least', 'characters'].some((phrase) => message.includes(phrase))
  ) {
    return 'Пароль закороткий. Використай щонайменше 6 символів.';
  }
  if (message.includes('invalid email') || message.includes('email address')) {
    return 'Перевір формат електронної пошти.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Забагато спроб за короткий час. Зачекай трохи й повтори.';
  }
  if (message.includes('redirect') || message.includes('url')) {
    return 'Посилання для повернення не дозволене. Потрібно додати адресу застосунку до списку Redirect URLs у Supabase.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('load failed')) {
    return 'Не вдалося з’єднатися із сервісом. Перевір інтернет і спробуй ще раз.';
  }

  if (action === 'sign-in') return 'Не вдалося увійти. Перевір дані та спробуй ще раз.';
  if (action === 'sign-up') return 'Не вдалося створити акаунт. Перевір дані та спробуй ще раз.';
  if (action === 'recovery') return 'Не вдалося надіслати лист. Спробуй ще раз трохи пізніше.';
  return 'Не вдалося оновити пароль. Відкрий найновіший лист для відновлення та спробуй ще раз.';
}

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const setPreferences = useOnboardingStore((state) => state.setPreferences);
  const resetPreferences = useOnboardingStore((state) => state.resetPreferences);
  const [view, setView] = useState<AuthView>(() => getInitialView(searchParams));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submitInFlight = useRef(false);

  function switchView(nextView: AuthView) {
    if (loading) return;
    setView(nextView);
    setPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
    if (nextView !== 'update-password' && searchParams.has('mode')) {
      setSearchParams({}, { replace: true });
    }
  }

  async function navigateAfterAuthentication() {
    resetPreferences();
    const preferences = await getPreferences();
    if (preferences) {
      setPreferences(preferences);
      navigate('/deck', { replace: true });
    } else {
      resetPreferences();
      navigate('/onboarding/platforms', { replace: true });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitInFlight.current) return;

    setMessage('');
    setError('');

    const normalizedEmail = email.trim();
    if (view !== 'update-password' && !isValidEmail(normalizedEmail)) {
      setError('Введи коректну адресу електронної пошти.');
      return;
    }
    if ((view === 'sign-in' || needsConfirmation) && !password) {
      setError('Введи пароль.');
      return;
    }
    if (
      (view === 'sign-up' || view === 'update-password') &&
      password.length < minimumPasswordLength
    ) {
      setError('Пароль має містити щонайменше 6 символів.');
      return;
    }
    if ((view === 'sign-up' || view === 'update-password') && password !== confirmPassword) {
      setError('Паролі не збігаються. Перевір обидва поля.');
      return;
    }

    const action: AuthAction =
      view === 'sign-in'
        ? 'sign-in'
        : view === 'sign-up'
          ? 'sign-up'
          : view === 'forgot-password'
            ? 'recovery'
            : 'update-password';

    submitInFlight.current = true;
    setLoading(true);
    try {
      if (view === 'sign-in') {
        const result = await signIn(normalizedEmail, password);
        if (!result.session) {
          setError(
            'Вхід завершився без активної сесії. Перевір налаштування доступу або звернись до власника проєкту.',
          );
          return;
        }
        try {
          await navigateAfterAuthentication();
        } catch {
          setError('Ти увійшов, але не вдалося завантажити збережені вподобання. Спробуй ще раз.');
        }
        return;
      }

      if (view === 'sign-up') {
        const result = await signUp(normalizedEmail, password);
        if (result.user && (result.user.identities?.length ?? 0) === 0) {
          setError('Акаунт із такою поштою вже існує. Перемкнись на вхід.');
          return;
        }
        if (result.session) {
          resetPreferences();
          navigate('/onboarding/platforms', { replace: true });
          return;
        }

        setView('sign-in');
        setPassword('');
        setConfirmPassword('');
        setError(
          'Акаунт створено, але Supabase не повернув активну сесію. Перевір налаштування Email Auth у Supabase, а потім спробуй увійти.',
        );
        return;
      }

      if (view === 'forgot-password') {
        const redirectTo = `${window.location.origin}/auth?mode=reset`;
        await sendPasswordReset(normalizedEmail, redirectTo);
        setMessage(
          'Якщо акаунт із цією адресою існує, ми надіслали лист для відновлення пароля. Перевір також папку «Спам».',
        );
        return;
      }

      await updatePassword(password);
      setPassword('');
      setConfirmPassword('');
      setSearchParams({}, { replace: true });
      setView('sign-in');
      setMessage('Пароль оновлено. Тепер увійди з новим паролем.');
    } catch (authError) {
      setError(getFriendlyAuthError(authError, action));
    } finally {
      submitInFlight.current = false;
      setLoading(false);
    }
  }

  const isEmailView = view !== 'update-password';
  const needsConfirmation = view === 'sign-up' || view === 'update-password';
  const heading = {
    'sign-in': 'З поверненням!',
    'sign-up': 'Створи акаунт',
    'forgot-password': 'Відновлення пароля',
    'update-password': 'Новий пароль',
  }[view];
  const description = {
    'sign-in': 'Увійди, щоб продовжити пошук своєї наступної гри.',
    'sign-up': 'Створи акаунт, щоб зберегти свій смак і майбутню ігрову колоду.',
    'forgot-password': 'Вкажи пошту, і ми надішлемо безпечне посилання для відновлення.',
    'update-password': 'Придумай новий пароль для свого акаунта GameMatch.',
  }[view];
  const submitLabel = {
    'sign-in': loading ? 'Входимо…' : 'Увійти',
    'sign-up': loading ? 'Створюємо акаунт…' : 'Створити акаунт',
    'forgot-password': loading ? 'Надсилаємо…' : 'Надіслати лист',
    'update-password': loading ? 'Оновлюємо…' : 'Зберегти новий пароль',
  }[view];

  return (
    <motion.main
      className="auth-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="auth-ambient auth-ambient--purple" aria-hidden="true" />
      <div className="auth-ambient auth-ambient--cyan" aria-hidden="true" />

      <div className="auth-shell">
        <header className="auth-header">
          <AppLogo />
          <Link className="auth-home-link" to="/welcome">
            <span aria-hidden="true">←</span> На головну
          </Link>
        </header>

        <div className="auth-content">
          <aside className="auth-showcase" aria-label="Переваги GameMatch">
            <p className="auth-showcase__eyebrow">
              <span aria-hidden="true" /> ТВІЙ ІГРОВИЙ ПРОСТІР
            </p>
            <div className="auth-showcase__emblem" aria-hidden="true">
              <span className="auth-showcase__emblem-glow" />
              <span className="auth-showcase__emblem-icon">
                <GamepadIcon />
              </span>
              <span className="auth-showcase__emblem-spark">✦</span>
            </div>
            <h1>
              Менше пошуку.
              <br />
              <span>Більше гри.</span>
            </h1>
            <p className="auth-showcase__description">
              Знайди ігри під свій смак, платформу та бюджет — і залиш час на пригоду.
            </p>
            <ul className="auth-benefits">
              <li>
                <span aria-hidden="true">✓</span> Рекомендації під твої вподобання
              </li>
              <li>
                <span aria-hidden="true">✓</span> Одна колода для всіх платформ
              </li>
              <li>
                <span aria-hidden="true">✓</span> Список ігор завжди під рукою
              </li>
            </ul>
          </aside>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={view}
              className="auth-card"
              aria-labelledby="auth-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="auth-card__mark" aria-hidden="true">
                <GamepadIcon />
              </div>
              <p className="auth-card__eyebrow">GAME MATCH · ТВОЯ НАСТУПНА ПРИГОДА</p>
              <h2 id="auth-title">{heading}</h2>
              <p className="auth-card__description">{description}</p>

              {!isSupabaseConfigured ? (
                <div className="auth-notice auth-notice--error" role="alert">
                  <strong>Supabase не налаштований</strong>
                  <span>
                    Додай URL проєкту та публічний ключ у локальний .env і перезапусти Vite.
                  </span>
                </div>
              ) : null}

              {view === 'sign-in' || view === 'sign-up' ? (
                <div className="auth-tabs" role="group" aria-label="Тип автентифікації">
                  <button
                    className={view === 'sign-in' ? 'is-active' : ''}
                    type="button"
                    disabled={loading}
                    aria-pressed={view === 'sign-in'}
                    onClick={() => switchView('sign-in')}
                  >
                    Увійти
                  </button>
                  <button
                    className={view === 'sign-up' ? 'is-active' : ''}
                    type="button"
                    disabled={loading}
                    aria-pressed={view === 'sign-up'}
                    onClick={() => switchView('sign-up')}
                  >
                    Створити акаунт
                  </button>
                </div>
              ) : null}

              <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading} noValidate>
                {isEmailView ? (
                  <div className="auth-field">
                    <label htmlFor="auth-email">Електронна пошта</label>
                    <div className="auth-input-wrap">
                      <EmailIcon />
                      <input
                        id="auth-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError('');
                          setMessage('');
                        }}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                ) : null}

                {view === 'sign-in' || needsConfirmation ? (
                  <PasswordField
                    id="auth-password"
                    label={view === 'update-password' ? 'Новий пароль' : 'Пароль'}
                    value={password}
                    onChange={(value) => {
                      setPassword(value);
                      setError('');
                      setMessage('');
                    }}
                    autoComplete={view === 'sign-in' ? 'current-password' : 'new-password'}
                    disabled={loading}
                    minLength={minimumPasswordLength}
                    hint={needsConfirmation ? 'Щонайменше 6 символів' : undefined}
                  />
                ) : null}

                {needsConfirmation ? (
                  <PasswordField
                    id="auth-confirm-password"
                    label="Підтверди пароль"
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      setError('');
                      setMessage('');
                    }}
                    autoComplete="new-password"
                    disabled={loading}
                    minLength={minimumPasswordLength}
                  />
                ) : null}

                {view === 'sign-in' ? (
                  <button
                    className="auth-forgot-link"
                    type="button"
                    disabled={loading}
                    onClick={() => switchView('forgot-password')}
                  >
                    Забули пароль?
                  </button>
                ) : null}

                <AnimatePresence initial={false}>
                  {error ? (
                    <motion.p
                      key="auth-error"
                      className="auth-notice auth-notice--error"
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {error}
                    </motion.p>
                  ) : null}
                  {message ? (
                    <motion.p
                      key="auth-message"
                      className="auth-notice auth-notice--success"
                      role="status"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {message}
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={!isSupabaseConfigured || loading}
                >
                  {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
                  {submitLabel}
                  {!loading ? <span aria-hidden="true">→</span> : null}
                </button>
              </form>

              {view === 'forgot-password' || view === 'update-password' ? (
                <button
                  className="auth-back-link"
                  type="button"
                  disabled={loading}
                  onClick={() => switchView('sign-in')}
                >
                  <span aria-hidden="true">←</span> Повернутися до входу
                </button>
              ) : null}

              <p className="auth-card__privacy">
                Твої дані захищені та використовуються лише для роботи з акаунтом GameMatch.
              </p>
            </motion.section>
          </AnimatePresence>
        </div>

        <footer className="auth-footer">
          <span>GameMatch · Менше пошуку. Більше гри.</span>
          <span>Твій смак → твоя колода → твоя пригода</span>
        </footer>
      </div>
    </motion.main>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled: boolean;
  minLength: number;
  hint?: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
  minLength,
  hint,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <LockIcon />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Введи пароль"
          minLength={minLength}
          required
          disabled={disabled}
          aria-describedby={hintId}
        />
        <button
          className="auth-password-toggle"
          type="button"
          aria-label={visible ? 'Приховати пароль' : 'Показати пароль'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
      {hint ? (
        <small className="auth-field__hint" id={hintId}>
          {hint}
        </small>
      ) : null}
    </div>
  );
}

function GamepadIcon() {
  return (
    <svg viewBox="0 0 28 22" fill="none" aria-hidden="true">
      <path
        d="M8 3.5h12a4 4 0 0 1 3.8 2.8l2.1 6.4a3.4 3.4 0 0 1-5.5 3.6l-3-2.4h-4.8l-3 2.4a3.4 3.4 0 0 1-5.5-3.6l2.1-6.4A4 4 0 0 1 8 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 7.5v5m-2.5-2.5h5m7-1h.01M21 11h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.6" />
      {visible ? <path d="m4 20 16-16" stroke="currentColor" strokeWidth="1.6" /> : null}
    </svg>
  );
}

export default AuthPage;
