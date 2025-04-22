import { useEffect, useState } from 'react';

const BACKEND = 'http://localhost:5050';

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/users/me`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(console.error);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '4rem 1.5rem',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '3rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#0f172a',
          }}
        >
          My Profile
        </h2>

        {user ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#475569' }}>Username</label>
              <div style={{ paddingTop: '4px', color: '#1e293b' }}>{user.username}</div>
            </div>
          </>
        ) : (
          <p style={{ color: '#64748b' }}>Loading user info...</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
