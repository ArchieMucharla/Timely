import { useEffect, useState } from 'react';

function App() {
  console.log('🚀 App.js loaded');

  const [categories, setCategories] = useState([]);

  // ❗️ hardcoding this to guarantee it works
  const BACKEND = 'http://localhost:5050';

  useEffect(() => {
    console.log('🌐 Fetching from:', `${BACKEND}/api/categories`);

    fetch(`${BACKEND}/api/categories`)
      .then(res => res.json())
      .then(data => {
        console.log('✅ Fetched categories:', data);
        setCategories(data);
      })
      .catch(err => {
        console.error('❌ Fetch error:', err);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'red' }}>THIS IS RENDERING</h1>

      <h2>Categories</h2>
      {categories.length === 0 ? (
        <p>⏳ Loading or no categories found.</p>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat.category_id}>
              <strong>{cat.category_name}</strong> — {cat.cat_description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
