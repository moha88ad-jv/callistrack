import { useEffect, useState } from 'react';
import { TrendingUp, Trophy, Award } from 'lucide-react';
import { Card } from '../ui/card';
import { api, ApiWorkout } from '../../api';

export function ProgressTab() {
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.workouts.myWorkouts()
      .then(data => setWorkouts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalWorkouts = workouts.length;
  const thisWeek = workouts.filter(w => {
    const diff = (new Date().getTime() - new Date(w.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const badges = [
    { id: '1', name: 'Night Owl', description: 'Erstes Training absolviert', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: '2', name: 'Startlinie', description: 'Bei CallisTrack registriert', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">FORTSCHRITT</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Statistik */}
        <section>
          <h2 className="text-lg font-bold mb-4">STATISTIK</h2>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">{totalWorkouts}</div>
                <div className="text-xs text-gray-600">Workouts gesamt</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1 text-emerald-600">{thisWeek}</div>
                <div className="text-xs text-gray-600">Diese Woche</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Letzte Workouts */}
        <section>
          <h2 className="text-lg font-bold mb-4">LETZTE AKTIVITÄTEN</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : workouts.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <TrendingUp className="size-10 mx-auto mb-2 text-gray-300" />
              <p>Noch keine Workouts. Starte auf der Karte!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout) => (
                <Card key={workout.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-600 flex items-center justify-center">
                      <TrendingUp className="size-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{workout.title ?? 'Workout'}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(workout.created_at).toLocaleDateString('de-DE')}
                      </div>
                      {workout.exercises.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {workout.exercises.map(ex => `${ex.name} ${ex.sets}×${ex.reps}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    {workout.duration_sec && (
                      <div className="text-sm text-gray-600">{Math.floor(workout.duration_sec / 60)} min</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Badges */}
        <section className="pb-8">
          <h2 className="text-lg font-bold mb-4">BADGES</h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <Card key={badge.id} className="p-4 text-center">
                <div className="size-20 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: badge.color }}>
                  <Award className="size-12 text-white" />
                </div>
                <div className="font-bold mb-1">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
