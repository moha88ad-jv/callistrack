import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface Filters {
  equipment: string[];
  minRating: number;
  showUnvalidated: boolean;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  availableEquipment: { name: string; count: number }[];
  isAdmin?: boolean;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableEquipment,
  isAdmin = false,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<Filters>(filters);

  React.useEffect(() => { setLocalFilters(filters); }, [filters]);

  const toggleEquipment = (name: string) =>
    setLocalFilters((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(name)
        ? prev.equipment.filter((e) => e !== name)
        : [...prev.equipment, name],
    }));

  const handleApply = () => { onApplyFilters(localFilters); onClose(); };

  const handleReset = () => {
    const reset: Filters = { equipment: [], minRating: 0, showUnvalidated: false };
    setLocalFilters(reset);
    onApplyFilters(reset);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filter</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Equipment */}
          <div>
            <h3 className="font-medium mb-3">Equipment (Mehrfachauswahl)</h3>
            <div className="space-y-2">
              {availableEquipment.map((eq) => (
                <div key={eq.name} className="flex items-center gap-2">
                  <Checkbox
                    id={eq.name}
                    checked={localFilters.equipment.includes(eq.name)}
                    onCheckedChange={() => toggleEquipment(eq.name)}
                  />
                  <Label htmlFor={eq.name} className="flex-1 cursor-pointer">
                    {eq.name} ({eq.count})
                  </Label>
                </div>
              ))}
              {availableEquipment.length === 0 && (
                <p className="text-sm text-gray-400">Keine Spots geladen</p>
              )}
            </div>
          </div>

          {/* Min Rating */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Bewertung</h3>
            <RadioGroup
              value={localFilters.minRating.toString()}
              onValueChange={(value: string) =>
                setLocalFilters((prev) => ({ ...prev, minRating: parseInt(value) }))
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="0" id="rating-all" />
                <Label htmlFor="rating-all" className="cursor-pointer">Alle</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="4" id="rating-4" />
                <Label htmlFor="rating-4" className="cursor-pointer">⭐⭐⭐⭐ und höher</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="5" id="rating-5" />
                <Label htmlFor="rating-5" className="cursor-pointer">⭐⭐⭐⭐⭐ (Top-bewertet)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Admin: show unvalidated */}
          {isAdmin && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Spot-Status (Admin)</h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-unvalidated"
                  checked={localFilters.showUnvalidated}
                  onCheckedChange={(checked: boolean) =>
                    setLocalFilters((prev) => ({ ...prev, showUnvalidated: checked }))
                  }
                />
                <Label htmlFor="show-unvalidated" className="cursor-pointer">
                  Unvalidierte Spots anzeigen
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">Zurücksetzen</Button>
          <Button onClick={handleApply} className="flex-1">Anwenden</Button>
        </div>
      </div>
    </>
  );
}
