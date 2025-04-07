import { useEffect, useState } from 'react';
import CategoryFilter from './components/CategoryFilter';
import EventList from './components/EventList';

const BACKEND = 'http://localhost:5050';

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND}/api/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setEvents([]);
      return;
    }

    const query = selectedCategories.join(',');
    fetch(`${BACKEND}/api/events?category=${query}`)
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, [selectedCategories]);

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Timeline App</h1>

      <h2>Filter by Category</h2>
      <CategoryFilter
        categories={categories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
      />

      <h2 style={{ marginTop: '2rem' }}>Events</h2>
      {selectedCategories.length > 0 ? (
        <EventList events={events} />
      ) : (
        <p>Please select one or more categories.</p>
      )}
    </div>
  );
}

export default App;
