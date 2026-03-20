import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { question, venue } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a knowledgeable corporate event planning assistant.
      A user is asking a follow-up question about a specific venue suggestion.
      
      Venue details:
      - Name: ${venue.venueName}
      - Location: ${venue.location}
      - Estimated Cost: ${venue.estimatedCost}
      - Why it fits: ${venue.whyItFits}
      - Highlights: ${venue.highlights.join(', ')}
      
      User's question: "${question}"
      
      Answer helpfully and concisely in 2-3 sentences. Be specific to this venue.
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return Response.json({ answer });

  } catch (error) {
    console.error('Follow-up API error:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}