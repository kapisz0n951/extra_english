
import { GoogleGenAI } from "@google/genai";

// Always use the API key directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWordHint = async (word: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very short, helpful hint in Polish for the English word "${word}" in the category of "${category}". Keep it under 10 words.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      }
    });
    return response.text || "Brak podpowiedzi.";
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return "Nie udało się pobrać podpowiedzi.";
  }
};
