import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { login, loginAsGuest } from '../../store/authSlice';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import './LoginPage.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = useAppSelector((state) => state.auth.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (mode !== null && !isExiting) navigate('/', { replace: true });
  }, [mode, navigate, isExiting]);

  if (mode !== null && !isExiting) return null;

  function validate(fields = { email, password }) {
    const errors: { email?: string; password?: string } = {};
    if (!fields.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!fields.password) {
      errors.password = 'Password is required.';
    } else if (fields.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
  }

  function handleBlur(field: 'email' | 'password') {
    setTouched((t) => ({ ...t, [field]: true }));
    const errors = validate();
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
  }

  function handleFieldChange(field: 'email' | 'password', value: string) {
    if (field === 'email') setEmail(value);
    else setPassword(value);
    if (touched[field]) {
      const errors = validate({ email: field === 'email' ? value : email, password: field === 'password' ? value : password });
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
    if (loginError) setLoginError('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    setLoginError('');
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch {
      setLoginError('Invalid email or password.');
      setIsSubmitting(false);
    }
  }

  function handleGuest() {
    setIsExiting(true);
    dispatch(loginAsGuest());
  }

  function handleExitEnd(e: React.AnimationEvent) {
    if (e.animationName === 'loginExit') navigate('/');
  }

  return (
    <div className={`login-page${isExiting ? ' login-page--exiting' : ''}`} onAnimationEnd={handleExitEnd}>
      <header className="login-topbar">
        <span className="login-wordmark">
          <svg className="login-mark" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <rect x="1" y="2" width="4" height="14" rx="1.5" />
            <rect x="7" y="2" width="4" height="9" rx="1.5" />
            <rect x="13" y="2" width="4" height="11" rx="1.5" />
          </svg>
          simple kanban
        </span>
        <ThemeToggle />
      </header>

      <main className="login-main">
        <div className="login-column">
          <div className="login-header">
            <h1 className="login-title">Sign in to simple kanban</h1>
            <p className="login-subtitle">Boards, lists, and cards. Nothing more.</p>
          </div>

          <section className="login-guest" aria-label="Guest access">
            <button className="login-btn login-btn--primary" type="button" onClick={handleGuest} disabled={isExiting}>
              Continue as guest
            </button>
            <p className="login-hint">
              No account needed. Your boards are saved in this browser and can be exported anytime.
            </p>
          </section>

          <div className="login-divider" role="separator">
            <span>or sign in with email</span>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate aria-busy={isSubmitting}>
            <div className={`login-field${fieldErrors.email ? ' login-field--error' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && <p id="email-error" className="login-field-error">{fieldErrors.email}</p>}
            </div>
            <div className={`login-field${fieldErrors.password ? ' login-field--error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              {fieldErrors.password && <p id="password-error" className="login-field-error">{fieldErrors.password}</p>}
            </div>
            {loginError && <p className="login-alert" role="alert">{loginError}</p>}
            <button className="login-btn login-btn--secondary" type="submit" disabled={!email.trim() || !password || !!fieldErrors.email || !!fieldErrors.password || isSubmitting}>
              {isSubmitting && <span className="login-spinner" aria-hidden="true" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="login-footnote">Registration is invite-only.</p>
        </div>
      </main>
    </div>
  );
}
