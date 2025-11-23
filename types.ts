export enum AspectRatio {
  PORTRAIT = '9:16',
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
}

export interface Clip {
  id: string;
  start: number; // seconds
  end: number; // seconds
  title: string;
  viralityScore: number; // 0-100
  summary: string;
  keywords: string[];
}

export interface CaptionStyle {
  id: string;
  name: string;
  cssClass: string;
  previewColor: string;
}

export interface CaptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  EDITING = 'EDITING',
  EXPORTING = 'EXPORTING',
}

export interface VideoMetadata {
  name: string;
  duration: number;
  url: string;
  thumbnailUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'default' | 'blur' | 'split' | 'pip';
  previewGradient: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  category: 'Trending' | 'Cinematic' | 'Upbeat';
}

export interface AppSettings {
  autoSubtitle: boolean;
  exportQuality: '1080p' | '4k';
  showWatermark: boolean;
}