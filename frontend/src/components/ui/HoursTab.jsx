import { useState, useEffect } from 'react';

export default function HoursTab({ hours }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const days = [
    'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday', 'sunday'
  ];

  return (
    <>
      <button className="hours-trigger" onClick={() => setIsOpen(o => !o)}>
        Hours & Location
      </button>

      {isOpen && (
        <div className="hours-backdrop" onClick={() => setIsOpen(false)}>
          <div className="hours-tab" onClick={e => e.stopPropagation()}>
            <div className="hours-tab-header">
              <h2>Hours & Location</h2>
              <button
                className="hours-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close hours panel"
              >
                ×
              </button>
            </div>
            <div className="hours-tab-body">
              <h3>Hours</h3>
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
              <p className="hours-address">123 Wolf Street, Edmonton, AB T5J 2Z1</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hours-trigger {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 50;
          display: none;
          background-color: var(--color-rust);
          color: var(--color-cream);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.65rem 1.25rem;
          border: none;
          border-radius: 2rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: background-color 0.2s;
        }
        @media (min-width: 769px) {
          .hours-trigger {
            display: block;
          }
        }
        .hours-trigger:hover {
          background-color: var(--color-leather);
        }
        .hours-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          background-color: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px);
        }
        .hours-tab {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: min(350px, 90vw);
          background-color: var(--color-cream);
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 24px rgba(0,0,0,0.2);
        }
        .hours-tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-taupe);
        }
        .hours-tab-header h2 {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-espresso);
        }
        .hours-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--color-leather);
          cursor: pointer;
          line-height: 1;
          padding: 0.25rem 0.5rem;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        .hours-close:hover {
          background-color: var(--color-taupe);
        }
        .hours-tab-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        .hours-tab-body h3 {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-taupe);
          margin-bottom: 1rem;
        }
        .hours-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .hours-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-taupe);
          font-size: 0.9rem;
        }
        .hours-day {
          font-weight: 600;
          color: var(--color-espresso);
        }
        .hours-time {
          color: var(--color-leather);
        }
        .hours-address {
          font-size: 0.85rem;
          color: var(--color-leather);
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}