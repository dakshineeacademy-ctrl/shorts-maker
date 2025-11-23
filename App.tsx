import React, { useState, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ToolsPanel from './components/ToolsPanel';
import VideoPlayer from './components/VideoPlayer';
import Timeline from './components/Timeline';
import TopBar from './components/TopBar';
import { AppState, Clip, VideoMetadata, AspectRatio, AppSettings, AnalyzedFrame, CaptionSegment } from './types';
import { generateViralClips, generateCaptions } from './services/geminiService';
import { CAPTION_STYLES, TEMPLATES, AUDIO_TRACKS } from './constants';
import { Download, Share2 } from 'lucide-react';

const App = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [activeTab, setActiveTab] = useState('media');
  
  // Video State
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Editor State
  const [clips, setClips] = useState<Clip[]>([]);
  const [frames, setFrames] = useState<AnalyzedFrame[]>([]);
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [selectedStyleId, setSelectedStyleId] = useState(CAPTION_STYLES[0].id);
  const [aiContext, setAiContext] = useState('');
  
  // New Functional States
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    autoSubtitle: true,
    exportQuality: '1080p',
    showWatermark: false
  });
  
  // Clip Duration Settings
  const [minClipDuration, setMinClipDuration] = useState(15);
  const [maxClipDuration, setMaxClipDuration] = useState(59);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!file) return;
    
    setAppState(AppState.UPLOADING);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setMetadata({
      name: file.name,
      duration: 0, // will be set by onLoadedMetadata
      url: url
    });
    setAppState(AppState.EDITING);
    // Reset state
    setClips([]);
    setFrames([]);
    setCaptions([]);
    setSelectedClipId(null);
    setActiveTab('media');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileDrop = (file: File) => {
    processFile(file);
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
    if (metadata) {
      setMetadata(prev => prev ? ({ ...prev, duration: d }) : null);
    }
  };

  // Extract frames for AI analysis
  const extractFrames = async (url: string, videoDuration: number): Promise<AnalyzedFrame[]> => {
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(true);
      video.onerror = () => resolve(false);
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const extractedFrames: AnalyzedFrame[] = [];
    const count = 9; // Increased for better AI context
    const interval = videoDuration / (count + 1);

    for (let i = 1; i <= count; i++) {
      const time = interval * i;
      video.currentTime = time;
      
      await new Promise((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve(true);
        };
        video.addEventListener('seeked', onSeeked);
        // Fallback for some browsers if seek doesn't fire immediately
        setTimeout(resolve, 500);
      });

      if (ctx) {
        // Downscale for performance and API limits
        const scale = 0.25; 
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        extractedFrames.push({
          time,
          data: canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
        });
      }
    }
    
    // Cleanup
    video.src = "";
    return extractedFrames;
  };

  const handleGenerateAI = async () => {
    if (!metadata || !videoSrc) return;
    
    setAppState(AppState.ANALYZING);
    setIsPlaying(false);

    try {
      // 1. Extract frames (or reuse if we want, but sticking to fresh extract for safety)
      const extractedFrames = await extractFrames(videoSrc, duration);
      setFrames(extractedFrames);
      
      // 2. Call Gemini
      const context = aiContext || `A video named ${metadata.name}. Identify the most engaging parts.`;
      const generatedClips = await generateViralClips(
        duration, 
        context, 
        extractedFrames,
        minClipDuration,
        maxClipDuration
      );
      
      setClips(generatedClips);
      if (generatedClips.length > 0) {
        setSelectedClipId(generatedClips[0].id);
        // Jump to first clip
        if (videoRef.current) {
          videoRef.current.currentTime = generatedClips[0].start;
        }
      }
      setActiveTab('ai');
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAppState(AppState.EDITING);
    }
  };

  const handleGenerateCaptions = async () => {
    if (frames.length === 0) {
      // If frames aren't ready, try to extract them first
      if (!metadata || !videoSrc) return;
      setIsGeneratingCaptions(true);
      try {
        const extractedFrames = await extractFrames(videoSrc, duration);
        setFrames(extractedFrames);
        const newCaptions = await generateCaptions(extractedFrames, duration);
        setCaptions(newCaptions);
      } catch (e) {
        console.error("Caption gen failed", e);
      } finally {
        setIsGeneratingCaptions(false);
      }
    } else {
      setIsGeneratingCaptions(true);
      try {
        const newCaptions = await generateCaptions(frames, duration);
        setCaptions(newCaptions);
      } catch (e) {
        console.error("Caption gen failed", e);
      } finally {
        setIsGeneratingCaptions(false);
      }
    }
  };

  const handleClipSelect = (id: string) => {
    setSelectedClipId(id);
    const clip = clips.find(c => c.id === id);
    if (clip && videoRef.current) {
      videoRef.current.currentTime = clip.start;
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleExport = () => {
    // Mock Export
    setAppState(AppState.EXPORTING);
    setTimeout(() => {
      alert(`Exporting ${clips.find(c => c.id === selectedClipId)?.title || 'Video'}.mp4\nDuration: ${minClipDuration}-${maxClipDuration}s preference applied.`);
      setAppState(AppState.EDITING);
    }, 2000);
  };

  // Auto-pause when clip ends if a clip is selected
  useEffect(() => {
    if (selectedClipId && isPlaying) {
      const clip = clips.find(c => c.id === selectedClipId);
      if (clip && currentTime >= clip.end) {
        setIsPlaying(false);
        // Loop clip
        if (videoRef.current) videoRef.current.currentTime = clip.start;
      }
    }
  }, [currentTime, selectedClipId, clips, isPlaying]);

  return (
    <Layout>
      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="video/mp4,video/mov,video/avi" 
        className="hidden" 
      />

      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        appState={appState}
        onUploadClick={handleUploadClick}
      />

      {/* Middle Tools Drawer (Expandable) */}
      <div className="w-80 bg-[#1e293b] border-r border-slate-800 flex flex-col shrink-0 transition-all">
        <ToolsPanel 
          activeTab={activeTab}
          clips={clips}
          selectedClipId={selectedClipId}
          onSelectClip={handleClipSelect}
          metadata={metadata}
          onGenerateAI={handleGenerateAI}
          isAnalyzing={appState === AppState.ANALYZING}
          selectedStyleId={selectedStyleId}
          onSelectStyle={setSelectedStyleId}
          aiContext={aiContext}
          setAiContext={setAiContext}
          minDuration={minClipDuration}
          maxDuration={maxClipDuration}
          onDurationChange={(min, max) => {
            // Validate strict bounds 15s - 59s
            const newMin = Math.max(15, Math.min(min, 58)); 
            const newMax = Math.min(59, Math.max(max, newMin + 1));
            setMinClipDuration(newMin);
            setMaxClipDuration(newMax);
          }}
          onUploadClick={handleUploadClick}
          onFileDrop={handleFileDrop}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
          selectedAudioId={selectedAudioId}
          onSelectAudio={setSelectedAudioId}
          settings={settings}
          onSettingsChange={setSettings}
          captions={captions}
          onGenerateCaptions={handleGenerateCaptions}
          isGeneratingCaptions={isGeneratingCaptions}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {/* Top Bar with Menus and Actions */}
        <TopBar 
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          onExport={handleExport}
          isExporting={appState === AppState.EXPORTING}
          projectName={metadata?.name || 'Untitled Project'}
          canExport={!!metadata}
        />

        {/* Video Editor */}
        <VideoPlayer 
          src={videoSrc}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          aspectRatio={aspectRatio}
          captionStyle={CAPTION_STYLES.find(s => s.id === selectedStyleId) || CAPTION_STYLES[0]}
          videoRef={videoRef}
          duration={duration}
          onDurationChange={handleDurationChange}
          onUploadClick={handleUploadClick}
          onFileDrop={handleFileDrop}
          templateId={selectedTemplateId}
          captions={captions}
        />

        {/* Timeline */}
        <Timeline 
          duration={duration}
          currentTime={currentTime}
          onSeek={(t) => {
             setCurrentTime(t);
             if(videoRef.current) videoRef.current.currentTime = t;
          }}
          clips={clips}
          selectedClipId={selectedClipId}
          captions={captions}
        />
      </div>
    </Layout>
  );
};

export default App;