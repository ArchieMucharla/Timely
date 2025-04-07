import { useEffect, useState } from 'react';
import CategoryFilter from '../components/CategoryFilter';
import EventList from '../components/EventList';
// import SearchBar from '../components/SearchBar' ← optional to add
// import EventDetail from '../components/EventDetail' ← optional modal

const BACKEND = 'http://localhost:5050';

function EventsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Fetch events when filters change
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

  // Toggle category checkbox
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🗓️ Explore Events</h1>

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
