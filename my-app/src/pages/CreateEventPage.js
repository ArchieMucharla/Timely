import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Known bugs:
// - If Event is created without source, traces to a NULL valued source. What do we want as the default source?


function CreateEventPage() {
  const [event, setEvent] = useState({
    Name: '',
    Date: '',
    Description: '',
    source_id: ''
  });

  const [source, setSource] = useState({
    source_id: '',
    Source_Name: '',
    Author: '',
    Source_Year: '',
  });

  const BACKEND = 'http://localhost:5050';
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    // Get current user
    fetch(`${BACKEND}/api/users/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => {
        console.log(user);
        if (user) setUserId(user.userId);
      });

    // Get all categories
    fetch('http://localhost:5050/api/categories')
      .then((res) => res.ok ? res.json() : [])
      .then((selectedCategories) => {
        console.log(selectedCategories);
        setCategories(selectedCategories);
      });
  }, []);

  const handleChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value
    });
    setSource({
      ...source,
      [e.target.name]: e.target.value
    });
  };    

  const handleCheckboxChange = (e) => {
    const value = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedCategories(prev => [...prev, value]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = [];

  // Check required fields
  if (!event.Name.trim()) errors.push('Name is required.');
  if (!event.Date.trim()) errors.push('Date is required.');

  // Validate date format: yyyy-mm-dd
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (event.Date && !dateRegex.test(event.Date)) {
    errors.push('Date must be in the format yyyy-mm-dd.');
  }

  // Validate source_year (optional, but must be integer if present)
  if (event.Source_Year && !/^\d+$/.test(event.Source_Year.trim())) {
    errors.push('Source year must be an integer.');
  }

  if (errors.length > 0) {
    alert(errors.join('\n'));
    return; // Stop submission if there are errors
  }


  console.log('Submitting event:', event);

    const source_payload = {
        user_id: userId,
        event_name: event.Name,
        event_date: event.Date,
        event_description: event.Description,
        source_name: source.Source_Name,
        source_year: source.Source_Year,
        author: source.Author,
        category_ids: selectedCategories
    };

    const res = await fetch(`${BACKEND}/api/sources`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source_payload)
    });

    if (res.ok) {
        alert('Event created!');
      } else {
        alert('Error from frontend while creating event');
      }
    };

  
//** You can get rid of this -- this just changes the font because I got bored */
var link = document.createElement('link');
link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

link.onload = function() {
    const targetDiv = document.querySelector('div[style="padding: 2rem;"]');
    if (targetDiv) {
      targetDiv.style.fontFamily = "'Poppins', sans-serif";
    }
};


  return (

    <div style={{ padding: '2rem' }}>
    <h1>📅 Create New Event</h1>
    <form onSubmit={handleSubmit}>
      {['Name', 'Date', 'Source_Name'].map((field) => {
        const isOptional = field === 'Source_Name';
  
        return (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label>
              {field.replace('_', ' ')}
              {!isOptional && <span style={{ color: 'red' }}> *</span>}
            </label>
            <br />
            <input
              type="text"
              name={field}
              value={event[field]}
              onChange={handleChange}
              required={!isOptional}
              placeholder={field === 'Date' ? 'yyyy-mm-dd' : ''}
            />
          </div>
        );
      })}

<div style={{ marginBottom: '1rem' }}>
        <label>Event Description</label><br />
        <textarea
            name="Description"
            value={event.Description}
            onChange={handleChange}
            rows="4" // Controls the height (number of lines)
            cols="50" // Controls the width (number of characters per line)
            maxLength="255" // Limits to 255 characters
            placeholder="Enter event description"
        />
    </div>
    
    {(event.Source_Name || '').trim() !== '' && (
      <>
        {['Source_Year', 'Author'].map((field) => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label>
              {field.replace('_', ' ')} (optional)
            </label><br />
            <input
              type="text"
              name={field}
              value={event[field]}
              onChange={handleChange}
              placeholder="(optional)"
            />
          </div>
        ))}
      </>
    )}

     <div style={{ marginBottom: '1rem' }}>
   <label>Categories (you can select multiple)</label><br />
    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem' }}>
      {categories
      .slice() // Make a shallow copy
      .sort((a, b) => a.category_name.localeCompare(b.category_name)) // Sort alphabetically by name
      .map(cat => (
         <div key={cat.category_id}>
             <label>
             <input
                 type="checkbox"
                 value={cat.category_id}
                 checked={selectedCategories.includes(cat.category_id)}
                onChange={handleCheckboxChange}
             />
             {cat.category_name} — {cat.cat_description}
             </label>
         </div>
         ))}
     </div>
     </div>

        <button type="submit">Create Event</button>
        <button type="button" onClick={() => navigate('/')}>
             Back
        </button>
      </form>
    </div>

  );
}

export default CreateEventPage;
