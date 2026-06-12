import { useState } from 'react';
import { X, ArrowLeft, Camera, Upload, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spot: {
    name: string;
    description: string;
    address: string;
    equipment: string[];
    lat: number;
    lng: number;
  }) => void;
}

type Step = 'location' | 'details' | 'photo' | 'success';

const AVAILABLE_EQUIPMENT = [
  'Klimmzugstange',
  'Barren',
  'Monkey Bars',
  'Ringe',
  'Sprossenwand',
  'Dip-Station',
];

export function AddSpotModal({ isOpen, onClose, onSubmit }: AddSpotModalProps) {
  const [step, setStep]               = useState<Step>('location');
  const [location, setLocation]       = useState({ lat: 50.0297, lng: 8.2399, address: '' });
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment]     = useState<string[]>([]);

  const handleLocationConfirm = () => {
    setLocation((prev) => ({ ...prev, address: prev.address || 'Mainz, Deutschland' }));
    setStep('details');
  };

  const handleDetailsNext = () => {
    if (name && equipment.length > 0) setStep('photo');
  };

  const handlePhotoNext = () => {
    onSubmit({ name, description, address: location.address, equipment, lat: location.lat, lng: location.lng });
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('location');
    setName('');
    setDescription('');
    setEquipment([]);
    onClose();
  };

  const toggleEquipment = (eq: string) =>
    setEquipment((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Step 1: Location ── */}
        {step === 'location' && (
          <>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold">Neuen Spot hinzufügen</h2>
              <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="size-5" /></button>
            </div>
            <div className="flex-1 flex flex-col p-4">
              <div className="flex-1 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg mb-4 min-h-[180px] flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-5xl mb-2">📍</div>
                  <p className="text-sm font-medium">Karte: Mainz, Deutschland</p>
                  <p className="text-xs text-gray-500 mt-1">Standort wird auf der Karte gesetzt</p>
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="address">Adresse / Beschreibung des Standorts</Label>
                <Input
                  id="address"
                  value={location.address}
                  onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="z.B. Volkspark Mainz, Ecke Parkstraße"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleLocationConfirm} className="w-full">Standort bestätigen</Button>
            </div>
          </>
        )}

        {/* ── Step 2: Details ── */}
        {step === 'details' && (
          <>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <button onClick={() => setStep('location')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="size-5" /></button>
              <h2 className="font-semibold">Spot-Details</h2>
              <span className="text-sm text-gray-500">1/3</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <Label htmlFor="spot-name">Spot-Name <span className="text-red-500">*</span></Label>
                <Input id="spot-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Mainz Volkspark" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="spot-desc">Kurzbeschreibung</Label>
                <Textarea id="spot-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibe den Spot..." rows={3} className="mt-1" />
              </div>
              <div>
                <Label>Vorhandenes Equipment <span className="text-red-500">*</span></Label>
                <div className="mt-2 space-y-2">
                  {AVAILABLE_EQUIPMENT.map((eq) => (
                    <div key={eq} className="flex items-center gap-2">
                      <Checkbox id={`eq-${eq}`} checked={equipment.includes(eq)} onCheckedChange={() => toggleEquipment(eq)} />
                      <Label htmlFor={`eq-${eq}`} className="cursor-pointer">{eq}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button onClick={handleDetailsNext} disabled={!name || equipment.length === 0} className="w-full">Weiter</Button>
            </div>
          </>
        )}

        {/* ── Step 3: Photo ── */}
        {step === 'photo' && (
          <>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <button onClick={() => setStep('details')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="size-5" /></button>
              <h2 className="font-semibold">Fotos hinzufügen</h2>
              <span className="text-sm text-gray-500">2/3</span>
            </div>
            <div className="flex-1 p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Camera className="size-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium mb-1">Foto hochladen</p>
                <p className="text-sm text-gray-500 mb-4">(optional, aber empfohlen)</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm"><Upload className="size-4 mr-2" />Datei auswählen</Button>
                  <Button variant="outline" size="sm"><Camera className="size-4 mr-2" />Kamera</Button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                ℹ️ Fotos werden vor Veröffentlichung geprüft
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" onClick={handlePhotoNext} className="flex-1">Überspringen</Button>
              <Button onClick={handlePhotoNext} className="flex-1">Weiter</Button>
            </div>
          </>
        )}

        {/* ── Step 4: Success ── */}
        {step === 'success' && (
          <>
            <div className="px-4 py-3 border-b"><h2 className="font-semibold text-center">Erfolgreich!</h2></div>
            <div className="flex-1 p-8 text-center">
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Spot wurde eingereicht!</h3>
              <p className="text-gray-600 mb-4">Dein Spot „{name}" wird von unserem Team geprüft.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                💡 +20 Punkte beim Freischalten!
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button onClick={resetAndClose} className="flex-1">Zur Karte</Button>
              <Button variant="outline" onClick={() => { setStep('location'); setName(''); setDescription(''); setEquipment([]); }} className="flex-1">
                Weiteren Spot
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
