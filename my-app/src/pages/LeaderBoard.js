import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND = 'http://localhost:5050';

// function LeaderBoard() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     fetch(`${BACKEND}/api/users/leaderboard`)
//       .then((res) => res.json())
//       .then(setUsers)
//       .catch(console.error);
//   }, []);

function LeaderBoard() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND}/api/users/leaderboard`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);

    fetch(`${BACKEND}/api/categories/leaderboard`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '3rem 1rem', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#0f172a',
          textAlign: 'center'
        }}>
          Top Users:
        </h1>

        {users.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>No active users yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {users.map((u, i) => (
              <li key={u.user_id} style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
              }}>
                <div>
                  <strong>#{i + 1}</strong> — <span style={{ fontWeight: 600 }}>{u.username}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                  {u.events_created} events
                </div>
              </li>
            ))}
          </ul>

        )}

        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginTop: '2rem',
          marginBottom: '1.5rem',
          color: '#0f172a',
          textAlign: 'center'
        }}>

        Top Categories:
        </h1>

        {categories.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>No active categories yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categories.map((c, i) => (
              <li key={c.category_name} style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
              }}>
                <div>
                  <strong>#{i + 1}</strong> — <span style={{ fontWeight: 600 }}>{c.category_name}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                  {c.event_count} events
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 18px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#1e293b',
            }}
          >
            Back to Explore
          </button>
        </div>
    </div>
  );
}

export default LeaderBoard;
