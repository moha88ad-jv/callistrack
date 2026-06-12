import { TrendingUp, Flame, Trophy, Award, Plus, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function ProgressTab() {
  const recentActivity = {
    distance: '1,77 km',
    time: '00:16:12',
    date: '30.04.2026',
  };

  const trainingPlans = [
    {
      id: '1',
      title: 'GET ACTIVE',
      subtitle: 'EINSTEIGER-INNEN',
      duration: '6-8 WOCHEN',
      description: 'Werde fit, bei der Energie & bau dir eine gesunde auf Cardio auf',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: '2',
      title: 'VOM GEHEN ZUM LAUFEN',
      subtitle: 'EINSTEIGER-INNEN',
      duration: '4 WOCHEN',
      description: 'Lern die Li',
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  const records = [
    {
      id: '1',
      title: 'Höchster Kalorienverbrauch',
      value: '125 kcal',
      icon: Flame,
      type: 'Gesamt',
    },
    {
      id: '2',
      title: 'Weiteste Distanz',
      value: '1,77 km',
      icon: TrendingUp,
      type: 'Gesamt',
    },
    {
      id: '3',
      title: 'Längste Trainingszeit',
      value: '45:32 min',
      icon: Trophy,
      type: 'Gesamt',
    },
    {
      id: '4',
      title: 'Meiste Pull-ups',
      value: '23 reps',
      icon: Award,
      type: 'Single Set',
    },
  ];

  const badges = [
    {
      id: '1',
      name: 'Night Owl',
      description: '1 Aktivität',
      milestone: 'Meilenstein',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: '2',
      name: 'Startlinie',
      description: '1 Aktivität',
      milestone: 'Meilenstein',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  const stats = [
    { label: 'Workouts', value: '45', change: '+5' },
    { label: 'Kalorien', value: '8.2k', change: '+420' },
    { label: 'Distanz', value: '24.5 km', change: '+3.2' },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">FORTSCHRITT</h1>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">AKTIVITÄTEN</h2>
            <button className="text-sm font-semibold">MEHR</button>
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-emerald-600 flex items-center justify-center">
                <TrendingUp className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{recentActivity.distance}</div>
                <div className="text-sm text-gray-600">{recentActivity.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{recentActivity.date}</div>
              </div>
            </div>
          </Card>

          <Button variant="outline" className="w-full mt-3">
            AKTIVITÄT MANUELL HINZUFÜGEN
          </Button>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">WOCHENSTATISTIK</h2>
          </div>

          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-emerald-600 font-medium">{stat.change} diese Woche</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">TRAININGSPLÄNE</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Du Marathon, neue Bestzeit oder einfach mehr Bewegung – unsere Trainingspläne passen sich an dein Level an
          </p>

          <div className="space-y-3">
            {trainingPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  <div
                    className="w-32 flex-shrink-0"
                    style={{ background: plan.image }}
                  />
                  <div className="flex-1 p-4">
                    <div className="text-xs font-semibold text-emerald-600 mb-1">
                      {plan.subtitle} • {plan.duration}
                    </div>
                    <h3 className="font-bold mb-2">{plan.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {plan.description}
                    </p>
                    <Button size="sm" variant="outline">
                      Plan ansehen
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-3">
            <Plus className="size-4 mr-2" />
            EIGENEN PLAN ERSTELLEN
          </Button>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">REKORDE</h2>
            <button className="text-sm font-semibold">MEHR</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {records.map((record) => {
              const Icon = record.icon;
              return (
                <Card key={record.id} className="p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-xs text-gray-500 mb-2">{record.type}</div>
                  <div className="size-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3 relative">
                    <Icon className="size-10 text-yellow-500" />
                    <div className="absolute -top-1 -right-1 size-6 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Trophy className="size-4 text-white" />
                    </div>
                  </div>
                  <div className="font-bold text-xl mb-1">{record.value}</div>
                  <div className="text-xs text-gray-600">{record.title}</div>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">BADGES</h2>
            <button className="text-sm font-semibold">MEHR ANZEIGEN</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <Card key={badge.id} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 mb-2">{badge.milestone}</div>
                <div
                  className="size-20 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ background: badge.color }}
                >
                  <Award className="size-12 text-white" />
                </div>
                <div className="font-bold mb-1">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="pb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-emerald-50 to-blue-50">
            <Trophy className="size-12 mx-auto mb-3 text-emerald-600" />
            <h3 className="font-bold text-lg mb-2">Setze dir neue Ziele!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Erstelle personalisierte Trainingspläne und tracke deine Fortschritte
            </p>
            <Button className="w-full">
              <Plus className="size-4 mr-2" />
              Neues Ziel erstellen
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}
