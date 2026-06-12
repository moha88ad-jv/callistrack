import { Search, User, Filter, MapPin, Plus, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface HeaderProps {
  onProfileClick: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onFilterClick: () => void;
  activeFilterCount: number;
  activeFilters: string[];
  onRemoveFilter: (filter: string) => void;
  onAddSpot: () => void;
}

export function Header({
  onProfileClick,
  onSearchChange,
  searchQuery,
  onFilterClick,
  activeFilterCount,
  activeFilters,
  onRemoveFilter,
  onAddSpot,
}: HeaderProps) {
  return (
    <header className="bg-white border-b shadow-sm z-20">
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            CS
          </div>
          <span className="font-semibold text-emerald-700 hidden sm:inline">Calisthenics</span>
        </div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Spot oder Ort suchen"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <button
          onClick={onProfileClick}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Profil öffnen"
        >
          <User className="size-6 text-gray-700" />
        </button>
      </div>

      <div className="px-4 py-2 flex items-center gap-3 border-t">
        <button
          onClick={onFilterClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
            activeFilterCount > 0
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="size-4" />
          <span className="text-sm font-medium">Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-emerald-600 px-1.5 py-0.5 rounded-full text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="size-4" />
          <span>Mainz, DE</span>
        </div>

        <div className="ml-auto">
          <Button size="sm" onClick={onAddSpot} className="gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Spot hinzufügen</span>
            <span className="sm:hidden">Neu</span>
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filter) => (
              <div
                key={filter}
                className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm"
              >
                <span>{filter}</span>
                <button
                  onClick={() => onRemoveFilter(filter)}
                  className="hover:bg-emerald-200 rounded-full p-0.5"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
