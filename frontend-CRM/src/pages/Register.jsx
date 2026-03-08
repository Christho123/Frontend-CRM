import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { registerUser, getDocumentTypes } from '../services/register';
import './Register.css';

export function Register() {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    getDocumentTypes()
      .then((list) => {
        const types = Array.isArray(list) ? list : [];
        setDocumentTypes(types);
        if (types.length > 0 && !documentType) {
          setDocumentType(types[0].id);
        }
      })
      .catch(() => setDocumentTypes([]))
      .finally(() => setLoadingTypes(false));
  }, []);

  useEffect(() => {
    if (documentTypes.length > 0 && !documentType) {
      setDocumentType(documentTypes[0].id);
    }
  }, [documentTypes]);

  useEffect(() => {
    if (!success) return;
    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate(ROUTES.LOGIN, { replace: true });
    }, 2000);
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        email,
        user_name: userName,
        document_number: documentNumber,
        document_type: Number(documentType),
        password,
        password_confirm: passwordConfirm,
      });
      setSuccess({ message: data.message, user: data.user });
    } catch (err) {
      const status = err.status;
      if (status === 401) setError('No autorizado. Intenta de nuevo.');
      else if (status === 400) setError('Revisa los datos ingresados e intenta de nuevo.');
      else setError('Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg" aria-hidden="true" />
      {success && (
        <div className="register-toast" role="status" aria-live="polite">
          Registro exitoso
        </div>
      )}
      <div className="register-card-wrapper">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">Crear cuenta</h1>
            <p className="register-subtitle">Regístrate en el Sistema CRM</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form__grid">
              <div className="register-field">
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
              <div className="register-field">
                <label htmlFor="user_name">Nombre de usuario</label>
                <input
                  id="user_name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="usuario"
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
              <div className="register-field">
                <label htmlFor="document_number">Número de documento</label>
                <input
                  id="document_number"
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: 76454313"
                  autoComplete="off"
                  required
                  disabled={loading}
                />
              </div>
              <div className="register-field">
                <label htmlFor="document_type">Tipo de documento</label>
                <select
                  id="document_type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  disabled={loading || loadingTypes}
                  className="register-select"
                >
                  {loadingTypes ? (
                    <option value="">Cargando...</option>
                  ) : documentTypes.length === 0 ? (
                    <option value="">No hay tipos disponibles</option>
                  ) : (
                    documentTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name ?? item.document_type ?? item.label ?? `Tipo ${item.id}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="register-field">
                <label htmlFor="password">Contraseña</label>
                <div className="register-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="register-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="register-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="register-field">
                <label htmlFor="password_confirm">Confirmar contraseña</label>
                <div className="register-password-wrap">
                  <input
                    id="password_confirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPasswordConfirm((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={loading}
                  >
                    {showPasswordConfirm ? (
                      <svg className="register-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="register-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="register-msg register-msg--error">{error}</p>}
            <button type="submit" className="register-btn" disabled={loading || loadingTypes || !documentType}>
              {loading ? <span className="register-spinner" aria-hidden="true" /> : 'Registrarse'}
            </button>
            <p className="register-login">
              ¿Ya tienes cuenta? <Link to={ROUTES.LOGIN} className="register-login__link">Inicia sesión aquí</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
