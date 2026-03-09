// src/components/HoursPanel.jsx
import { useState, useEffect, useCallback } from 'react';

export default function HoursPanel({ apiUrl = '/api/hours' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const toggle = () => setIsOpen(open => {
    if (!open) loadData(); // Load on first open only
    return !open;
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      <button 
        className="fixed bottom-14 right-6 z-50 bg-mauve-500 text-white px-4 py-2 rounded-lg shadow-xl hover:bg-mauve-800 transition-all duration-200"
        onClick={toggle}
      >
        Hours & Locations
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggle}
        >
          <div 
            className={`
              absolute top-0 right-0 h-full w-[min(350px,33vw)] bg-white shadow-2xl
              transition-transform duration-300 ease-out
              ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Hours & Locations</h2>
              <button 
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
                onClick={toggle}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100vh-4rem)] p-6 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  Loading hours...
                </div>
              )}
              {error && (
                <div className="text-center py-12 text-red-500">
                  Error: {error}
                </div>
              )}
              {data && (
                <ul className="space-y-2 divide-y divide-gray-200">
                  {data.map((item, i) => (
                    <li key={i} className="flex justify-between py-4 first:pt-0">
                      <strong className="text-gray-900 font-medium">
                        {item.location || item.title || 'Location'}
                      </strong>
                      <span className="text-gray-600 text-sm">
                        {item.hours || item.body?.slice(0, 50) || 'No hours listed'}...
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
