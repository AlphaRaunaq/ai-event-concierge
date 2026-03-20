'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  // Load history on page load
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch('/api/suggest');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setCurrentSuggestion(null);

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setCurrentSuggestion(data.suggestion);
      fetchHistory();
      setQuery('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">E</div>
          <h1 className="text-lg font-semibold tracking-tight">AI Event Concierge</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Search */}
        <div>
          <p className="text-gray-400 text-sm mb-4">Describe your corporate event and get a venue proposal instantly.</p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. A 10-person leadership retreat in the mountains for 3 days with a $4k budget"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-xl text-sm font-medium transition"
            >
              {loading ? 'Planning...' : 'Plan Event'}
            </button>
          </form>

          {/* Error */}
          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
            AI is planning your event...
          </div>
        )}

        {/* Current Suggestion */}
        {currentSuggestion && (
          <div>
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest mb-3">Latest Proposal</p>
            <VenueCard suggestion={currentSuggestion} highlight />
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-3">Previous Searches</p>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item._id || index}>
                  <p className="text-xs text-gray-600 mb-2 italic">"{item.query}"</p>
                  <VenueCard suggestion={item.suggestion} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function VenueCard({ suggestion, highlight }) {
  return (
    <div className={`rounded-2xl border p-6 space-y-4 transition ${highlight ? 'bg-indigo-950 border-indigo-700' : 'bg-gray-900 border-gray-800'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{suggestion.venueName}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{suggestion.location}</p>
        </div>
        <span className="shrink-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
          {suggestion.estimatedCost}
        </span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed">{suggestion.whyItFits}</p>

      {suggestion.highlights?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestion.highlights.map((h, i) => (
            <span key={i} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}