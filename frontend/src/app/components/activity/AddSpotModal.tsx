import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, CheckCircle, MapPin, Search } from 'lucide-react';
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

type Step = 'location' | 'details' | 'success';

const AVAILABLE_EQUIPMENT = [
  'Klimmzugstange',
  'Barren',
  'Monkey Bars',
  'Ringe',
  'Sprossenwand',
  'Dip-Station',
];

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function AddSpotModal({ isOpen, onClose, onSubmit }: AddSpotModalProps) {
  const [step, setStep] = useState<Step>('location');
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [lat, setLat] = useState(50.0297);
  const [lng, setLng] = useState(8.2399);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (addressQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&limit=5&countrycodes=de&addressdetails=1&featuretype=&bounded=0`,
          { headers: { 'Accept-Language': 'de' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, [addressQuery]);

  const handleSelectAddress = (result: NominatimResult) => {
    setSelectedAddress(result.display_name);
    setAddressQuery(result.display_name);
    setLat(parseFloat(result.lat));
    setLng(parseFloat(result.lon));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleLocationConfirm = () => {
    if (!selectedAddress && !addressQuery) return;
    setStep('details');
  };

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      address: selectedAddress || addressQuery,
      equipment,
      lat,
      lng,
    });
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('location');
    setAddressQuery('');
    setSelectedAddress('');
    setLat(50.0297);
    setLng(8.2399);
    setName('');
    setDescription('');
    setEquipment([]);
    setSuggestions([]);
    onClose();
  };

  const toggleEquipment = (eq: string) =>
    setEquipment((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Step 1: Location */}
        {step === 'location' && (
          <>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold">Neuen Spot hinzufügen</h2>
              <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col p-4">
              <div className="mb-4">
                <Label htmlFor="address">Adresse suchen *</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="address"
                    value={addressQuery}
                    onChange={(e) => {
                      setAddressQuery(e.target.value);
                      setSelectedAddress('');
                    }}
                    placeholder="z.B. Volkspark Mainz"
                    className="pl-9"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Suche...</div>
                  )}
                </div>

                {/* Dropdown Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="mt-1 border rounded-lg shadow-lg bg-white max-h-48 overflow-y-auto z-50 relative">
                    {suggestions.map((result, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 border-b last:border-b-0 flex items-start gap-2"
                        onClick={() => handleSelectAddress(result)}
                      >
                        <MapPin className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 line-clamp-2">{result.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedAddress && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg flex items-start gap-2">
                    <MapPin className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-emerald-700">{selectedAddress}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg mb-4 min-h-[140px] flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-4xl mb-2">📍</div>
                  {selectedAddress ? (
                    <p className="text-sm font-medium text-emerald-700 px-4 line-clamp-2">{selectedAddress}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Adresse eingeben um Standort zu setzen</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleLocationConfirm}
                disabled={!addressQuery.trim()}
                className="w-full"
              >
                Standort bestätigen
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <button onClick={() => setStep('location')} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="size-5" />
              </button>
              <h2 className="font-semibold">Spot-Details</h2>
              <span className="text-sm text-gray-500">1/2</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-2 bg-emerald-50 rounded-lg flex items-start gap-2">
                <MapPin className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-emerald-700 line-clamp-2">{selectedAddress || addressQuery}</span>
              </div>
              <div>
                <Label htmlFor="spot-name">Spot-Name <span className="text-red-500">*</span></Label>
                <Input
                  id="spot-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Mainz Volkspark Calisthenics"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="spot-desc">Kurzbeschreibung</Label>
                <Textarea
                  id="spot-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibe den Spot..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Equipment <span className="text-red-500">*</span></Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AVAILABLE_EQUIPMENT.map((eq) => (
                    <div
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        equipment.includes(eq) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}
                    >
                      <Checkbox
                        id={`eq-${eq}`}
                        checked={equipment.includes(eq)}
                        onCheckedChange={() => toggleEquipment(eq)}
                      />
                      <Label htmlFor={`eq-${eq}`} className="cursor-pointer text-sm">{eq}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={!name || equipment.length === 0}
                className="w-full"
              >
                Spot einreichen
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <>
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-center">Erfolgreich!</h2>
            </div>
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
              <Button
                variant="outline"
                onClick={() => {
                  setStep('location');
                  setAddressQuery('');
                  setSelectedAddress('');
                  setName('');
                  setDescription('');
                  setEquipment([]);
                }}
                className="flex-1"
              >
                Weiteren Spot
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
