import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, Dumbbell, ChevronDown, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { api, WikiExercise } from '../../api';
import type { Spot, Workout } from '../../types';

interface SpotDetailViewProps {
  spot: Spot;
  onBack: () => void;
  onRatingSubmit: (rating: number, comment: string) => void;
  onWorkoutSubmit: (workout: Workout) => void;
  onDeleteSpot?: (spotId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const AVAILABLE_EQUIPMENT = ['Klimmzugstange', 'Barren', 'Monkey Bars', 'Ringe', 'Sprossenwand', 'Dip-Station'];

export function SpotDetailView({ spot, onBack, onRatingSubmit, onWorkoutSubmit, onDeleteSpot, currentUserId, isAdmin }: SpotDetailViewProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [workoutExercise, setWorkoutExercise] = useState('');
  const [workoutReps, setWorkoutReps] = useState('');
  const [workoutSets, setWorkoutSets] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [wikiExercises, setWikiExercises] = useState<WikiExercise[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(spot.name);
  const [editDesc, setEditDesc] = useState(spot.description || '');
  const [editEquipment, setEditEquipment] = useState<string[]>(spot.equipment);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = isAdmin || currentUserId === spot.createdBy;

  useEffect(() => {
    api.wiki.list().then(setWikiExercises).catch(console.error);
  }, []);

  const filteredExercises = wikiExercises.filter(ex =>
    ex.name.toLowerCase().includes(exerciseFilter.toLowerCase())
  );

  const handleSelectExercise = (ex: WikiExercise) => {
    setWorkoutExercise(ex.name);
    setShowDropdown(false);
    setExerciseFilter('');
  };

  const handleRatingSubmit = () => {
    if (selectedRating === 0) return;
    onRatingSubmit(selectedRating, ratingComment);
    setShowSuccessMessage('Danke für deine Bewertung!');
    setSelectedRating(0);
    setRatingComment('');
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const handleWorkoutSubmit = () => {
    if (!workoutExercise || !workoutReps || !workoutSets) return;
    onWorkoutSubmit({
      id: Date.now().toString(),
      spotId: spot.id,
      exercise: workoutExercise,
      reps: parseInt(workoutReps),
      sets: parseInt(workoutSets),
      date: new Date().toISOString(),
    });
    setShowSuccessMessage('Workout gespeichert! +10 Punkte');
    setWorkoutExercise('');
    setWorkoutReps('');
    setWorkoutSets('');
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.spots.update(spot.id, {
        name: editName,
        description: editDesc,
        equipment: editEquipment,
      });
      setShowSuccessMessage('Spot aktualisiert!');
      setIsEditing(false);
      setTimeout(() => setShowSuccessMessage(null), 3000);
    } catch (err: any) {
      setShowSuccessMessage('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.spots.delete(spot.id);
      onDeleteSpot?.(spot.id);
      onBack();
    } catch (err: any) {
      setShowSuccessMessage('Fehler: ' + err.message);
    }
  };

  const toggleEditEquipment = (eq: string) => {
    setEditEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);
  };

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-semibold flex-1">{spot.name}</h1>
        {canEdit && !isEditing && (
          <div className="flex gap-1">
            <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-100 rounded-full text-blue-500">
              <Pencil className="size-4" />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-gray-100 rounded-full text-red-500">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Spot löschen?</h3>
            <p className="text-gray-600 mb-4">Bist du sicher dass du "{spot.name}" löschen möchtest?</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDelete}>Löschen</Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
            <Dumbbell className="size-16 opacity-50" />
          </div>
        </Card>

        {/* Edit Form */}
        {isEditing ? (
          <Card className="p-4 border-2 border-blue-400">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Spot bearbeiten</h2>
              <button onClick={() => setIsEditing(false)}><X className="size-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Beschreibung</Label>
                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="mt-1" />
              </div>
              <div>
                <Label>Equipment</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AVAILABLE_EQUIPMENT.map(eq => (
                    <div
                      key={eq}
                      onClick={() => toggleEditEquipment(eq)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${
                        editEquipment.includes(eq) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}
                    >
                      <span>{eq}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                <Button className="flex-1" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <h2 className="font-semibold mb-3">Spot-Informationen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 text-gray-500" />
                <span>{spot.address}</span>
              </div>
              <p className="text-gray-600">{spot.description}</p>
              <div className="pt-2">
                <p className="font-medium mb-2">Vorhandene Geräte:</p>
                <div className="flex flex-wrap gap-2">
                  {spot.equipment.map((eq) => (
                    <span key={eq} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">{eq}</span>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-6 ${i < Math.floor(spot.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-lg font-medium">{spot.rating.toFixed(1)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Workout */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Workout hier loggen</h2>
          <div className="space-y-3">
            <div className="relative">
              <Label htmlFor="exercise">Übung</Label>
              <div className="relative mt-1">
                <Input
                  id="exercise"
                  value={workoutExercise}
                  onChange={(e) => { setWorkoutExercise(e.target.value); setExerciseFilter(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Übung wählen oder eingeben..."
                  autoComplete="off"
                />
                <button onClick={() => setShowDropdown(!showDropdown)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
              </div>
              {showDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  {filteredExercises.length === 0 ? (
                    <p className="text-sm text-gray-400 p-3">Keine Übungen gefunden</p>
                  ) : (
                    filteredExercises.map((ex) => (
                      <button key={ex.id} className="w-full text-left px-3 py-2 hover:bg-emerald-50 border-b last:border-b-0 flex items-center justify-between" onClick={() => handleSelectExercise(ex)}>
                        <span className="text-sm font-medium">{ex.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ex.difficulty === 'Anfänger' ? 'bg-green-100 text-green-700' : ex.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {ex.difficulty}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reps">Wiederholungen</Label>
                <Input id="reps" type="number" value={workoutReps} onChange={(e) => setWorkoutReps(e.target.value)} placeholder="10" />
              </div>
              <div>
                <Label htmlFor="sets">Sätze</Label>
                <Input id="sets" type="number" value={workoutSets} onChange={(e) => setWorkoutSets(e.target.value)} placeholder="3" />
              </div>
            </div>
            <Button onClick={handleWorkoutSubmit} disabled={!workoutExercise || !workoutReps || !workoutSets} className="w-full">
              Workout speichern
            </Button>
          </div>
        </Card>

        {/* Bewertung */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Bewertung abgeben</h2>
          <div className="space-y-3">
            <div>
              <Label>Deine Bewertung</Label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setSelectedRating(i + 1)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`size-8 ${i < selectedRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Kommentar (optional)</Label>
              <Textarea id="comment" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Was hat dir gefallen?" rows={3} />
            </div>
            <Button onClick={handleRatingSubmit} disabled={selectedRating === 0} className="w-full">
              Bewertung speichern
            </Button>
          </div>
        </Card>

        {spot.ratings.length > 0 && (
          <Card className="p-4">
            <h2 className="font-semibold mb-3">Bewertungen</h2>
            <div className="space-y-3">
              {spot.ratings.map((rating) => (
                <div key={rating.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{rating.username}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-3 ${i < rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">{new Date(rating.date).toLocaleDateString('de-DE')}</span>
                  </div>
                  {rating.comment && <p className="text-sm text-gray-600">{rating.comment}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {showSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {showSuccessMessage}
        </div>
      )}
    </div>
  );
}
