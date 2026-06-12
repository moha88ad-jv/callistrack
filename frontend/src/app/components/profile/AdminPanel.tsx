import { useState } from 'react';
import { ArrowLeft, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';

interface AdminPanelProps {
  onBack: () => void;
  onImport: (config: { region: string; tags: string[] }) => void;
}

export function AdminPanel({ onBack, onImport }: AdminPanelProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    newSpots: number;
    duplicates: number;
    outOfRange: number;
  } | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'leisure=fitness_station',
    'sport=exercise',
  ]);

  const availableTags = [
    { id: 'leisure=fitness_station', label: 'leisure=fitness_station' },
    { id: 'sport=exercise', label: 'sport=exercise' },
    { id: 'sport=parkour', label: 'sport=parkour' },
  ];

  const handleImport = () => {
    setIsImporting(true);
    setImportProgress(0);

    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          setImportResult({
            newSpots: 15,
            duplicates: 8,
            outOfRange: 3,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    onImport({ region: 'Mainz', tags: selectedTags });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-semibold">Admin: OSM-Import</h1>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Import-Konfiguration</h2>

          <div className="space-y-4">
            <div>
              <Label>Region auswählen</Label>
              <div className="flex gap-2 mt-2">
                <select className="flex-1 border rounded px-3 py-2">
                  <option>Mainz</option>
                  <option>Wiesbaden</option>
                  <option>Frankfurt</option>
                </select>
                <select className="border rounded px-3 py-2">
                  <option>Radius: 10km</option>
                  <option>Radius: 20km</option>
                  <option>Radius: 50km</option>
                </select>
              </div>
            </div>

            <div>
              <Label>OSM-Tags filtern</Label>
              <div className="mt-2 space-y-2">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Checkbox
                      id={tag.id}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <Label htmlFor={tag.id} className="font-mono text-sm cursor-pointer">
                      {tag.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {!isImporting && !importResult && (
          <Card className="p-6">
            <h3 className="font-medium mb-2">Letzter Import</h3>
            <div className="text-sm text-gray-600 mb-4">
              <p>28.04.2026, 14:32</p>
              <p className="flex items-center gap-2 text-green-600 mt-1">
                <CheckCircle className="size-4" />
                Erfolgreich (23 Spots)
              </p>
            </div>
            <Button onClick={handleImport} className="w-full">
              <Download className="size-4 mr-2" />
              Import starten
            </Button>
          </Card>
        )}

        {isImporting && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Import läuft...</h3>
            <Progress value={importProgress} className="mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="size-4" />
                Overpass-API abgefragt
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="size-4" />
                42 POIs gefunden
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="size-4 animate-spin" />
                Duplikate prüfen... ({Math.floor(importProgress / 2.5)}/42)
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="size-4 rounded-full border-2 border-gray-300" />
                Spots in Datenbank schreiben
              </div>
            </div>
          </Card>
        )}

        {importResult && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="size-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Import abgeschlossen</h3>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-semibold">{importResult.newSpots}</span> neue Spots importiert
              </p>
              <p className="text-sm text-gray-600">
                {importResult.duplicates} Duplikate übersprungen
              </p>
              <p className="text-sm text-gray-600">
                {importResult.outOfRange} außerhalb des Radius (ignoriert)
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Alle importierten Spots sind als "unvalidiert" markiert
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setImportResult(null)} className="flex-1">
                Neue Spots auf Karte zeigen
              </Button>
              <Button variant="outline" onClick={() => setImportResult(null)} className="flex-1">
                Validierungs-Queue
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Import-Historie</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm pb-3 border-b">
              <Clock className="size-4 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium">28.04.2026 – 23 Spots importiert</p>
                <p className="text-gray-600">Mainz, 10km Radius</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm pb-3 border-b">
              <Clock className="size-4 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium">15.04.2026 – 18 Spots importiert</p>
                <p className="text-gray-600">Mainz, 10km Radius</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="size-4 mt-0.5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-600">01.04.2026 – Fehlgeschlagen</p>
                <p className="text-gray-600">API-Timeout</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
