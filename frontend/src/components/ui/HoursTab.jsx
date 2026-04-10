import { useState, useEffect } from 'react';
import './HoursTab.css';

export default function HoursTab({ hours }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const days = [
    'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday', 'sunday'
  ];

  return (
    <>
      <button
        className="hours-trigger"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-controls="hours-panel"
        aria-label="View hours and location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>Hours &amp;<br/>Location</span>
      </button>

      <div
        id="hours-panel"
        className={`hours-panel ${isOpen ? 'hours-panel--open' : ''}`}
        role="dialog"
        aria-label="Hours and Location"
        aria-modal="true"
      >
        <div className="hours-panel-header">
          <h2>Hours & Location</h2>
          <button
            className="hours-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close hours panel"
          >
            ×
          </button>
        </div>
        <div className="hours-panel-body">
          <ul className="hours-list">
            {days.map(day => (
              <li key={day}>
                <span className="hours-day">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
                <span className="hours-time">
                  {hours?.[day] ?? 'Closed'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <a
          className="hours-panel-footer"
          href="https://maps.google.com/?q=8424+109+St+NW+Edmonton+AB+T6G+1E2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open 8424 109 St NW, Edmonton, AB T6G 1E2 in Google Maps"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p className="hours-address">8424 109 St NW, Edmonton, AB T6G 1E2</p>
        </a>
      </div>

      {isOpen && (
        <div
          className="hours-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}