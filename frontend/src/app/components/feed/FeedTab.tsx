import { Calendar, MapPin, Users, TrendingUp, Award, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function FeedTab() {
  const workoutHistory = [
    {
      id: '1',
      date: '30.04.2026',
      time: '10:16:12',
      type: 'Pull-Workout',
      location: 'Mainz Volkspark',
      distance: '1,77 km',
      calories: 245,
    },
    {
      id: '2',
      date: '28.04.2026',
      time: '09:30:45',
      type: 'Full Body',
      location: 'Hartenberg-Park',
      distance: '2,1 km',
      calories: 312,
    },
    {
      id: '3',
      date: '25.04.2026',
      time: '18:20:10',
      type: 'Core Training',
      location: 'Rheinufer',
      distance: '0,8 km',
      calories: 180,
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Street Workout Battle Mainz',
      date: '15. Mai 2026',
      location: 'Mainz Volkspark',
      participants: 24,
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: '2',
      title: 'Calisthenics Beginner Workshop',
      date: '22. Mai 2026',
      location: 'Hartenberg-Park',
      participants: 12,
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  ];

  const news = [
    {
      id: '1',
      title: 'Neue Trainingsgeräte im Volkspark',
      excerpt: 'Die Stadt Mainz hat den Calisthenics-Park im Volkspark um zusätzliche Ringe und eine Sprossenwand erweitert.',
      date: '02.05.2026',
      category: 'Spots',
    },
    {
      id: '2',
      title: 'Interview mit Street Workout Champion',
      excerpt: 'Wir haben mit dem deutschen Meister über seine Trainingsroutine und Tipps für Anfänger gesprochen.',
      date: '28.04.2026',
      category: 'Community',
    },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">FEED</h1>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">AKTIVITÄTEN</h2>
            <button className="text-sm font-semibold">MEHR</button>
          </div>

          <div className="space-y-3">
            {workoutHistory.map((workout) => (
              <Card key={workout.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="size-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold">{workout.type}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="size-3" />
                          {workout.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{workout.date}</div>
                        <div className="text-xs text-gray-500">{workout.time}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Distanz</div>
                        <div className="font-semibold">{workout.distance}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Kalorien</div>
                        <div className="font-semibold">{workout.calories} kcal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-3">
            AKTIVITÄT MANUELL HINZUFÜGEN
          </Button>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">EVENTS</h2>
            <button className="text-sm font-semibold">ALLE ANSEHEN</button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32" style={{ background: event.image }} />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="size-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="size-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="size-4" />
                      <span>{event.participants} Teilnehmer</span>
                    </div>
                    <Button size="sm">Teilnehmen</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">NEWS & BERICHTE</h2>
            <button className="text-sm font-semibold">MEHR</button>
          </div>

          <div className="space-y-3">
            {news.map((article) => (
              <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <div className="size-20 rounded bg-gradient-to-br from-emerald-400 to-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-emerald-600 mb-1">
                      {article.category}
                    </div>
                    <h3 className="font-semibold mb-1 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
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
