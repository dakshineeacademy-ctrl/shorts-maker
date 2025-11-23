import { GoogleGenAI, Type } from "@google/genai";
import { Clip } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface AnalyzedFrame {
  time: number;
  data: string; // base64
}

export const generateViralClips = async (
  videoDuration: number, 
  contextDescription: string,
  frames: AnalyzedFrame[],
  minDuration: number = 15,
  maxDuration: number = 60
): Promise<Clip[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock data.");
    return mockClips(videoDuration, minDuration, maxDuration);
  }

  try {
    const model = "gemini-2.5-flash";
    
    // Construct the prompt parts
    const parts: any[] = [];
    
    // Add frames with context
    frames.forEach((frame, index) => {
      parts.push({
        text: `Frame ${index + 1} at timestamp ${frame.time.toFixed(1)}s:`
      });
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: frame.data
        }
      });
    });

    // Add the main instruction
    parts.push({
      text: `
        Analyze the ${frames.length} provided frames from a ${videoDuration}-second video.
        Context: "${contextDescription}".
        
        Task: Identify 3 distinct, viral-worthy segments suitable for Shorts/TikTok.
        
        Constraints:
        1. Each clip MUST have a duration between ${minDuration} seconds and ${maxDuration} seconds.
        2. Select the most engaging, high-energy, or funny moments.
        3. Ensure clips do not overlap significantly.
        
        Output Requirements (JSON):
        - start/end: Exact timestamps in seconds.
        - title: Clickbait-style, short, punchy (max 5 words).
        - viralityScore: 80-100 based on visual interest.
        - summary: Why this part will go viral.
        - keywords: 3-5 trending tags.
      `
    });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: "You are a professional video editor for a top social media agency. You specialize in identifying viral hooks in long-form content.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              start: { type: Type.NUMBER },
              end: { type: Type.NUMBER },
              title: { type: Type.STRING },
              viralityScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["start", "end", "title", "viralityScore", "summary"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const rawClips = JSON.parse(jsonText);

    // Post-process to ensure IDs and fallback safety
    return rawClips.map((c: any, index: number) => ({
      ...c,
      id: `generated-clip-${index}-${Date.now()}`,
      // Safety clamp just in case model hallucinates duration
      end: Math.min(c.start + maxDuration, Math.max(c.end, c.start + minDuration)) 
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return mockClips(videoDuration, minDuration, maxDuration);
  }
};

export const generateCaptions = async (text: string): Promise<any[]> => {
  // In a real app, we would send audio chunks. Here we simulate caption timing generation from text.
  // This is a placeholder for a real speech-to-text + alignment service.
  return [];
};

// Mock data fallback if API fails or key is missing
const mockClips = (duration: number, minDuration: number, maxDuration: number): Clip[] => {
  const clips: Clip[] = [];
  const clipCount = 3;
  const safeDuration = Math.max(duration, maxDuration * 3); // Ensure we have room for mock
  const sectionSize = safeDuration / clipCount;
  
  for (let i = 0; i < clipCount; i++) {
    // Generate a random duration between min and max
    const clipLen = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
    
    // Distribute clips across the video timeline
    const startWindow = i * sectionSize;
    const start = Math.min(startWindow + 10, duration - clipLen - 5);
    
    clips.push({
      id: `mock-${i}`,
      start: Math.max(0, start),
      end: Math.max(0, start) + clipLen, 
      title: `Viral Moment ${i + 1} 🔥`,
      viralityScore: 85 + Math.floor(Math.random() * 10),
      summary: "High energy segment with strong visual hook and action.",
      keywords: ["viral", "shorts", "fyp", "trending"]
    });
  }
  return clips;
};