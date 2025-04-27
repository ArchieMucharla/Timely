import { useEffect, useState } from 'react';

function EventList({ events: initialEvents, currentUser = null, onSelect, selectedEvent }) {
  const [tooltipLeft, setTooltipLeft] = useState(null);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  if (!Array.isArray(events) || events.length === 0) {
    return <p>No events found.</p>;
  }

  const handleDeleteEvent = async (event_id) => {
    try {
      const response = await fetch(`http://localhost:5050/api/events/${event_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.event_id !== event_id));
        if (onSelect && selectedEvent?.event_id === event_id) {
          onSelect(null);
        }
      } else if (response.status === 403) {
        alert("You can only delete events you have created!");
      }
    } catch (err) {
      console.error('Error deleting event (frontend)');
    }
  };

  const getTime = (date) => new Date(date).getTime();
  const timestamps = events.map((e) => getTime(e.event_date));
  const minDate = Math.min(...timestamps);
  const maxDate = Math.max(...timestamps);
  const range = maxDate - minDate;

  const minYear = new Date(minDate).getFullYear();
  const maxYear = new Date(maxDate).getFullYear();
  const tickInterval = 50;
  const yearTicks = [];
  for (let y = Math.floor(minYear / tickInterval) * tickInterval; y <= maxYear; y += tickInterval) {
    yearTicks.push(y);
  }

  return (
    <div style={{ padding: '3rem 1rem', position: 'relative' }}>
      {selectedEvent && (
        <div
          style={{
            position: 'absolute',
            left: tooltipLeft,
            transform: 'translateY(-100%)',
            top: 'calc(50% - 100px)',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1rem',
            width: '300px',
            maxWidth: '90vw',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 9999,
            textAlign: 'left',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            display: 'inline-block',
          }}
        >
          <strong
            style={{
              display: 'block',
              fontSize: '16px',
              lineHeight: '1.4',
            }}
          >
            {selectedEvent.event_name}
          </strong>
          <p style={{ fontSize: '13px', margin: '6px 0' }}>
            📅 {new Date(selectedEvent.event_date).toLocaleDateString()}
          </p>
          <p style={{ fontSize: '12px' }}>{selectedEvent.event_description}</p>
          <em style={{ fontSize: '11px', color: '#555' }}>
            Categories: {selectedEvent.categories}
          </em>
          {currentUser?.user_id === selectedEvent?.user_id && (
            <button
              onClick={() => handleDeleteEvent(selectedEvent.event_id)}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'linear-gradient(to right, #f87171, #ef4444)',
                border: 'none',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              title="Delete this event"
            >
              Delete Event
            </button>
          )}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          height: '300px',
          overflowX: 'auto',
          borderBottom: '2px solid #ccc',
          border: '1px dashed #ccc',
          paddingBottom: '4rem',
        }}
        id="timeline-scroll"
      >
        {/* Timeline Line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#ddd',
            zIndex: 1,
          }}
        />

        {/* Year Tick Marks */}
        {yearTicks.map((year) => {
          const left = ((getTime(`${year}-01-01`) - minDate) / range) * 100;
          return (
            <div
              key={year}
              style={{
                position: 'absolute',
                left: `${left}%`,
                transform: 'translateX(-50%)',
                top: 'calc(50% + 16px)',
                fontSize: '12px',
                color: '#777',
                zIndex: 2,
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '6px' }}>|</div>
              {year}
            </div>
          );
        })}

        {/* Event Dots */}
        {events.map((event) => {
          const left = ((getTime(event.event_date) - minDate) / range) * 100;
          const isSelected = selectedEvent?.event_id === event.event_id;

          return (
            <div
              key={event.event_id}
              onClick={(e) => {
                const parent = document.getElementById('timeline-scroll');
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                const absoluteLeft = rect.left - parentRect.left + parent.scrollLeft;

                const tooltipWidth = 300;
                const parentWidth = parent.offsetWidth;
                let leftPos = absoluteLeft - tooltipWidth / 2;

                if (leftPos < 8) leftPos = 8;
                if (leftPos > parentWidth - tooltipWidth - 8) {
                  leftPos = parentWidth - tooltipWidth - 8;
                }

                setTooltipLeft(`${leftPos}px`);
                if (onSelect) {
                  onSelect(isSelected ? null : event);
                }

                e.currentTarget.scrollIntoView({
                  behavior: 'smooth',
                  inline: 'center',
                  block: 'nearest',
                });
              }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: isSelected ? 'calc(50% - 9px)' : 'calc(50% - 6px)',
                width: isSelected ? '24px' : '18px',
                height: isSelected ? '24px' : '18px',
                backgroundColor: isSelected ? 'orange' : '#8884d8',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: isSelected ? 999 : 3,
                transform: 'translateX(-50%)',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default EventList;
