import { useState } from 'react';
import { ArrowLeft, MapPin, Star, Dumbbell } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Spot, Rating, Workout } from '../../types';

interface SpotDetailViewProps {
  spot: Spot;
  onBack: () => void;
  onRatingSubmit: (rating: number, comment: string) => void;
  onWorkoutSubmit: (workout: Workout) => void;
}

export function SpotDetailView({ spot, onBack, onRatingSubmit, onWorkoutSubmit }: SpotDetailViewProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [workoutExercise, setWorkoutExercise] = useState('');
  const [workoutReps, setWorkoutReps] = useState('');
  const [workoutSets, setWorkoutSets] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

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
    setShowSuccessMessage('Workout erfolgreich gespeichert! +10 Punkte erhalten');
    setWorkoutExercise('');
    setWorkoutReps('');
    setWorkoutSets('');
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-semibold">{spot.name}</h1>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
            <Dumbbell className="size-16 opacity-50" />
          </div>
        </Card>

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
                  <span key={eq} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-6 ${
                      i < Math.floor(spot.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{spot.rating.toFixed(1)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Bewertung abgeben</h2>
          <div className="space-y-3">
            <div>
              <Label>Deine Bewertung</Label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedRating(i + 1)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`size-8 ${
                        i < selectedRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Kurzer Kommentar (optional)</Label>
              <Textarea
                id="comment"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Was hat dir gefallen oder was könnte besser sein?"
                rows={3}
              />
            </div>
            <Button onClick={handleRatingSubmit} disabled={selectedRating === 0} className="w-full">
              Bewertung speichern
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Workout hier loggen</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="exercise">Übung</Label>
              <Input
                id="exercise"
                value={workoutExercise}
                onChange={(e) => setWorkoutExercise(e.target.value)}
                placeholder="z.B. Pull-ups"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reps">Wiederholungen</Label>
                <Input
                  id="reps"
                  type="number"
                  value={workoutReps}
                  onChange={(e) => setWorkoutReps(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="sets">Sätze</Label>
                <Input
                  id="sets"
                  type="number"
                  value={workoutSets}
                  onChange={(e) => setWorkoutSets(e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>
            <Button onClick={handleWorkoutSubmit} className="w-full">
              Workout speichern
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Vergangene Bewertungen</h2>
          <div className="space-y-3">
            {spot.ratings.map((rating) => (
              <div key={rating.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{rating.username}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < rating.stars
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(rating.date).toLocaleDateString('de-DE')}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-gray-600">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {showSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {showSuccessMessage}
        </div>
      )}
    </div>
  );
}
