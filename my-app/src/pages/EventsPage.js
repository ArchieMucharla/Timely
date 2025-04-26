import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter';
import EventList from '../components/EventList';

const BACKEND = 'http://localhost:5050';

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '15px',
  background: 'linear-gradient(to right, #6366f1, #3b82f6)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: '0 4px 8px rgba(99,102,241,0.25)',
  transition: 'all 0.3s ease',
};

function EventsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/users/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then(async (user) => {
        console.log('Fetched user:', user);  // ← Add this to debug
        setCurrentUser(user);
        if (user) {
          const res = await fetch(`${BACKEND}/api/users/me/categories`, { credentials: 'include' });
          const preferred = await res.json();
          setSelectedCategories(preferred);
        }
        setHasLoadedPreferences(true);
      })
      .catch(console.error);
  }, []);
  

  // Fetch category list
  useEffect(() => {
    fetch(`${BACKEND}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Fetch filtered events
  useEffect(() => {
    if (!hasLoadedPreferences) return;

    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (searchText.trim()) {
      params.set('q', searchText.trim());
    }

    fetch(`${BACKEND}/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);
  }, [selectedCategories, searchText, hasLoadedPreferences]);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleLogout = async () => {
    await fetch(`${BACKEND}/api/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setCurrentUser(null);
  };

  return (
    <div style={{
      background: 'linear-gradient(to bottom right, #f8fafc, #e0f2fe)',
      minHeight: '100vh',
      padding: '3rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
        padding: '3rem 2rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#c7d2fe',
              color: '#4338ca',
              fontSize: '2rem',
              padding: '0.6rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3.5rem',
              height: '3.5rem',
              fontWeight: 'bold',
            }}>🗓️</div>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                Explore Events
              </h1>
              <p style={{ margin: '0.3rem 0 0', fontSize: '15px', color: '#475569' }}>
                Make timelines with all of your interests!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {currentUser ? (
              <>
                <span style={{ fontSize: '14px', color: '#334155' }}>
                  Welcome, <strong>{currentUser.username}</strong>
                </span>
                <button onClick={() => navigate('/profile')} style={buttonStyle}>Profile</button>
                <button onClick={() => navigate('/leaderboard')} style={buttonStyle}>Leaderboard</button>
                <button onClick={() => navigate('/create_event')} style={buttonStyle}>Create Event</button>
                <button onClick={handleLogout} style={buttonStyle}>Log Out</button>
                {currentUser?.role === 'dev' && (
                  <button onClick={() => navigate('/admin')} style={buttonStyle}>Admin</button>
                )}
              </>
            ) : (
              <button onClick={() => navigate('/login')} style={buttonStyle}>Log In</button>
            )}

          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
            Filter by Category
          </h3>
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search by keyword..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              padding: '14px 18px',
              width: '100%',
              maxWidth: '550px',
              borderRadius: '12px',
              border: '1px solid #dbeafe',
              fontSize: '16px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
            }}
          />
        </div>

        <div>
          <h3 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '1.25rem', color: '#1e293b' }}>
            Events
          </h3>
          {selectedCategories.length === 0 && !searchText ? (
            <p style={{ color: '#64748b' }}>
              Select categories or enter a search term to begin.
            </p>
          ) : (
            currentUser && (
              <EventList events={events} currentUser={currentUser} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
