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
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [chat, setChat] = useState([]);

  const suggestedQuestions = [
    'Do they have outdoor spaces?',
    'Is this wheelchair accessible?',
    'What catering options are available?',
    'Is AV equipment included?',
    'What is the cancellation policy?',
  ];

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${suggestion.venueName} ${suggestion.location}`
  )}`;

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${suggestion.venueName} ${suggestion.location} contact`
  )}`;

  async function handleFollowUp(e) {
    e.preventDefault();
    if (!followUpQuery.trim()) return;

    const userMessage = followUpQuery.trim();
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setFollowUpQuery('');
    setFollowUpLoading(true);

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          venue: {
            venueName: suggestion.venueName,
            location: suggestion.location,
            estimatedCost: suggestion.estimatedCost,
            whyItFits: suggestion.whyItFits,
            highlights: suggestion.highlights,
          },
        }),
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }]);
    } finally {
      setFollowUpLoading(false);
    }
  }

  return (
    <div className={`rounded-2xl border overflow-hidden transition ${highlight ? 'bg-indigo-950 border-indigo-700' : 'bg-gray-900 border-gray-800'}`}>

      {/* Venue Image */}
      {suggestion.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={suggestion.imageUrl}
            alt={suggestion.venueName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{suggestion.venueName}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{suggestion.location}</p>
          </div>
          <span className="shrink-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            {suggestion.estimatedCost}
          </span>
        </div>

        {/* Why it fits */}
        <p className="text-gray-300 text-sm leading-relaxed">{suggestion.whyItFits}</p>

        {/* Highlights */}
        {suggestion.highlights?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestion.highlights.map((h, i) => (
              <span key={i} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Maps + Google buttons */}
        <div className="flex gap-2">
  <a
    href={mapsUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
  >
    📍 Open in Maps
  </a>
  <a
    href={googleUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
  >
    🔍 Search on Google
  </a>
</div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-4 space-y-3">

          {/* Chat thread */}
          {chat.length > 0 && (
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`text-xs px-3 py-2 rounded-xl max-w-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {followUpLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                    <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"/>
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggested questions chips */}
          {chat.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setFollowUpQuery(q)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-xs px-3 py-1.5 rounded-full transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Follow up input */}
          <form onSubmit={handleFollowUp} className="flex gap-2">
            <input
              type="text"
              value={followUpQuery}
              onChange={(e) => setFollowUpQuery(e.target.value)}
              placeholder={`Ask about ${suggestion.venueName}...`}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              disabled={followUpLoading}
            />
            <button
              type="submit"
              disabled={followUpLoading || !followUpQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-2 rounded-lg text-xs font-medium transition"
            >
              Ask
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}