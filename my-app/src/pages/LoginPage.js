import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    fetch('http://localhost:5050/api/users/me', {
      credentials: 'include',
    })
      .then((res) => res.ok ? res.json() : null)
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
      navigate('/'); // ✅ Redirect to Events page
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
    <div style={{ padding: '2rem' }}>
      <h2>{currentUser ? `👋 Welcome ${currentUser.username}` : 'Login or Register'}</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Username</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit">Log In</button>
          <button type="button" onClick={handleRegister} style={{ marginLeft: '1rem' }}>
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
