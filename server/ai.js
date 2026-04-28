import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getAiSuggestions(model, userInput, skillGap) {
  try {
    const prompt = `
      You are an expert E-commerce consultant for the Indian market.
      Analyze the following business model match for a user:
      
      User Profile:
      - Budget: ${userInput.budget}
      - Time Commitment: ${userInput.time}
      - Existing Skills: ${userInput.skills.join(', ') || 'None'}
      - Risk Appetite: ${userInput.risk}
      - Revenue Preference: ${userInput.revenue}
      
      Business Model: ${model.name}
      Skill Gap to address: ${skillGap.join(', ') || 'None'}
      
      Provide 3-4 highly specific, actionable, and personalized suggestions to help this user start this specific business model in India.
      Keep each suggestion under 15 words. Avoid generic advice.
      Return the suggestions as a JSON object with a key "suggestions" containing an array of strings.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides concise e-commerce advice in JSON format. Always include a "suggestions" key with an array of strings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    const data = JSON.parse(content);
    
    if (data.suggestions && Array.isArray(data.suggestions)) {
      return data.suggestions.slice(0, 4);
    }
    
    return [];
  } catch (error) {
    console.error('Groq AI Error:', error);
    return null; // Fallback to base suggestions
  }
}
