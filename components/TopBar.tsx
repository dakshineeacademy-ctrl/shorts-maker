import React, { useState, useRef, useEffect } from 'react';
import {
  Download, ChevronDown, Monitor, Smartphone, Square,
  Undo2, Redo2, ZoomIn, ZoomOut,
  User, Check
} from 'lucide-react';
import { AspectRatio } from '../types';

interface TopBarProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  onExport: () => void;
  isExporting: boolean;
  projectName?: string;
  canExport: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  aspectRatio,
  setAspectRatio,
  onExport,
  isExporting,
  projectName = "Untitled Project",
  canExport
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const menus = {
    file: ['New Project', 'Import Media...', 'Save Project', 'Export Settings'],
    edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'],
    view: ['Zoom In', 'Zoom Out', 'Fit to Screen', 'Show Grid'],
    help: ['Documentation', 'Keyboard Shortcuts', 'Contact Support']
  };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRatioIcon = (r: AspectRatio) => {
    switch (r) {
      case AspectRatio.PORTRAIT: return <Smartphone size={14} />;
      case AspectRatio.SQUARE: return <Square size={14} />;
      case AspectRatio.LANDSCAPE: return <Monitor size={14} />;
      default: return <Smartphone size={14} />;
    }
  };

  return (
    <div className="h-16 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-6 shrink-0 z-30 relative shadow-sm">
      {/* Left: Menus & Project Name */}
      <div className="flex items-center gap-6" ref={menuRef}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-sm font-bold text-slate-200 tracking-wide hover:text-white cursor-pointer transition-colors truncate max-w-[200px]">
              {projectName}
            </h1>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-medium">DRAFT</span>
          </div>
          
          <div className="flex items-center gap-1">
            {Object.keys(menus).map((key) => (
              <div key={key} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors uppercase tracking-wider ${
                    activeMenu === key 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {key}
                </button>
                
                {/* Dropdown Menu */}
                {activeMenu === key && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {menus[key as keyof typeof menus].map((item) => (
                      <button
                        key={item}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-violet-600 hover:text-white transition-colors flex items-center justify-between group"
                        onClick={() => setActiveMenu(null)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Tools (Undo/Redo/Zoom) */}
      <div className="hidden xl:flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800/50">
        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Undo">
          <Undo2 size={14} />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Redo">
          <Redo2 size={14} />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-1" />
        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-mono text-slate-500 w-12 text-center select-none">100%</span>
        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Zoom In">
          <ZoomIn size={14} />
        </button>
      </div>

      {/* Right: Format & Export */}
      <div className="flex items-center gap-4">
        {/* Aspect Ratio Selector */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1 pr-3 hover:border-slate-600 transition-colors">
            <div className="p-1.5 bg-slate-800 rounded text-violet-400 shadow-inner">
              {getRatioIcon(aspectRatio)}
            </div>
            <select
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer appearance-none pr-6 py-1"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            >
              <option value={AspectRatio.PORTRAIT}>9:16 Shorts</option>
              <option value={AspectRatio.SQUARE}>1:1 Post</option>
              <option value={AspectRatio.LANDSCAPE}>16:9 Landscape</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-800 mx-2" />

        <button
          onClick={onExport}
          disabled={!canExport || isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
            !canExport 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-900/20 hover:opacity-90 active:scale-95'
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <span>Export</span>
              <Download size={14} />
            </>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:border-violet-400 transition-colors ml-2 relative group">
          <User size={14} className="text-slate-400 group-hover:text-violet-300 transition-colors" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0f172a] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
