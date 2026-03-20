import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchVenueImage(venueName, location, venueType) {
  try {
    const queries = [
      `${venueName} ${location}`,
      `${venueType} ${location}`,
      `luxury venue ${location}`,
    ];

    for (const q of queries) {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        },
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
    }
    return null;
  } catch (err) {
    console.error("Unsplash error:", err);
    return null;
  }
}

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || query.trim() === "") {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    // --- Gemini prompt ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert corporate event planner. A user has described their event below.
    Return ONLY a valid JSON object with NO markdown, no backticks, no explanation.
  
    The JSON must follow this exact structure:
    {
      "venueName": "string",
      "location": "string",
      "estimatedCost": "string (e.g. $3,500 - $4,000)",
      "whyItFits": "string (2-3 sentences explaining why this venue suits the request)",
      "highlights": ["string", "string", "string"],
      "venueType": "string (e.g. mountain lodge, rooftop bar, beachfront resort, conference center)"
    }

    User's event description: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Safely parse Gemini's response
    const cleaned = text.replace(/```json|```/g, "").trim();
    const suggestion = JSON.parse(cleaned);

    const imageUrl = await fetchVenueImage(
      suggestion.venueName,
      suggestion.location,
      suggestion.venueType,
    );
    suggestion.imageUrl = imageUrl;

    // --- Save to MongoDB ---
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("searches");

    await collection.insertOne({
      query,
      suggestion,
      createdAt: new Date(),
    });

    return Response.json({ suggestion });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("searches");

    // Return last 10 searches, newest first
    const history = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return Response.json({ history });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
