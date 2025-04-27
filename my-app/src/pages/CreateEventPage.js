import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const [newCategory, setNewCategory] = useState({
    category_name: "",
    cat_description: ""
  });

  const [user_id, setuser_id] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryInputs, setCategoryInputs] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND}/api/users/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => {
        if (user) setuser_id(user.user_id);
      });

    fetch(`${BACKEND}/api/categories`)
      .then((res) => res.ok ? res.json() : [])
      .then(setCategories);
  }, []);

  const handleChange = (e) => {
    setEvent((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSource((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNewCategory = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddNewCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.category_name.trim()) {
      alert('Category name is required.');
      return;
    }

    setCategories(prev => [...prev, newCategory]);
    setSelectedCategories(prev => [...prev, 3]); // Temporary id (for now)
    setNewCategory({ category_name: "", cat_description: "" });
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
    if (!event.Name.trim()) errors.push('Name is required.');
    if (!event.Date.trim()) errors.push('Date is required.');
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (event.Date && !dateRegex.test(event.Date)) {
      errors.push('Date must be in yyyy-mm-dd format.');
    }
    if (source.Source_Year && !/^\d+$/.test(source.Source_Year.trim())) {
      errors.push('Source year must be an integer.');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const source_payload = {
      source_name: source.Source_Name,
      source_year: source.Source_Year,
      author: source.Author
    };

    const sourceRes = await fetch(`${BACKEND}/api/sources`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source_payload)
    });
    
    const sourceData = await sourceRes.json();

    if (sourceRes.ok) {
      
      const event_payload = {
        user_id: user_id,
        event_name: event.Name,
        event_date: event.Date,
        event_description: event.Description,
        source_id: sourceData.source_id,
        category_ids: selectedCategories
      };

      console.log('Event Payload:', event_payload); // Final check
    
      const eventRes = await fetch(`${BACKEND}/api/events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event_payload)
      });
    
      if (eventRes.ok) {
        alert('Event created!');
        navigate('/');
      } else {
        alert('Error creating event.');
      }
    } else {
      alert('Error creating source.');
    }
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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>
            📅 Create New Event
          </h1>
          <p style={{ fontSize: '15px', color: '#475569' }}>
            Add a new event to your timeline!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {['Name', 'Date', 'Source_Name'].map((field) => (
            <div key={field} style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                {field.replace('_', ' ')} {field !== 'Source_Name' && <span style={{ color: 'red' }}>*</span>}
              </label><br />
              <input
                type="text"
                name={field}
                value={event[field]}
                onChange={handleChange}
                required={field !== 'Source_Name'}
                placeholder={field === 'Date' ? 'yyyy-mm-dd' : ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  border: '1px solid #dbeafe',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
              Event Description
            </label><br />
            <textarea
              name="Description"
              value={event.Description}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                border: '1px solid #dbeafe',
                borderRadius: '10px',
                fontSize: '16px',
                boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
              }}
            />
          </div>

          {(source.Source_Name || '').trim() !== '' && (
            <>
              {['Source_Year', 'Author'].map((field) => (
                <div key={field} style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                    {field.replace('_', ' ')} (optional)
                  </label><br />
                  <input
                    type="text"
                    name={field}
                    value={source[field]}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '8px',
                      border: '1px solid #dbeafe',
                      borderRadius: '10px',
                      fontSize: '16px',
                      boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
                    }}
                  />
                </div>
              ))}
            </>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '1rem', color: '#1e293b' }}>
              Categories
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem', borderRadius: '10px' }}>
              {categories
                .slice()
                .sort((a, b) => a.category_name.localeCompare(b.category_name))
                .map(cat => (
                  <div key={cat.category_id} style={{ marginBottom: '0.5rem' }}>
                    <label>
                      <input
                        type="checkbox"
                        value={cat.category_id}
                        checked={selectedCategories.includes(cat.category_id)}
                        onChange={handleCheckboxChange}
                        style={{ marginRight: '8px' }}
                      />
                      {cat.category_name} — {cat.cat_description}
                    </label>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setCategoryInputs(prev => !prev)}
              style={{ ...buttonStyle, background: 'linear-gradient(to right, #f59e0b, #fbbf24)', marginBottom: '1rem' }}
            >
              {categoryInputs ? 'Hide New Category' : 'Add New Category'}
            </button>

            {categoryInputs && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    name="category_name"
                    value={newCategory.category_name}
                    onChange={handleNewCategory}
                    placeholder="Category Name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dbeafe',
                      borderRadius: '10px',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <input
                    type="text"
                    name="cat_description"
                    value={newCategory.cat_description}
                    onChange={handleNewCategory}
                    placeholder="Category Description"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dbeafe',
                      borderRadius: '10px'
                    }}
                  />
                </div>
                <button type="button" onClick={handleAddNewCategory} style={buttonStyle}>
                  Create Category
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={buttonStyle}>Create Event</button>
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
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;
