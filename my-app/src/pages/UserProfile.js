import { useEffect, useState } from 'react';
import CategoryFilter from '../components/CategoryFilter';

const BACKEND = 'http://localhost:5050';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Load user, categories, and preferences
  useEffect(() => {
    fetch(`${BACKEND}/api/users/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(setUser)
      .catch(console.error);

    fetch(`${BACKEND}/api/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);

    fetch(`${BACKEND}/api/users/me/categories`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(setSelectedCategories)
      .catch(console.error);
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const savePreferences = () => {
    fetch(`${BACKEND}/api/users/me/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ category_ids: selectedCategories }),
    })
      .then((res) => {
        if (res.ok) {
          alert('Preferences saved!');
          // Optional: Re-fetch to confirm
          return fetch(`${BACKEND}/api/users/me/categories`, { credentials: 'include' });
        } else {
          throw new Error('Save failed');
        }
      })
      .then(res => res.json())
      .then(setSelectedCategories)
      .catch(console.error);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '4rem 1.5rem',
      fontFamily: '"Inter", sans-serif',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        padding: '3rem 2rem',
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#0f172a',
        }}>
          My Profile
        </h2>

        {user ? (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontWeight: '600', color: '#475569' }}>Username</label>
              <div style={{ paddingTop: '4px', color: '#1e293b' }}>{user.username}</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>
                Your Preferred Categories
              </label>
              <CategoryFilter
                categories={categories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
              />
            </div>

            <button
              onClick={savePreferences}
              style={{
                marginTop: '1rem',
                padding: '10px 18px',
                background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                border: 'none',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              }}
            >
              Save Preferences
            </button>
          </>
        ) : (
          <p style={{ color: '#64748b' }}>Loading user info...</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
