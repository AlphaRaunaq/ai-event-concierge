# AI Event Concierge

An AI-powered platform that helps users plan corporate offsites. Describe your event in natural language and get an instant, structured venue proposal powered by Google Gemini.

## Live Demo

[text](https://ai-event-concierge-nu.vercel.app/)

## Tech Stack

- **Frontend** - Next.js 15 (React)
- **AI** - Google Gemini 2.5 Flash
- **Database** - MongoDB Atlas
- **Deployment** - Firebase Hosting

## Features

- Natural language event description input
- AI-generated venue proposals with name, location, cost estimate and justification
- Persistent search history saved to MongoDB
- Clean, responsive dark UI
- Loading states and error handling

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. Clone the repository

```bash
   git clone https://github.com/yourusername/ai-event-concierge.git
   cd ai-event-concierge
```

2. Install dependencies

```bash
   npm install
```

3. Create a `.env.local` file in the root directory

```bash
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=event_concierge
```

4. Run the development server

```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

| Variable         | Description                               |
| ---------------- | ----------------------------------------- |
| `GEMINI_API_KEY` | Your Google Gemini API key from AI Studio |
| `MONGODB_URI`    | Your MongoDB Atlas connection string      |
| `MONGODB_DB`     | Database name (use `event_concierge`)     |

## Project Structure

```
ai-event-concierge/
├── app/
│   ├── api/
│   │   └── suggest/
│   │       └── route.js   # Gemini + MongoDB API route
│   ├── page.js            # Main UI
│   └── layout.js          # App layout and metadata
├── lib/
│   └── mongodb.js         # MongoDB connection helper
└── .env.local             # Environment variables (never commit)
```

## API Reference

### POST /api/suggest

Takes a natural language event description and returns an AI-generated venue proposal.

**Request body:**

```json
{
  "query": "A 10-person leadership retreat in the mountains for 3 days with a $4k budget"
}
```

**Response:**

```json
{
  "suggestion": {
    "venueName": "The Lodge at Sunspot",
    "location": "Aspen, CO",
    "estimatedCost": "$3,500 - $4,000",
    "whyItFits": "...",
    "highlights": ["...", "...", "..."]
  }
}
```

### GET /api/suggest

Returns the 10 most recent searches from the database.
