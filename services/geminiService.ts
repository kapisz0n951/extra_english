
import { GoogleGenAI, Type } from "@google/genai";
import { Word, Subject, Mistake } from "../types";

// Robust key retrieval for browser environments (Vite/Vercel)
const getApiKey = () => {
  const HARDCODED_KEY = "AIzaSyBlwzUAGGky6mZBvKkcu2Kd1GrmMvou7Yo";
  
  let envKey: string | undefined;
  try {
    // Check various common injection points
    envKey = (process.env.GEMINI_API_KEY as any) || (process.env.API_KEY as any);
  } catch (e) {
    // process not defined in browser
  }

  // Check if it's a placeholder string like "undefined" or empty
  const isValid = envKey && typeof envKey === 'string' && envKey !== "undefined" && envKey !== "null" && envKey.trim().length > 10;
  
  if (isValid) return envKey.trim();
  
  console.log("Using hardcoded fallback API key");
  return HARDCODED_KEY;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const explainMistakes = async (mistakes: Mistake[], subject: Subject): Promise<string> => {
  if (mistakes.length === 0) return "Świetna robota! Nie popełniłeś żadnego błędu.";

  const mistakeList = mistakes.map(m => `- Słowo: "${m.word.pl}", Twoja odpowiedź: "${m.userAnswer}", Poprawna: "${m.correctAnswer}"`).join("\n");
  
  const prompt = `Jesteś życzliwym nauczycielem przedmiotu: ${subject}. 
  Uczeń popełnił następujące błędy podczas testu:
  ${mistakeList}
  
  Wyjaśnij mu krótko (max 4-5 zdań) dlaczego te formy są poprawne i daj jedną mnemotechnikę (sposób na zapamiętanie) dla najtrudniejszego z tych słów. Odpowiedz w języku polskim.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Nie udało się wygenerować wyjaśnienia.";
  } catch (error) {
    console.error("Błąd explainMistakes:", error);
    return "Mój serwer AI odpoczywa, spróbuj ponownie później!";
  }
};

export const generateWordMnemonic = async (word: string, targetLang: string): Promise<string> => {
  const prompt = `Stwórz bardzo krótką, zabawną i łatwą do zapamiętania mnemotechnikę (skojarzenie) po polsku dla słowa "${word}" w języku ${targetLang}. Max 10 słów.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "";
  } catch (error) { 
    console.error("Błąd generateWordMnemonic:", error);
    return ""; 
  }
};

export const generateWordImage = async (word: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clean, minimalist 3D icon illustration of "${word}" on a soft pastel background, professional UI design style, cute and bright.` }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) { 
    console.error("Błąd generateWordImage:", error);
    return null; 
  }
};

export const generateEducationalLesson = async (topic: string, proficiency: string, lang: 'EN' | 'ES' = 'EN'): Promise<{ explanation: string, words: Word[] }> => {
  const langMap = { 'EN': 'angielskiego', 'ES': 'hiszpańskiego' };
  const targetLang = langMap[lang] || 'angielskiego';
  
  const prompt = `Stwórz lekcję ${targetLang} na temat: "${topic}" dla poziomu: "${proficiency}".
  Lekcja musi zawierać:
  1. Krótkie (max 3 zdania) wyjaśnienie gramatyczne lub kontekstowe po polsku.
  2. Listę 12 elementów (słów lub krótkich zdań).
  Zwróć jako JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pl: { type: Type.STRING },
                  en: { type: Type.STRING }
                },
                required: ["pl", "en"]
              }
            }
          },
          required: ["explanation", "words"]
        }
      }
    });

    // Cast JSON.parse result to any to avoid "unknown" type errors.
    const data = JSON.parse(response.text || "{}") as any;
    return {
      explanation: data.explanation || "Brak dodatkowego wyjaśnienia.",
      words: (data.words || []).map((w: any, i: number) => ({ id: `lesson-${Date.now()}-${i}`, pl: w.pl, en: w.en }))
    };
  } catch (error) {
    console.error("Błąd generateEducationalLesson:", error);
    return { explanation: "Wystąpił błąd.", words: [] };
  }
};

export const generateCategoryWords = async (categoryName: string, subject: Subject, lang: 'EN' | 'ES' = 'EN'): Promise<{ isValid: boolean, words: Word[], error?: string }> => {
  const prompt = `Jesteś generatorem słówek do nauki języka. 
  Wygeneruj dokładnie 15 unikalnych i ciekawych par słów (lub bardzo krótkich zwrotów) powiązanych z tematem: "${categoryName}".
  Przedmiot: ${subject}. 
  Język docelowy: ${lang === 'ES' ? 'hiszpański' : 'angielski'}.

  Zwróć odpowiedź TYLKO w formacie JSON o strukturze:
  {
    "isValid": true,
    "words": [
      {"pl": "słowo po polsku", "en": "słowo po angielsku/hiszpańsku"},
      ...
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { 
                  pl: { type: Type.STRING }, 
                  en: { type: Type.STRING } 
                },
                required: ["pl", "en"]
              }
            }
          },
          required: ["isValid", "words"]
        }
      }
    });
    
    const text = response.text || "{}";
    const result = JSON.parse(text) as any;
    
    if (!result.words || !Array.isArray(result.words)) {
        throw new Error("Invalid format from AI");
    }

    return { 
      isValid: result.isValid ?? true, 
      words: result.words.map((w: any, i: number) => ({ 
        id: `ai-${Date.now()}-${i}`, 
        pl: w.pl, 
        en: w.en 
      })) 
    };
  } catch (error: any) {
    console.error("Błąd generateCategoryWords:", error);
    return { 
      isValid: false, 
      words: [], 
      error: error?.message || "Nieznany błąd AI" 
    };
  }
};

export const generateMathQuestions = async (categoryName: string): Promise<Word[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Wygeneruj 14 pytań z matematyki: "${categoryName}". JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              correct: { type: Type.STRING },
              distractors: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["question", "correct", "distractors"]
          }
        }
      }
    });
    // Explicitly cast JSON result to any[] to fix mapping property access on unknown.
    const questions = JSON.parse(response.text || "[]") as any[];
    return questions.map((q: any, i: number) => ({
      id: `math-${Date.now()}-${i}`,
      pl: q.question,
      en: q.question,
      correct_form: q.correct,
      distractors: q.distractors
    }));
  } catch (error) { 
    console.error("Błąd generateMathQuestions:", error);
    return []; 
  }
};
