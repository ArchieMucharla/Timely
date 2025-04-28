import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND = 'http://localhost:5050';

export default function AdminPage() {
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventResults, setEventResults] = useState([]);
  const [categoriesByCount, setCategoriesByCount] = useState([]);
  const [inactiveUsersMessage, setInactiveUsersMessage] = useState('');
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [deletedUsersMessage, setDeletedUsersMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    const res = await fetch(`${BACKEND}/api/admin/users?search=${userSearch}`, { credentials: 'include' });
    const data = await res.json();
    setUserResults(data);
  };

  const searchEvents = async () => {
    const res = await fetch(`${BACKEND}/api/admin/events?search=${eventSearch}`, { credentials: 'include' });
    const data = await res.json();
    setEventResults(data);
  };

  const fetchCategoriesByEventCount = async () => {
    const res = await fetch(`${BACKEND}/api/admin/categories-by-event-count`, { credentials: 'include' });
    const data = await res.json();
    setCategoriesByCount(data);
  };

  const markInactiveUsersForDeletion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/mark-inactive-users`, {
        method: 'POST',
        credentials: 'include', // Include credentials for authentication
      });

      if (res.ok) {
        const data = await res.json();
        const usernames = data.users.map(user => user.username);
        console.log('Users marked for deletion:', usernames);
        setInactiveUsersMessage(`Users marked for deletion:`);  // Display success message
        setInactiveUsers(data.users)
      } else {
        setInactiveUsersMessage('Error marking inactive users.');
      }
    } catch (err) {
      console.error('Error:', err);
      setInactiveUsersMessage('Failed to mark inactive users.');
    }
    setLoading(false);
  };

  const deleteInactiveUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/delete-inactive-users`, {
        method: 'POST',
        credentials: 'include', // Include credentials for authentication
      });

      if (res.ok) {
        const data = await res.json();
        const usernames = data.users.map(user => user.username);
        console.log('Deleted users:', usernames);
        setDeletedUsersMessage(`Deleted Users:`);  // Display success message
        setDeletedUsers(data.users)
      } else {
        setDeletedUsersMessage('Error deleting users.');
      }
    } catch (err) {
      console.error('Error:', err);
      setDeletedUsersMessage('Failed to delete users.');
    }
    setLoading(false);
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole, id: userId }),
      });

      if (res.ok) {
        setUserResults(prevUsers =>
          prevUsers.map(user =>
            user.user_id === userId ? { ...user, role: newRole } : user
          )
        );

      }
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };


  const resultCardStyle = {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
    marginBottom: '0.75rem',
    color: '#1e293b',
  };

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
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '3rem 2rem',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '2rem', color: '#0f172a' }}>
          🔐 Admin Dashboard
        </h2>

        {/* Search Users */}
        <section style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontWeight: '600', color: '#475569' }}>Search Users by ID or Name</label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="e.g. 12 or alice"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
            <button
              onClick={searchUsers}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {userResults.map((user) => (
              <div key={user.user_id} style={resultCardStyle}>
                <strong>{user.username}</strong> (ID: {user.id}, Role: <select
                    value={user.role}
                    onChange={(e) => changeUserRole(user.user_id, e.target.value)}
                    >
                    <option value="user">user</option>
                    <option value="dev">dev</option>
                  </select>)
              </div>
            ))}
          </div>
        </section>

        {/* Search Events */}
        <section style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontWeight: '600', color: '#475569' }}>Search Events by ID or Name</label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="e.g. 45 or Earthquake"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
            <button
              onClick={searchEvents}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {eventResults.map((ev) => (
              <div key={ev.id} style={resultCardStyle}>
                <strong>{ev.event_name}</strong><br />
                ID: {ev.event_id}, Created by User {ev.user_id}
              </div>
            ))}
          </div>
        </section>

        {/* Categories by Event Count */}
        <section style={{ marginBottom: '3rem' }}>
          <label style={{ fontWeight: '600', color: '#475569' }}>Categories by Event Count</label>
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={fetchCategoriesByEventCount}
              style={{
                padding: '10px 16px',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#1e293b',
              }}
            >
              View
            </button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {categoriesByCount.map((cat) => (
              <div key={cat.category_id} style={resultCardStyle}>
                <strong>{cat.category_name}</strong> — {cat.event_count} events
              </div>
            ))}
          </div>
        </section>

        {/*Mark inactive users for deletion */}
        <section style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontWeight: '600', color: '#475569' }}>Delete Inactive Users</label>
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={markInactiveUsersForDeletion}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Marking Inactive Users...' : 'Mark Users for Deletion'}
            </button>
          </div>
          {inactiveUsersMessage && (
            <div style={{ marginTop: '1rem', color: '#d32f2f' }}>
              {inactiveUsersMessage}
              {inactiveUsers}
            </div>
          )}
        </section>

        {/*Delete inactive users */}
        <section style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontWeight: '600', color: '#475569' }}>Mark Users Inactive if No Activity in 90 Days</label>
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={deleteInactiveUsers}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Marking Inactive Users...' : 'Mark Users for Deletion'}
            </button>
          </div>
          {deletedUsersMessage && (
            <div style={{ marginTop: '1rem', color: '#d32f2f' }}>
              {deletedUsersMessage}
              {deletedUsers}
            </div>
          )}
        </section>

        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
    </div>
  );
}
