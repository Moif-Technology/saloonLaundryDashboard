import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/auth';
import { IconAlert, IconEye, IconEyeOff } from '../components/Icon';
import './Login.css';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Login({ setIsAuthenticated }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      authAPI.setAuth(token, user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-brand">
        <div className="auth-brand-inner">
          <span className="brand-mark">CL</span>
          <h1 className="auth-brand-title">
            Counterline
            <span>Salon &amp; laundry counters, settled clean.</span>
          </h1>
          <ul className="auth-points">
            <li>
              <strong>Shift settlement</strong>
              Cash counted against expected, discrepancy in one glance.
            </li>
            <li>
              <strong>Live counter reads</strong>
              Revenue, tickets and credit exposure per branch.
            </li>
            <li>
              <strong>Stock warnings</strong>
              Reorder levels flagged before the shelf runs dry.
            </li>
          </ul>
        </div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="page-eyebrow">Manager access</p>
          <h2 className="auth-title">Sign in to the counter</h2>
          <p className="auth-sub">
            Use the account issued for this branch. Sessions stay signed in on this device.
          </p>

          {error && (
            <div className="notice is-error" role="alert">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate={false}>
            <div className="field">
              <label className="field-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@branch.ae"
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="secret">
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="secret-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <p className="field-hint">Locked out? Ask the ERP admin to reset counter access.</p>
            </div>

            <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={isLoading}>
              {isLoading ? 'Verifying…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-foot">
            Counterline reads from your live ERP counter data. Nothing is stored on the handset
            beyond the session token.
          </p>
        </div>
      </section>
    </div>
  );
}
