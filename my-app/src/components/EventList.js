function EventList({ events }) {
    if (events.length === 0) {
      return <p>No events found for the selected categories.</p>;
    }
  
    return (
      <ul>
        {events.map(event => (
          <li key={event.event_id} style={{ marginBottom: '1rem' }}>
            <strong>{event.event_name}</strong> — {event.event_date}<br />
            {event.event_description}<br />
            <em>Categories: {event.categories}</em>
          </li>
        ))}
      </ul>
    );
  }
  
  export default EventList;
  