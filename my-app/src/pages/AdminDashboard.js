import React, { useState } from 'react';

export default function AdminPage() {
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [usersByCount, setUsersByCount] = useState([]);

  const [eventSearch, setEventSearch] = useState('');
  const [eventResults, setEventResults] = useState([]);

  const [categoriesByCount, setCategoriesByCount] = useState([]);

  const searchUsers = async () => {
    const res = await fetch(`http://localhost:5050/api/admin/users?search=${userSearch}`,  { credentials: 'include' });
    const data = await res.json();
    console.log('👀 API returned:', data);
    setUserResults(data);
  };
  
  
  const fetchUsersByEventCount = async () => {
    const res = await fetch(`http://localhost:5050/api/admin/users-by-event-count`,  { credentials: 'include' });
    const data = await res.json();
    setUsersByCount(data);
  };
  
  const searchEvents = async () => {
    const res = await fetch(`http://localhost:5050/api/admin/events?search=${eventSearch}`,  { credentials: 'include' });
    const data = await res.json();
    setEventResults(data);
  };
  
  const fetchCategoriesByEventCount = async () => {
    const res = await fetch(`http://localhost:5050/api/admin/categories-by-event-count`,  { credentials: 'include' });
    const data = await res.json();
    setCategoriesByCount(data);
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔐 Admin Panel</h2>

      {/* Search Users */}
      <section>
        <h3>🔍 Search User by ID or Name</h3>
        <input
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          placeholder="e.g. 12 or alice"
        />
        <button onClick={searchUsers}>Search</button>
        <ul>
          {Array.isArray(userResults) && userResults.map((user) => (
            <li key={user.user_id}>
              {user.username} (ID: {user.id}, Role: {user.role})
            </li>
          ))}
        </ul>
      </section>

      {/* Users by Event Count */}
      <section>
        <h3>📊 Users by Event Count</h3>
        <button onClick={fetchUsersByEventCount}>View</button>
        <ul>
          {Array.isArray(usersByCount) && usersByCount.map((u) => (
            <li key={u.user_id}>
              {u.username} — {u.event_count} events
            </li>
          ))}
        </ul>
      </section>

      {/* Search Events */}
      <section>
        <h3>🔍 Search Events by ID or Name</h3>
        <input
          value={eventSearch}
          onChange={(e) => setEventSearch(e.target.value)}
          placeholder="e.g. 45 or Earthquake"
        />
        <button onClick={searchEvents}>Search</button>
        <ul>
          {Array.isArray(eventResults) && eventResults.map((ev) => (
            <li key={ev.id}>
              ID: {ev.event_id}, Title: {ev.event_name}, Created by User {ev.user_id}
            </li>
          ))}
        </ul>
      </section>

      {/* Categories by Event Count */}
      <section>
        <h3>📊 Categories by Event Count</h3>
        <button onClick={fetchCategoriesByEventCount}>View</button>
        <ul>
          {Array.isArray(categoriesByCount) && categoriesByCount.map((cat) => (
            <li key={cat.category_id}>
              {cat.category_name} — {cat.event_count} events
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

