import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { api, ApiWorkout } from '../../api';

export function FeedTab() {
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.workouts.myWorkouts()
      .then(data => setWorkouts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const events = [
    { id: '1', title: 'Street Workout Battle Mainz', date: '15. Mai 2026', location: 'Mainz Volkspark', participants: 24, image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: '2', title: 'Calisthenics Beginner Workshop', date: '22. Mai 2026', location: 'Hartenberg-Park', participants: 12, image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  ];

  const news = [
    { id: '1', title: 'Neue Trainingsgeräte im Volkspark', excerpt: 'Die Stadt Mainz hat den Calisthenics-Park im Volkspark um zusätzliche Ringe erweitert.', date: '02.05.2026', category: 'Spots' },
    { id: '2', title: 'Interview mit Street Workout Champion', excerpt: 'Wir haben mit dem deutschen Meister über seine Trainingsroutine gesprochen.', date: '28.04.2026', category: 'Community' },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">FEED</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Meine Workouts */}
        <section>
          <h2 className="text-lg font-bold mb-4">MEINE AKTIVITÄTEN</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : workouts.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <TrendingUp className="size-10 mx-auto mb-2 text-gray-300" />
              <p>Noch keine Workouts. Starte dein erstes Training auf der Karte!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <Card key={workout.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold">{workout.title ?? 'Workout'}</h3>
                        <div className="text-sm text-gray-500">
                          {new Date(workout.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      {workout.exercises.length > 0 && (
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          {workout.exercises.map((ex) => (
                            <div key={ex.id}>{ex.name} — {ex.sets}×{ex.reps}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Events - nur anzeigen, kein Teilnehmen */}
        <section>
          <h2 className="text-lg font-bold mb-4">EVENTS</h2>
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-32" style={{ background: event.image }} />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="size-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="size-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="size-4" />
                    <span>{event.participants} Teilnehmer</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* News */}
        <section>
          <h2 className="text-lg font-bold mb-4">NEWS & BERICHTE</h2>
          <div className="space-y-3">
            {news.map((article) => (
              <Card key={article.id} className="p-4">
                <div className="flex gap-3">
                  <div className="size-20 rounded bg-gradient-to-br from-emerald-400 to-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-emerald-600 mb-1">{article.category}</div>
                    <h3 className="font-semibold mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
                    <div className="text-xs text-gray-500">{article.date}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
