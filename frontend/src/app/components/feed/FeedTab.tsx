import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, TrendingUp, Plus, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { api, ApiWorkout, ApiEvent, NewsArticle } from '../../api';

interface FeedTabProps {
  isAdmin?: boolean;
}

export function FeedTab({ isAdmin }: FeedTabProps) {
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Event form
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  // News form
  const [showCreateNews, setShowCreateNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsCategory, setNewsCategory] = useState('Allgemein');

  useEffect(() => {
    Promise.all([
      api.workouts.myWorkouts(),
      api.events.list(),
      api.news.list(),
    ]).then(([workoutsData, eventsData, newsData]) => {
      setWorkouts(workoutsData);
      setEvents(eventsData);
      setNews(newsData);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoinEvent = async (event: ApiEvent) => {
    try {
      if (event.is_joined) {
        await api.events.leave(event.id);
      } else {
        await api.events.join(event.id);
      }
      setEvents(prev => prev.map(e =>
        e.id === event.id
          ? { ...e, is_joined: !e.is_joined, participant_count: e.is_joined ? e.participant_count - 1 : e.participant_count + 1 }
          : e
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.events.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async () => {
    if (!newTitle || !newLocation || !newDate) return;
    setSavingEvent(true);
    try {
      const created = await api.events.create({
        title: newTitle,
        description: newDesc || undefined,
        location: newLocation,
        event_date: new Date(newDate).toISOString(),
      });
      setEvents(prev => [...prev, { ...created, participant_count: 0, is_joined: false }]);
      setNewTitle('');
      setNewDesc('');
      setNewLocation('');
      setNewDate('');
      setShowCreateEvent(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleCreateNews = async () => {
    if (!newsTitle || !newsExcerpt) return;
    try {
      const created = await api.news.create({ title: newsTitle, excerpt: newsExcerpt, category: newsCategory });
      setNews(prev => [created, ...prev]);
      setNewsTitle('');
      setNewsExcerpt('');
      setShowCreateNews(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await api.news.delete(id);
      setNews(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">FEED</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Aktivitäten */}
        <section>
          <h2 className="text-lg font-bold mb-4">MEINE AKTIVITÄTEN</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : workouts.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <TrendingUp className="size-10 mx-auto mb-2 text-gray-300" />
              <p>Noch keine Workouts. Starte dein erstes Training!</p>
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

        {/* Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">EVENTS</h2>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowCreateEvent(!showCreateEvent)}>
                <Plus className="size-4 mr-1" />
                Event erstellen
              </Button>
            )}
          </div>

          {isAdmin && showCreateEvent && (
            <Card className="p-4 mb-3 border-2 border-emerald-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Neues Event</h3>
                <button onClick={() => setShowCreateEvent(false)}><X className="size-4 text-gray-400" /></button>
              </div>
              <div className="space-y-2 mb-3">
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titel *" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Beschreibung (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Ort *" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <Button className="w-full" onClick={handleCreateEvent} disabled={savingEvent || !newTitle || !newLocation || !newDate}>
                {savingEvent ? 'Erstellen...' : 'Event erstellen'}
              </Button>
            </Card>
          )}

          {loading ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : events.length === 0 ? (
            <Card className="p-4 text-center text-gray-500">Keine Events geplant</Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                    <h3 className="text-white font-bold text-center px-4">{event.title}</h3>
                  </div>
                  <div className="p-4">
                    {event.description && <p className="text-sm text-gray-600 mb-2">{event.description}</p>}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="size-4" />
                      <span>{new Date(event.event_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="size-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="size-4" />
                        <span>{event.participant_count} Teilnehmer</span>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin && (
                          <Button size="sm" variant="outline" className="text-red-500 border-red-300" onClick={() => handleDeleteEvent(event.id)}>
                            Löschen
                          </Button>
                        )}
                        <Button size="sm" variant={event.is_joined ? 'default' : 'outline'} onClick={() => handleJoinEvent(event)}>
                          {event.is_joined ? 'Abmelden' : 'Teilnehmen'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* News */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">NEWS & BERICHTE</h2>
            {isAdmin && (
              <button onClick={() => setShowCreateNews(!showCreateNews)} className="text-emerald-600 text-sm font-medium">
                + News erstellen
              </button>
            )}
          </div>

          {isAdmin && showCreateNews && (
            <Card className="p-4 mb-3 border-2 border-emerald-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Neue News</h3>
                <button onClick={() => setShowCreateNews(false)}><X className="size-4 text-gray-400" /></button>
              </div>
              <div className="space-y-2 mb-3">
                <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Titel *" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <textarea value={newsExcerpt} onChange={e => setNewsExcerpt(e.target.value)} placeholder="Inhalt *" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <select value={newsCategory} onChange={e => setNewsCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>Allgemein</option>
                  <option>Spots</option>
                  <option>Community</option>
                  <option>Events</option>
                  <option>Training</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleCreateNews} disabled={!newsTitle || !newsExcerpt}>
                Veröffentlichen
              </Button>
            </Card>
          )}

          <div className="space-y-3">
            {news.map((article) => (
              <Card key={article.id} className="p-4">
                <div className="flex gap-3">
                  <div className="size-20 rounded bg-gradient-to-br from-emerald-400 to-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-emerald-600">{article.category}</div>
                      {isAdmin && (
                        <button onClick={() => handleDeleteNews(article.id)} className="text-red-400 text-xs">Löschen</button>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
                    <div className="text-xs text-gray-500">{new Date(article.created_at).toLocaleDateString('de-DE')}</div>
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
