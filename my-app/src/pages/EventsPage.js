import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter';
import EventList from '../components/EventList';
import { useTheme } from '../components/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  useEffect(() => {
    fetch(`${BACKEND}/api/users/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then(async (user) => {
        console.log('Fetched user:', user);
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

  useEffect(() => {
    fetch(`${BACKEND}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferences) return;

    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (searchText.trim()) {
      params.set('q', searchText.trim());
    }
    if (startYear) {
      params.set('startYear', startYear);
    }
    if (endYear) {
      params.set('endYear', endYear);
    }

    fetch(`${BACKEND}/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);
  }, [selectedCategories, searchText, startYear, endYear, hasLoadedPreferences]);

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

  const exportStoryImage = async () => {
    if (events.length === 0) {
      alert('No events to share yet!');
      return;
    }
  
    const event = selectedEvent || events[events.length - 1]; // 🔥 new: selected or last event
    const titleElement = document.getElementById('story-title');
    const dateElement = document.getElementById('story-date');
    const descriptionElement = document.getElementById('story-description');
    if (titleElement) titleElement.innerText = event.event_name;
    if (dateElement) dateElement.innerText = event.event_date.slice(0, 10);
    if (descriptionElement) descriptionElement.innerText = event.event_description;
  
    setShowStoryPreview(true);
  };  

  return (
    <div style={{
      background: theme === 'dark' ? 'linear-gradient(to bottom right, #0f172a, #1e293b)' : 'linear-gradient(to bottom right, #f8fafc, #e0f2fe)', 
      minHeight: '100vh',
      padding: '3rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
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
            <h1 style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '800', 
                  margin: 0, 
                  color: theme === 'dark' ? '#e2e8f0' : '#1e293b' 
                }}>
                  Explore Events
                </h1>
              <p style={{ 
                margin: '0.3rem 0 0', 
                fontSize: '15px', 
                color: theme === 'dark' ? '#cbd5e1' : '#475569' 
              }}>
                Make timelines with all of your interests!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {currentUser ? (
                <>
                  <span style={{
                    fontSize: '14px',
                    color: theme === 'dark' ? '#cbd5e1' : '#334155'
                  }}>
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

            <div>
              <button onClick={toggleTheme} style={{
                ...buttonStyle,
                background: theme === 'dark'
                  ? 'linear-gradient(to right,rgb(226, 224, 224),rgb(138, 138, 138))'
                  : 'linear-gradient(to right,rgb(82, 82, 82),rgb(164, 164, 164))',
                padding: '8px 16px',
                fontSize: '18px',
              }}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
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

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="number"
            placeholder="Start Year"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            style={{
              padding: '14px 18px',
              width: '100%',
              maxWidth: '200px',
              borderRadius: '12px',
              border: '1px solid #dbeafe',
              fontSize: '16px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
              marginRight: '1rem'
            }}
          />
          <input
            type="number"
            placeholder="End Year"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            style={{
              padding: '14px 18px',
              width: '100%',
              maxWidth: '200px',
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
            <EventList
              events={events}
              currentUser={currentUser}
              onSelect={(event) => setSelectedEvent(event)}
              selectedEvent={selectedEvent}
            />
          )}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={exportStoryImage} style={buttonStyle}>
            Share to Instagram Story
          </button>

        </div>


        {showStoryPreview && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              position: 'relative',
              width: '360px',
              height: '640px',
              backgroundColor: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/instagramStory.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '250px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '50%',
                  maxWidth: '300px', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '20px',
                  gap: '10px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    {(selectedEvent || events[events.length - 1])?.event_name}
                  </h2>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
                    {(selectedEvent || events[events.length - 1])?.event_date.slice(0, 10)}
                  </p>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
                    {(selectedEvent || events[events.length - 1])?.event_description}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowStoryPreview(false)} style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f87171',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}>
                X
              </button>
            </div>
          </div>
        )}


        {/* Hidden Export Area */}
        <div id="exportArea" style={{
          width: '1080px',
          height: '1920px',
          position: 'relative',
          backgroundImage: 'url("/instagramStory.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          visibility: 'hidden',
          display: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '800px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '550px',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            textAlign: 'left',
            padding: '20px',
            gap: '20px',
          }}>
            <h2 id="story-title" style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0,
            }}>
              Event Title
            </h2>
            <p id="story-date" style={{
              fontSize: '32px',
              color: '#64748b',
              margin: 0,
            }}>
              Event Date
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EventsPage;
