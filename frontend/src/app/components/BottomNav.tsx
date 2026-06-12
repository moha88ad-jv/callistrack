import { Home, Users, Activity, BarChart3, User, BookOpen, ClipboardList } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'feed' | 'community' | 'activity' | 'progress' | 'profile' | 'wiki' | 'plans';
  onTabChange: (tab: 'feed' | 'community' | 'activity' | 'progress' | 'profile' | 'wiki' | 'plans') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'activity', label: 'Karte', icon: Activity },
    { id: 'wiki', label: 'Wiki', icon: BookOpen },
    { id: 'plans', label: 'Pläne', icon: ClipboardList },
    { id: 'progress', label: 'Fortschritt', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ] as const;

  return (
    <nav className="bg-white border-t shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 min-w-[40px] transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`size-5 mb-1 ${isActive ? 'fill-emerald-600/20' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
