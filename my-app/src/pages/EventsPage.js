import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter';
import EventList from '../components/EventList';

const BACKEND = 'http://localhost:5050';

function EventsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Fetch login status on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/users/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  // ✅ Fetch categories on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // ✅ Fetch events when filters change
  useEffect(() => {
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
  }, [selectedCategories, searchText]);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // ✅ Log out handler
  const handleLogout = async () => {
    await fetch(`${BACKEND}/api/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setCurrentUser(null); // clear locally
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🗓️ Explore Events</h1>

      {/* ✅ Login status section */}
      <section style={{ marginBottom: '1rem' }}>
        {currentUser ? (
          <>
            <p>👋 Welcome back, <strong>{currentUser.username}</strong>!</p>
            <button onClick={() => navigate('/profile')}>My Profile</button>
            <button onClick={() => navigate('/create_event')}>Create Event</button>
            <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Log Out</button>

            {currentUser?.role === 'dev' && (
              <button onClick={() => navigate('/admin')} style={{ marginBottom: '1rem' }}>
                Go to Admin Panel
              </button>
            )}
          </>
        ) : (
          <button onClick={() => navigate('/login')}>Log In</button>
        )}
      </section>

      <section>
        <h3>Filter by Category</h3>
        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
        />
      </section>

      <section style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Search by keyword..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', maxWidth: '400px' }}
        />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Events</h3>
        {selectedCategories.length === 0 && !searchText ? (
          <p>Select categories or enter a search term to begin.</p>
        ) : (
          <EventList events={events} />
        )}
      </section>
    </div>
  );
}

export default EventsPage;
