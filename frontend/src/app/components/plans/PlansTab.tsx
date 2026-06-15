import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { api, TrainingPlan, WikiExercise } from '../../api';

export function PlansTab() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [wikiExercises, setWikiExercises] = useState<WikiExercise[]>([]);
  const [showExDropdown, setShowExDropdown] = useState<number | null>(null);

  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: 3, reps: 10, notes: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.wiki.list().then(setWikiExercises).catch(console.error);
  }, []);

  useEffect(() => {
    api.plans.list()
      .then(data => setPlans(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addExercise = () => {
    setExercises(prev => [...prev, { name: '', sets: 3, reps: 10, notes: '' }]);
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: string | number) => {
    setExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  const handleSubmit = async () => {
    if (!planName.trim()) { setError('Planname erforderlich'); return; }
    if (exercises.some(ex => !ex.name.trim())) { setError('Alle Übungsnamen ausfüllen'); return; }

    setSaving(true);
    setError('');
    try {
      const newPlan = await api.plans.create({
        name: planName,
        description: planDesc || undefined,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          notes: ex.notes || undefined,
        })),
      });
      setPlans(prev => [newPlan, ...prev]);
      setPlanName('');
      setPlanDesc('');
      setExercises([{ name: '', sets: 3, reps: 10, notes: '' }]);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.plans.delete(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">TRAININGSPLÄNE</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4 mr-1" />
            Neuer Plan
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {showForm && (
          <Card className="p-4 border-2 border-emerald-500">
            <h2 className="font-bold mb-4">Neuen Trainingsplan erstellen</h2>

            {error && (
              <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Planname *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder="z.B. Pull-Push-Legs"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Beschreibung</label>
                <textarea
                  value={planDesc}
                  onChange={e => setPlanDesc(e.target.value)}
                  placeholder="Optional..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <h3 className="font-semibold mb-3">Übungen</h3>
            <div className="space-y-3 mb-4">
              {exercises.map((ex, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    {/* Übung Dropdown */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={e => {
                          updateExercise(i, 'name', e.target.value);
                          setShowExDropdown(i);
                        }}
                        onFocus={() => setShowExDropdown(i)}
                        placeholder="Übung wählen oder eingeben *"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoComplete="off"
                      />
                      {showExDropdown === i && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                          {wikiExercises
                            .filter(w => w.name.toLowerCase().includes(ex.name.toLowerCase()))
                            .map(w => (
                              <button
                                key={w.id}
                                className="w-full text-left px-3 py-2 hover:bg-emerald-50 border-b last:border-b-0 flex justify-between items-center"
                                onMouseDown={() => {
                                  updateExercise(i, 'name', w.name);
                                  setShowExDropdown(null);
                                }}
                              >
                                <span className="text-sm">{w.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  w.difficulty === 'Anfänger' ? 'bg-green-100 text-green-700' :
                                  w.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {w.difficulty}
                                </span>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                    {exercises.length > 1 && (
                      <button onClick={() => removeExercise(i)} className="text-red-500 mt-2">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Sätze</label>
                      <input
                        type="number"
                        value={ex.sets}
                        min={1}
                        onChange={e => updateExercise(i, 'sets', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Wiederholungen</label>
                      <input
                        type="number"
                        value={ex.reps}
                        min={1}
                        onChange={e => updateExercise(i, 'reps', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={ex.notes}
                    onChange={e => updateExercise(i, 'notes', e.target.value)}
                    placeholder="Notizen (optional)"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mb-3" onClick={addExercise}>
              <Plus className="size-4 mr-1" />
              Übung hinzufügen
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Speichern...' : 'Plan speichern'}
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-8">Lädt...</p>
        ) : plans.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <Dumbbell className="size-10 mx-auto mb-2 text-gray-300" />
            <p className="mb-2">Noch keine Trainingspläne.</p>
            <p className="text-sm">Erstelle deinen ersten Plan!</p>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden">
              <button
                className="w-full p-4 text-left"
                onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-gray-500 mt-1">{plan.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {plan.exercises?.length ?? 0} Übungen • {new Date(plan.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {expanded === plan.id ? <ChevronUp className="size-5 text-gray-400" /> : <ChevronDown className="size-5 text-gray-400" />}
                </div>
              </button>

              {expanded === plan.id && (
                <div className="border-t px-4 pb-4 pt-3">
                  <div className="space-y-2 mb-4">
                    {plan.exercises?.map((ex, i) => (
                      <div key={ex.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="size-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{ex.name}</div>
                          <div className="text-xs text-gray-500">{ex.sets} Sätze × {ex.reps} Wdh.</div>
                          {ex.notes && <div className="text-xs text-gray-400">{ex.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                    Plan löschen
                  </button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
