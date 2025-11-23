import { GoogleGenAI, Type } from "@google/genai";
import { Clip, AnalyzedFrame, CaptionSegment } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateCaptions = async (
  frames: AnalyzedFrame[],
  duration: number
): Promise<CaptionSegment[]> => {
  if (!process.env.API_KEY) {
    // Mock captions if no API key
    return mockCaptions(duration);
  }

  try {
    const model = "gemini-2.5-flash";
    const parts: any[] = [];
    
    // Sample frames to reduce payload size for captioning task
    const sampleFrames = frames.filter((_, i) => i % 2 === 0); 
    
    sampleFrames.forEach((frame, index) => {
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: frame.data }
      });
    });

    parts.push({
      text: `
        Analyze these frames from a ${duration.toFixed(1)}s video.
        Generate a synchronized script/caption set that matches the visual action.
        
        Task: Create 4-8 caption segments.
        Format: JSON Array of objects.
        
        Requirements:
        1. Timestamps must increase and stay within 0 to ${duration}.
        2. Text should be short (3-8 words), punchy, and engaging (Shorts style).
        3. Match the likely context of the visuals.
      `
    });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: "You are an AI caption generator. You create engaging subtitles for videos based on visual context.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
              text: { type: Type.STRING }
            },
            required: ["startTime", "endTime", "text"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const rawCaptions = JSON.parse(jsonText);

    return rawCaptions.map((c: any, i: number) => ({
      id: `cap-${i}`,
      startTime: c.startTime,
      endTime: c.endTime,
      text: c.text
    }));

  } catch (error) {
    console.error("Caption Generation Error", error);
    return mockCaptions(duration);
  }
};

// Mock data fallback
const mockClips = (duration: number, minDuration: number, maxDuration: number): Clip[] => {
  const clips: Clip[] = [];
  const clipCount = 3;
  const safeDuration = Math.max(duration, maxDuration * 3); 
  const sectionSize = safeDuration / clipCount;
  
  for (let i = 0; i < clipCount; i++) {
    const clipLen = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
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

const mockCaptions = (duration: number): CaptionSegment[] => {
  const segments: CaptionSegment[] = [];
  let currentTime = 0;
  const count = Math.max(3, Math.floor(duration / 5));

  for(let i=0; i<count; i++) {
    const segmentDur = 2 + Math.random() * 3;
    if (currentTime + segmentDur > duration) break;
    
    segments.push({
      id: `mock-cap-${i}`,
      startTime: currentTime,
      endTime: currentTime + segmentDur,
      text: ["Wait for it... 😱", "This is insane!", "You won't believe this", "Best moment ever 🔥", "Check this out!"][i % 5]
    });
    currentTime += segmentDur + 0.5;
  }
  return segments;
};