
import { GoogleGenAI, Type } from "@google/genai";
import { Word, Subject, Mistake } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const getAI = () => {
  // Hardcoded API Key provided by user for private usage.
  // This ensures AI features work on any hosting (like Vercel) without manual configuration.
  const HARDCODED_KEY = "AIzaSyBlwzUAGGky6mZBvKkcu2Kd1GrmMvou7Yo";
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || HARDCODED_KEY;
  return new GoogleGenAI({ apiKey: key });
};

const ai = getAI();

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

export const generateCategoryWords = async (categoryName: string, subject: Subject, lang: 'EN' | 'ES' = 'EN'): Promise<{ isValid: boolean, words: Word[] }> => {
  const systemInstruction = `15 unikalnych par słów dla: "${categoryName}" w subject: ${subject}. JSON format. "pl" polski, "en" docelowy.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemInstruction,
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
                properties: { pl: { type: Type.STRING }, en: { type: Type.STRING } },
                required: ["pl", "en"]
              }
            }
          },
          required: ["isValid", "words"]
        }
      }
    });
    // Cast result to any to avoid property access errors on unknown type.
    const result = JSON.parse(response.text || "{}") as any;
    return { isValid: result.isValid ?? false, words: (result.words || []).map((w: any, i: number) => ({ id: `ai-${Date.now()}-${i}`, pl: w.pl, en: w.en })) };
  } catch (error) {
    console.error("Błąd generateCategoryWords:", error);
    return { isValid: false, words: [] };
  }
};

export const generateMathQuestions = async (categoryName: string): Promise<Word[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
