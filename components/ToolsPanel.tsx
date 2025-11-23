import React, { useState } from 'react';
import { CaptionStyle, Clip, VideoMetadata, Template, AudioTrack, AppSettings } from '../types';
import { CAPTION_STYLES, TEMPLATES, AUDIO_TRACKS } from '../constants';
import { Wand2, Play, AlertCircle, Sparkles, Clock, UploadCloud, Check, Layout, Music, Settings as SettingsIcon, Volume2 } from 'lucide-react';

interface ToolsPanelProps {
  activeTab: string;
  clips: Clip[];
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
  metadata: VideoMetadata | null;
  onGenerateAI: () => void;
  isAnalyzing: boolean;
  selectedStyleId: string;
  onSelectStyle: (id: string) => void;
  aiContext?: string;
  setAiContext?: (text: string) => void;
  minDuration?: number;
  maxDuration?: number;
  onDurationChange?: (min: number, max: number) => void;
  onUploadClick?: () => void;
  onFileDrop?: (file: File) => void;
  selectedTemplateId?: string;
  onSelectTemplate?: (id: string) => void;
  selectedAudioId?: string;
  onSelectAudio?: (id: string) => void;
  settings?: AppSettings;
  onSettingsChange?: (settings: AppSettings) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  activeTab, 
  clips, 
  selectedClipId, 
  onSelectClip, 
  metadata,
  onGenerateAI,
  isAnalyzing,
  selectedStyleId,
  onSelectStyle,
  aiContext,
  setAiContext,
  minDuration = 15,
  maxDuration = 59,
  onDurationChange,
  onUploadClick,
  onFileDrop,
  selectedTemplateId,
  onSelectTemplate,
  selectedAudioId,
  onSelectAudio,
  settings,
  onSettingsChange
}) => {
  const [isDragging, setIsDragging] = useState(false);

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

  if (activeTab === 'media') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-4">Project Media</h2>
        {metadata ? (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden relative group">
               {/* Mock Thumbnail */}
               <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-500">
                 <Play className="w-8 h-8 text-slate-600" />
               </div>
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>
            <h3 className="font-medium text-white truncate" title={metadata.name}>{metadata.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{(metadata.duration / 60).toFixed(1)} mins • MP4</p>
          </div>
        ) : (
          <div 
            className={`text-center py-12 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragging 
                ? 'border-violet-500 bg-violet-900/20' 
                : 'border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={onUploadClick}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`p-4 rounded-full bg-slate-800/50 ${isDragging ? 'text-violet-400' : 'text-slate-500'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <div className="font-medium text-slate-300 mb-1">Drag and drop video</div>
                <div className="text-xs text-slate-500">or click to New Project</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'ai') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-fuchsia-400" />
            AI Highlights
          </h2>
        </div>

        {!clips.length ? (
          <div className="space-y-5">
             <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
               <p className="text-sm text-slate-400 leading-relaxed flex gap-2">
                 <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
                 AI will scan your video frames to detect the most engaging, viral-worthy moments.
               </p>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Context (Optional)</label>
               <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none transition-colors"
                  placeholder="e.g. This is a gaming funny moments video..."
                  rows={2}
                  value={aiContext}
                  onChange={(e) => setAiContext && setAiContext(e.target.value)}
                  disabled={isAnalyzing}
               />
             </div>

             <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                 <Clock className="w-3 h-3" />
                 Clip Duration (Sec)
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <span className="text-[10px] text-slate-500">Min (15s+)</span>
                   <input 
                     type="number"
                     min={15}
                     max={maxDuration}
                     value={minDuration}
                     onChange={(e) => onDurationChange && onDurationChange(Number(e.target.value), maxDuration)}
                     disabled={isAnalyzing}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 text-center font-mono"
                   />
                 </div>
                 <div className="space-y-1">
                   <span className="text-[10px] text-slate-500">Max (59s)</span>
                   <input 
                     type="number"
                     min={minDuration}
                     max={59}
                     value={maxDuration}
                     onChange={(e) => onDurationChange && onDurationChange(minDuration, Number(e.target.value))}
                     disabled={isAnalyzing}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 text-center font-mono"
                   />
                 </div>
               </div>
             </div>

             <button
              onClick={onGenerateAI}
              disabled={isAnalyzing || !metadata}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                isAnalyzing 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white shadow-lg shadow-fuchsia-900/30 active:scale-[0.98]'
              }`}
             >
               {isAnalyzing ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Scanning Content...
                 </>
               ) : (
                 <>
                   <Sparkles className="w-4 h-4" />
                   Auto-Detect Viral Clips
                 </>
               )}
             </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase">Found {clips.length} Clips</span>
              <button 
                onClick={onGenerateAI}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                Regenerate
              </button>
            </div>
            <div className="space-y-3">
              {clips.map((clip) => (
                <div 
                  key={clip.id}
                  onClick={() => onSelectClip(clip.id)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                    selectedClipId === clip.id 
                      ? 'bg-violet-900/20 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm leading-tight ${selectedClipId === clip.id ? 'text-violet-300' : 'text-slate-200'}`}>
                      {clip.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 whitespace-nowrap ${
                      clip.viralityScore > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {clip.viralityScore} Score
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">{clip.summary}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="bg-slate-900/50 px-1.5 py-0.5 rounded font-mono">
                      {((clip.end - clip.start)).toFixed(1)}s
                    </span>
                    <span className="text-slate-600">|</span>
                    <div className="flex gap-1 overflow-hidden max-w-[120px]">
                      {clip.keywords.slice(0, 2).map(k => (
                        <span key={k} className="text-slate-500 truncate">#{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'styles') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-4">Caption Styles</h2>
        <div className="grid grid-cols-1 gap-3">
          {CAPTION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`relative p-4 rounded-xl border text-left transition-all overflow-hidden group ${
                selectedStyleId === style.id
                  ? 'bg-slate-800 border-violet-500 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2 relative z-10">
                <span className="text-sm text-slate-400 font-medium">{style.name}</span>
                {selectedStyleId === style.id && <Check className="w-4 h-4 text-violet-500" />}
              </div>
              <div className={`text-xl ${style.cssClass} relative z-10 text-center py-2`}>
                Preview Text
              </div>
              
              {/* Glow Effect Background */}
              {selectedStyleId === style.id && (
                <div 
                  className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20"
                  style={{ backgroundColor: style.previewColor }} 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'templates') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Layout Templates
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate && onSelectTemplate(template.id)}
              className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden flex flex-col gap-2 ${
                selectedTemplateId === template.id
                  ? 'bg-slate-800 border-violet-500 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className={`w-full aspect-[9/16] rounded-md bg-gradient-to-br ${template.previewGradient} flex items-center justify-center border border-white/10`}>
                <div className="w-1/2 h-1/2 bg-white/20 rounded-sm backdrop-blur-sm" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200 truncate">{template.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{template.description}</div>
              </div>
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'audio') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Music Tracks
        </h2>
        <div className="space-y-2">
          {AUDIO_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelectAudio && onSelectAudio(track.id)}
              className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all group ${
                selectedAudioId === track.id
                  ? 'bg-slate-800 border-violet-500/50'
                  : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedAudioId === track.id ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {selectedAudioId === track.id ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-3 h-3 ml-0.5" />}
                </div>
                <div className="text-left">
                  <div className={`text-sm font-medium ${selectedAudioId === track.id ? 'text-violet-300' : 'text-slate-300'}`}>{track.title}</div>
                  <div className="text-[10px] text-slate-500">{track.artist} • {track.duration}</div>
                </div>
              </div>
              <div className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">
                {track.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Settings
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
             <h3 className="text-xs font-semibold text-slate-400 uppercase">Export</h3>
             <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Resolution</span>
                <select 
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-violet-500"
                  value={settings?.exportQuality}
                  onChange={(e) => settings && onSettingsChange && onSettingsChange({...settings, exportQuality: e.target.value as any})}
                >
                  <option value="1080p">1080p HD</option>
                  <option value="4k">4K Ultra</option>
                </select>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Watermark</span>
                <button 
                  onClick={() => settings && onSettingsChange && onSettingsChange({...settings, showWatermark: !settings.showWatermark})}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings?.showWatermark ? 'bg-violet-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings?.showWatermark ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
             <h3 className="text-xs font-semibold text-slate-400 uppercase">Automation</h3>
             <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Auto-Subtitles</span>
                <button 
                  onClick={() => settings && onSettingsChange && onSettingsChange({...settings, autoSubtitle: !settings.autoSubtitle})}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings?.autoSubtitle ? 'bg-violet-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings?.autoSubtitle ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center text-slate-500 h-full text-center">
      <AlertCircle className="w-10 h-10 mb-4 opacity-20" />
      <p className="text-sm font-medium">Select a tool from the sidebar</p>
    </div>
  );
};

export default ToolsPanel;