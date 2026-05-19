import React, { useState } from 'react';
import logoImg from '../NMDC LOGO.jpg';
import './login.css';

export default function Login({ onSuccess }) {
  const [role, setRole] = useState('employee');
  const [tab, setTab] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  function handleSignIn(e) {
    e.preventDefault();
    // Minimal placeholder: accept any credentials and call onSuccess
    onSuccess?.();
  }

  return (
    <div className="nmdc-login-root">
      <div className="bg">
        <div className="bg-grid" />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
        <div className="blob b5" />
        <div className="shape shape-1"><svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 Q30 10 60 30 Q90 50 70 80 Q50 110 20 80 Q-10 50 10 50Z" fill="#60A5FA" opacity=".7"/></svg></div>
        <div className="shape shape-2"><svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 40 Q20 5 50 20 Q80 35 60 65 Q40 95 15 70 Q-10 45 5 40Z" fill="#93C5FD" opacity=".6"/></svg></div>
        <div className="shape shape-3"><svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 40 C10 10 50 0 80 20 C110 40 115 70 80 75 C45 80 10 70 10 40Z" fill="#3B82F6" opacity=".65"/></svg></div>
        <div className="shape shape-4"><svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="45" cy="45" rx="40" ry="25" fill="#60A5FA" opacity=".5" transform="rotate(30 45 45)"/></svg></div>
      </div>

      <div className="frame">
        <div className="landscape">

          <div className="left-pane">
            <div className="nmdc-logo-area">
              <img className="nmdc-logo-img" src={logoImg} alt="NMDC Logo" />
              <div className="nmdc-name-stack">
                <div className="nmdc-org">NMDC</div>
                <div className="nmdc-org-hindi">एनएमडीसी — National Mineral Development Corporation</div>
              </div>
            </div>

            <div className="live-badge"><span className="live-dot" />System Live</div>

            <div className="tagline">
              Workforce<br /><em>Analytics</em><br />Dashboard
            </div>

            <div className="desc">
              A smart platform that tracks <strong>departments, salaries, experience bands,</strong> and <strong>workforce trends</strong> in real time — giving decision-makers a clear, unified view of the entire NMDC workforce.
            </div>

            <div className="pill-grid">
              <div className="pill"><span className="pill-icon">📊</span>Department Analytics</div>
              <div className="pill"><span className="pill-icon">💰</span>Salary Band Insights</div>
              <div className="pill"><span className="pill-icon">📈</span>Experience Trends</div>
              <div className="pill"><span className="pill-icon">🔒</span>Role-based Access</div>
            </div>
          </div>

          <div className="divider-vert" />

          <div className="right-pane">
            <div className="card-header">
              <div className="card-logo-wrap">
                <img className="card-logo" src={logoImg} alt="NMDC" />
                <div className="ring" />
              </div>
              <div className="card-title">Workforce Analytics Dashboard</div>
              <div className="card-sub">Sign in to access your dashboard</div>
            </div>

            <div className="section-label">Select Your Role</div>
            <div className="role-grid">
              <div className={`role-card ${role === 'employee' ? 'active' : ''}`} onClick={() => setRole('employee')}>
                <div className="rc-icon">👷</div>
                <div className="rc-name">Employee Login</div>
                <div className="rc-desc">Plant Workers &amp; Operators</div>
                <div className="rc-check">✓</div>
              </div>
              <div className={`role-card ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
                <div className="rc-icon">🖥️</div>
                <div className="rc-name">CS / IT Admin</div>
                <div className="rc-desc">Administrators &amp; Analysts</div>
                <div className="rc-check">✓</div>
              </div>
            </div>

            <div className="tabs">
              <button className={`tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>🔒 Password Login</button>
              <button className={`tab ${tab === 'otp' ? 'active' : ''}`} onClick={() => setTab('otp')}>📱 OTP Login</button>
            </div>

            <form onSubmit={handleSignIn}>
              <div className="field">
                <label>Username / Email</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="employee@nmdc.co.in" />
                </div>
              </div>

              {tab === 'password' && (
                <div className="field">
                  <label>Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter your password" />
                  </div>
                </div>
              )}

              <div className="opts">
                <label className="remember" onClick={() => setRemember(r => !r)}>
                  <input type="checkbox" checked={remember} readOnly />
                  <span className="chk" />
                  Remember me
                </label>
                <a href="#" className="forgot">Forgot Password?</a>
              </div>

              <button className="btn-signin" type="submit">→ &nbsp;Sign In</button>

              <div className="or-row">or continue with</div>

              <button type="button" className="btn-google">
                <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <div className="register-row">Don't have an account? <a href="#">Register for free</a></div>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
}
