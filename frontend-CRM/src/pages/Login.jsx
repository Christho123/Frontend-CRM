import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { loginStep1, loginStep2 } from '../services/auth';
import { ROUTES } from '../constants';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, setTokens, setUser, setTwoFaPending, twoFaPending } = useApp();

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, navigate]);

  /* Bloquear scroll: página = exactamente 100vh */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prev = {
      html: { overflow: html.style.overflow, height: html.style.height },
      body: { overflow: body.style.overflow, height: body.style.height },
      root: root ? { height: root.style.height, overflow: root.style.overflow } : null,
    };
    html.style.overflow = 'hidden';
    html.style.height = '100vh';
    body.style.overflow = 'hidden';
    body.style.height = '100vh';
    if (root) {
      root.style.height = '100%';
      root.style.overflow = 'hidden';
    }
    return () => {
      html.style.overflow = prev.html.overflow;
      html.style.height = prev.html.height;
      body.style.overflow = prev.body.overflow;
      body.style.height = prev.body.height;
      if (root && prev.root) {
        root.style.height = prev.root.height;
        root.style.overflow = prev.root.overflow;
      }
    };
  }, []);

  const [step, setStep] = useState(twoFaPending ? '2fa' : 'credentials');
  const [email, setEmail] = useState(twoFaPending?.email ?? '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const pending = twoFaPending || { email: '', password: '', challenge_id: null };

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await loginStep1({ email, password });
      if (res.twoFaRequired) {
        setTwoFaPending({
          email,
          password,
          challenge_id: res.challengeId,
        });
        setSuccessMessage(res.message || 'Código enviado a tu correo.');
        setStep('2fa');
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Revisa tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { email: e2, password: p2, challenge_id } = pending;
    try {
      const res = await loginStep2({
        email: e2,
        password: p2,
        code: code.trim(),
        challenge_id,
      });
      setTokens(res.access, res.refresh);
      setUser({ user_id: res.user_id, email: res.email });
      setTwoFaPending(null);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Código incorrecto o expirado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setTwoFaPending(null);
    setStep('credentials');
    setCode('');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true" />
      <div className="login-card-wrapper">
        <div className={`login-card ${step === '2fa' ? 'login-card--step2' : ''}`}>
          <div className="login-card__inner">
            <div className="login-header">
              <h1 className="login-title">Sistema CRM</h1>
              <p className="login-subtitle">
                {step === 'credentials' ? 'Inicia sesión en tu cuenta' : 'Verificación en dos pasos'}
              </p>
            </div>

            {step === 'credentials' ? (
              <form className="login-form" onSubmit={handleSubmitCredentials}>
                <div className="login-field">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                </div>
                {error && <p className="login-msg login-msg--error">{error}</p>}
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? (
                    <span className="login-spinner" aria-hidden="true" />
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleSubmit2FA}>
                {successMessage && (
                  <p className="login-msg login-msg--success">{successMessage}</p>
                )}
                <p className="login-2fa-hint">
                  Ingresa el código de 6 dígitos enviado a <strong>{pending.email}</strong>
                </p>
                <div className="login-field">
                  <label htmlFor="code">Código de verificación</label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="login-code-input"
                    disabled={loading}
                  />
                </div>
                {error && <p className="login-msg login-msg--error">{error}</p>}
                <button type="submit" className="login-btn" disabled={loading || code.length < 6}>
                  {loading ? (
                    <span className="login-spinner" aria-hidden="true" />
                  ) : (
                    'Verificar y entrar'
                  )}
                </button>
                <button
                  type="button"
                  className="login-back"
                  onClick={handleBackToCredentials}
                  disabled={loading}
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
