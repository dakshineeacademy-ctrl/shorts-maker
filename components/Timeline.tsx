import React, { useRef, useState, useEffect } from 'react';
import { Clip, CaptionSegment } from '../types';
import { GripVertical } from 'lucide-react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  clips: Clip[];
  selectedClipId: string | null;
  captions?: CaptionSegment[];
}

const Timeline: React.FC<TimelineProps> = ({ duration, currentTime, onSeek, clips, selectedClipId, captions = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      onSeek(percentage * duration);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-48 bg-[#0f172a] border-t border-slate-800 flex flex-col shrink-0">
      {/* Tools Bar */}
      <div className="h-10 border-b border-slate-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span className="text-slate-600">/</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex gap-2">
            {/* Timeline Zoom controls could go here */}
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative p-4 custom-scrollbar">
        <div 
          ref={containerRef}
          className="relative h-full bg-slate-900/50 rounded-lg min-w-full"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
        >
          {/* Time Rulers / Grid */}
          <div className="absolute inset-0 flex pointer-events-none opacity-20">
             {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-slate-600 h-full" />
             ))}
          </div>

          {/* Video Track */}
          <div className="absolute top-2 left-0 right-0 h-12 bg-slate-800 rounded mx-1 overflow-hidden group">
            <div className="absolute inset-0 flex items-center opacity-30 gap-1 overflow-hidden">
               {/* Mock Frames */}
               {Array.from({ length: 40 }).map((_, i) => (
                 <div key={i} className="flex-1 h-full bg-slate-700 odd:bg-slate-600" />
               ))}
            </div>
            
            {/* Generated Clips Highlighting */}
            {clips.map((clip) => {
               const left = (clip.start / duration) * 100;
               const width = ((clip.end - clip.start) / duration) * 100;
               const isSelected = selectedClipId === clip.id;

               return (
                 <div 
                   key={clip.id}
                   className={`absolute top-0 bottom-0 border-2 rounded transition-all ${
                     isSelected 
                     ? 'border-violet-500 bg-violet-500/20 z-10' 
                     : 'border-green-500/50 bg-green-500/10'
                   }`}
                   style={{ left: `${left}%`, width: `${width}%` }}
                 >
                   {isSelected && (
                     <div className="absolute -top-6 left-0 bg-violet-500 text-white text-[10px] px-1 rounded whitespace-nowrap">
                       {clip.title}
                     </div>
                   )}
                 </div>
               );
            })}
          </div>

          {/* Audio Track */}
          <div className="absolute top-16 left-0 right-0 h-8 bg-blue-900/20 rounded mx-1 mt-2 border border-blue-900/30 flex items-center justify-center overflow-hidden">
             {/* Simple Waveform Visualization */}
             <div className="flex items-end gap-0.5 h-1/2 w-full px-2 opacity-50">
               {Array.from({ length: 100 }).map((_, i) => (
                 <div 
                   key={i} 
                   className="w-full bg-blue-400 rounded-t"
                   style={{ height: `${Math.random() * 100}%` }} 
                 />
               ))}
             </div>
          </div>

           {/* Caption Track */}
           <div className="absolute top-28 left-0 right-0 h-6 bg-yellow-900/20 rounded mx-1 mt-2 border border-yellow-900/30 overflow-hidden">
               {captions.length === 0 ? (
                 <div className="h-full w-full flex items-center px-2">
                   <span className="text-[10px] text-yellow-500 font-mono opacity-50">No Captions Generated</span>
                 </div>
               ) : (
                 <>
                   {captions.map((cap) => {
                      const left = (cap.startTime / duration) * 100;
                      const width = ((cap.endTime - cap.startTime) / duration) * 100;
                      return (
                        <div 
                          key={cap.id}
                          className="absolute top-1 bottom-1 bg-yellow-500/40 rounded-sm border border-yellow-500/60"
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={cap.text}
                        />
                      );
                   })}
                 </>
               )}
           </div>

          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rotate-45" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Timeline;