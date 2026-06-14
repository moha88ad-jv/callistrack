import { Trophy, Dumbbell, Star, MapPin, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import type { User, Activity } from '../../types';

interface UserProfileProps {
  user: User;
  onTogglePublic: (isPublic: boolean) => void;
}

export function UserProfile({ user, onTogglePublic }: UserProfileProps) {
  const pointsToNextLevel = 500;
  const currentLevelProgress = (user.points % pointsToNextLevel);
  const progressPercentage = (currentLevelProgress / pointsToNextLevel) * 100;

  const getLevelName = (level: number) => {
    const levels = [
      'Beginner',
      'Street Newbie',
      'Park Athlete',
      'Street Athlete',
      'Calisthenics Pro',
      'Street Legend',
    ];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Master';
  };

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-10 px-4 py-4">
        <h1 className="text-2xl font-bold">PROFIL</h1>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="size-20">
              <AvatarFallback className="bg-emerald-600 text-white text-2xl">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="size-6" />
            <h2 className="text-lg font-semibold">Level & Fortschritt</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold">{user.level}</span>
                <span className="text-lg opacity-90">{getLevelName(user.level)}</span>
              </div>
              <p className="text-sm opacity-80">Aktuelle Punktezahl: {user.points.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{currentLevelProgress} / {pointsToNextLevel} Punkte</span>
                <span>bis Level {user.level + 1}</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-emerald-900/30" />
            </div>
            <div className="bg-emerald-800/40 rounded-lg p-3 mt-2">
              <p className="text-sm font-semibold mb-2">📈 So erreichst du Level {user.level + 1}:</p>
              <div className="space-y-1 text-sm opacity-90">
                <div className="flex justify-between">
                  <span>🏋️ Workout loggen</span>
                  <span>+10 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>⭐ Spot bewerten</span>
                  <span>+5 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>📍 Spot hinzufügen</span>
                  <span>+20 Punkte</span>
                </div>
                <div className="border-t border-emerald-600 pt-2 mt-2 flex justify-between font-semibold">
                  <span>Noch benötigt</span>
                  <span>{pointsToNextLevel - currentLevelProgress} Punkte</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Aktivitätsübersicht</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Dumbbell className="size-8 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold">{user.stats.workoutsCompleted}</p>
              <p className="text-xs text-gray-600">Workouts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="size-8 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">{user.stats.spotsRated}</p>
              <p className="text-xs text-gray-600">Bewertungen</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="size-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{user.stats.spotsCreated}</p>
              <p className="text-xs text-gray-600">Spots erstellt</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm">Letzte Aktivitäten</h3>
            <div className="space-y-2">
              {user.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm py-2 border-b last:border-b-0">
                  <div className="mt-0.5">
                    {activity.type === 'workout' && <Dumbbell className="size-4 text-emerald-600" />}
                    {activity.type === 'rating' && <Star className="size-4 text-yellow-500" />}
                    {activity.type === 'spot' && <MapPin className="size-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p>{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-profile" className="font-medium">
                Öffentliches Profil
              </Label>
              <p className="text-sm text-gray-600">
                Profil für Rankings und andere Nutzer sichtbar machen
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={user.isPublic}
              onCheckedChange={onTogglePublic}
            />
          </div>
        </Card>
        <Card className="p-6">
          <button
            onClick={() => {
              localStorage.removeItem('ct_token');
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut className="size-5" />
            Abmelden
          </button>
        </Card>
      </div>
    </div>
  );
}
