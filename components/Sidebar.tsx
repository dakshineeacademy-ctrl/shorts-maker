import React from 'react';
import { Upload, Type, Music, Scissors, LayoutTemplate, Settings, Video, ArrowRight } from 'lucide-react';
import { AppState } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appState: AppState;
  onUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, appState, onUploadClick }) => {
  const navItems = [
    { id: 'media', icon: Video, label: 'Media' },
    { id: 'styles', icon: Type, label: 'Captions' },
    { id: 'ai', icon: Scissors, label: 'AI Magic' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'audio', icon: Music, label: 'Audio' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-20 lg:w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-full shrink-0 z-20">
      <div className="p-4 flex items-center gap-2 border-b border-slate-800">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Shorts Maker
        </span>
      </div>

      <div className="p-4">
        <button 
          onClick={onUploadClick}
          disabled={appState === AppState.ANALYZING}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl p-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 hover:shadow-violet-600/40 group"
        >
          <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="hidden lg:block font-medium">New Project</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-slate-800 text-violet-400 shadow-inner' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            {activeTab === item.id && (
              <div className="hidden lg:block ml-auto w-1 h-1 rounded-full bg-violet-500 shadow-[0_0_8px_currentColor]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">SYSTEM: ONLINE</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;