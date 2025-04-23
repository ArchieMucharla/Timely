import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5050/api/users/me', {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5050/api/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      navigate('/');
    } else {
      alert('Login failed');
    }
  };

  const handleRegister = async () => {
    const res = await fetch('http://localhost:5050/api/users/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert('Account created! Logging in...');
      await handleLogin({ preventDefault: () => {} });
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Inter", sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '2.5rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#0f172a',
            textAlign: 'center',
          }}
        >
          {currentUser ? `👋 Welcome ${currentUser.username}` : 'Login or Register'}
        </h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600', color: '#475569' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                marginTop: '0.25rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: '#475569' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                marginTop: '0.25rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                border: 'none',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Log In
            </button>

            <button
              type="button"
              onClick={handleRegister}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#1e293b',
              }}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
