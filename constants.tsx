import { CaptionStyle, AspectRatio, Template, AudioTrack } from './types';

export const MOCK_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const CAPTION_STYLES: CaptionStyle[] = [
  { 
    id: 'hormozi', 
    name: 'Bold Punchy', 
    cssClass: 'font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase stroke-black stroke-2',
    previewColor: '#FACC15' 
  },
  { 
    id: 'karaoke', 
    name: 'Karaoke Glow', 
    cssClass: 'font-bold text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]',
    previewColor: '#A855F7' 
  },
  { 
    id: 'minimal', 
    name: 'Minimal Clean', 
    cssClass: 'font-medium text-white bg-black/50 px-2 rounded',
    previewColor: '#ffffff' 
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    cssClass: 'font-bold text-cyan-400 drop-shadow-[0_0_5px_#22d3ee] italic',
    previewColor: '#22d3ee'
  }
];

export const ASPECT_RATIOS = [
  { id: AspectRatio.PORTRAIT, label: '9:16 Shorts', width: 360, height: 640 },
  { id: AspectRatio.SQUARE, label: '1:1 Post', width: 500, height: 500 },
  { id: AspectRatio.LANDSCAPE, label: '16:9 Video', width: 640, height: 360 },
];

export const TEMPLATES: Template[] = [
  {
    id: 'fit',
    name: 'Fit to Screen',
    description: 'Standard full screen view',
    type: 'default',
    previewGradient: 'from-slate-700 to-slate-600'
  },
  {
    id: 'blur',
    name: 'Blurred BG',
    description: 'Fill gaps with blur',
    type: 'blur',
    previewGradient: 'from-violet-900 to-slate-900'
  },
  {
    id: 'split',
    name: 'Split View',
    description: 'Video on top, caption area below',
    type: 'split',
    previewGradient: 'from-slate-800 via-slate-800 to-black'
  },
  {
    id: 'pip',
    name: 'React Face',
    description: 'Circle cutout for reactions',
    type: 'pip',
    previewGradient: 'from-fuchsia-900 to-purple-900'
  }
];

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: '1', title: 'Viral Phonk', artist: 'Trending', duration: '2:15', category: 'Trending' },
  { id: '2', title: 'Lofi Study', artist: 'Chill Beats', duration: '3:00', category: 'Cinematic' },
  { id: '3', title: 'High Energy', artist: 'Sports', duration: '1:45', category: 'Upbeat' },
  { id: '4', title: 'Suspense Build', artist: 'Cinema', duration: '2:30', category: 'Cinematic' },
];