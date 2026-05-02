import { LayoutDashboard, CloudRain, Brain, Cog, FileCheck } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Farm Dashboard', icon: LayoutDashboard },
    { id: 'climate', label: 'Climate & Sensors', icon: CloudRain },
    { id: 'recommendation', label: 'AI Recommendation', icon: Brain },
    { id: 'action', label: 'Action Engine', icon: Cog },
    { id: 'report', label: 'Confirmation Report', icon: FileCheck },
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-green-900 via-green-800 to-green-900 h-full flex flex-col shadow-2xl">
      <div className="p-8 border-b border-green-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C9.5 3 7.5 5 7.5 7.5C7.5 8.5 7.8 9.4 8.3 10.2L12 18L15.7 10.2C16.2 9.4 16.5 8.5 16.5 7.5C16.5 5 14.5 3 12 3Z" fill="white" opacity="0.9"/>
              <circle cx="12" cy="7.5" r="1.5" fill="white"/>
              <path d="M6 12C6 12 4 14 4 16C4 17.1 4.9 18 6 18C7.1 18 8 17.1 8 16C8 14 6 12 6 12Z" fill="white" opacity="0.6"/>
              <path d="M18 12C18 12 16 14 16 16C16 17.1 16.9 18 18 18C19.1 18 20 17.1 20 16C20 14 18 12 18 12Z" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div className="text-2xl text-white tracking-tight">PipeSense AI</div>
          </div>
        </div>
        <div className="text-xs text-green-100/80 leading-relaxed">
          From climate prediction to pipe-level irrigation action
        </div>
      </div>

      <nav className="flex-1 p-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl mb-3 transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg backdrop-blur border border-white/20'
                  : 'text-green-100/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-green-700/50">
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <div className="text-xs text-green-100/60 mb-1">Demo Mode</div>
          <div className="text-sm text-white">Tunisia Agriculture Pilot</div>
        </div>
      </div>
    </div>
  );
}
