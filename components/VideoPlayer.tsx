import React, { useRef, useEffect, useState } from 'react';
import { AspectRatio, CaptionStyle, CaptionSegment } from '../types';
import { Maximize, Play, Pause, Volume2, VolumeX, Upload } from 'lucide-react';
import { ASPECT_RATIOS } from '../constants';

interface VideoPlayerProps {
  src: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  aspectRatio: AspectRatio;
  captionStyle: CaptionStyle;
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  onDurationChange: (duration: number) => void;
  onUploadClick?: () => void;
  onFileDrop?: (file: File) => void;
  templateId?: string;
  captions?: CaptionSegment[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  isPlaying,
  onPlayPause,
  currentTime,
  onTimeUpdate,
  aspectRatio,
  captionStyle,
  videoRef,
  onDurationChange,
  onUploadClick,
  onFileDrop,
  templateId = 'fit',
  captions = []
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  
  // Find current aspect ratio config
  const arConfig = ASPECT_RATIOS.find(ar => ar.id === aspectRatio) || ASPECT_RATIOS[0];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
      } else {
        videoRef.current.pause();
      }
    }
    
    // Sync background video
    if (bgVideoRef.current) {
      if (isPlaying) {
        bgVideoRef.current.play().catch(() => {});
      } else {
        bgVideoRef.current.pause();
      }
    }
  }, [isPlaying, videoRef]);

  // Handle seeking from outside props if needed, mostly handled by parent passing Time
  useEffect(() => {
     if(videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
       videoRef.current.currentTime = currentTime;
     }

     if(bgVideoRef.current && Math.abs(bgVideoRef.current.currentTime - currentTime) > 0.5) {
       bgVideoRef.current.currentTime = currentTime;
     }
  }, [currentTime]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/') && onFileDrop) {
      onFileDrop(file);
    }
  };

  // Helper to determine template styles
  const getContainerStyle = () => {
    if (templateId === 'blur') return { objectFit: 'contain' as const };
    if (templateId === 'split') return { height: '50%', top: 0, position: 'absolute' as const };
    return { objectFit: 'contain' as const };
  };

  // Find active caption
  const activeCaption = captions.find(c => currentTime >= c.startTime && currentTime < c.endTime);

  return (
    <div className="relative flex-1 bg-black/40 flex items-center justify-center overflow-hidden p-8" id="video-workspace">
       {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      />

      {/* The Editor Canvas */}
      <div 
        ref={containerRef}
        className="relative bg-black shadow-2xl shadow-black/50 transition-all duration-300 ease-in-out z-10 overflow-hidden group"
        style={{
          aspectRatio: arConfig.id === AspectRatio.PORTRAIT ? '9/16' : arConfig.id === AspectRatio.SQUARE ? '1/1' : '16/9',
          height: arConfig.id === AspectRatio.LANDSCAPE ? 'auto' : '85%',
          width: arConfig.id === AspectRatio.LANDSCAPE ? '85%' : 'auto',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        {!src ? (
           <div 
             className={`absolute inset-0 flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-all ${
               isDragging 
                 ? 'bg-violet-900/20 border-2 border-dashed border-violet-500' 
                 : 'hover:bg-slate-900'
             }`}
             onClick={onUploadClick}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
           >
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
               isDragging ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-400'
             }`}>
                {isDragging ? <Upload className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
             </div>
             <p className={`font-medium ${isDragging ? 'text-violet-300' : 'text-slate-400'}`}>
               {isDragging ? 'Drop video to open' : 'Import video to start editing'}
             </p>
             {!isDragging && (
               <p className="text-xs text-slate-600 mt-2">Click or drag file here</p>
             )}
           </div>
        ) : (
          <>
            {/* Background Layer for 'blur' template */}
            {templateId === 'blur' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 blur-xl scale-110">
                 <video 
                   ref={bgVideoRef}
                   src={src} 
                   className="w-full h-full object-cover" 
                   muted
                   playsInline
                 />
              </div>
            )}

            <video
              ref={videoRef}
              src={src}
              className={`w-full h-full relative z-10 ${templateId === 'split' ? 'object-cover' : 'object-contain'}`}
              style={templateId === 'split' ? { height: '50%' } : {}}
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => onDurationChange(e.currentTarget.duration)}
              loop
              playsInline
            />

            {/* Split Screen Bottom Area */}
            {templateId === 'split' && (
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-900 flex items-center justify-center z-0">
                 <p className="text-slate-600 text-xs font-mono">Reaction / Caption Area</p>
              </div>
            )}

            {/* Captions Overlay */}
            <div className={`absolute left-0 right-0 px-8 text-center pointer-events-none z-20 ${templateId === 'split' ? 'bottom-10' : 'bottom-20'}`}>
              <div className={`transition-all duration-300 ${captionStyle.cssClass}`}>
                {activeCaption ? activeCaption.text : ''}
              </div>
            </div>

            {/* Video Controls Overlay (On Hover) */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
                  className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all transform hover:scale-105 pointer-events-auto"
                >
                  {isPlaying ? <Pause className="fill-white text-white" /> : <Play className="fill-white text-white ml-1" />}
                </button>
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white pointer-events-auto">
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;