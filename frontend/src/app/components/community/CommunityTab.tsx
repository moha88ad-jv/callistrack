import { useEffect, useState } from 'react';
import { Trophy, Users, UserPlus, UserCheck, Award } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { api, ApiRankingEntry } from '../../api';

export function CommunityTab() {
  const [users, setUsers] = useState<ApiRankingEntry[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ranking.list()
      .then(data => setUsers(data.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = async (userId: string) => {
    try {
      if (following.has(userId)) {
        await fetch(`/api/users/${userId}/follow`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('ct_token')}` }
        });
        setFollowing(prev => { const s = new Set(prev); s.delete(userId); return s; });
      } else {
        await fetch(`/api/users/${userId}/follow`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('ct_token')}` }
        });
        setFollowing(prev => new Set(prev).add(userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const challenges = [
    { id: '1', title: '100 Pull-ups Challenge', description: 'Schaffe 100 Pull-ups in einer Woche', participants: 234, daysLeft: 4, progress: 65 },
    { id: '2', title: '30 Tage Muscle-Up', description: 'Lerne den Muscle-Up in 30 Tagen', participants: 156, daysLeft: 12, progress: 40 },
  ];

  const communities = [
    { id: '1', name: 'Mainz Calisthenics Crew', members: 156, image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: '2', name: 'Rhein-Main Street Workout', members: 243, image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: '3', name: 'Beginner Gains Squad', members: 89, image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">COMMUNITY</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Challenges - nur anzeigen */}
        <section>
          <h2 className="text-lg font-bold mb-4">CHALLENGES</h2>
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Trophy className="size-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Fortschritt</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${challenge.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="size-4" />
                        <span>{challenge.participants} Teilnehmer</span>
                      </div>
                      <div className="text-emerald-600 font-medium">{challenge.daysLeft} Tage übrig</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Communities - nur anzeigen, kein Beitreten */}
        <section>
          <h2 className="text-lg font-bold mb-4">COMMUNITIES</h2>
          <div className="space-y-3">
            {communities.map((community) => (
              <Card key={community.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-16 rounded-lg flex-shrink-0" style={{ background: community.image }} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{community.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="size-4" />
                      <span>{community.members} Mitglieder</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Echte Nutzer aus DB mit Follow */}
        <section>
          <h2 className="text-lg font-bold mb-4">NUTZER</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4 text-center">
                  <Avatar className="size-16 mx-auto mb-3">
                    <AvatarFallback className="bg-emerald-600 text-white text-lg">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">{user.username}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-3">
                    <Award className="size-3" />
                    <span>Level {user.level}</span>
                    <span>•</span>
                    <span>{user.points} Punkte</span>
                  </div>
                  <Button
                    size="sm"
                    variant={following.has(user.id) ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => toggleFollow(user.id)}
                  >
                    {following.has(user.id) ? (
                      <><UserCheck className="size-4 mr-1" />Gefolgt</>
                    ) : (
                      <><UserPlus className="size-4 mr-1" />Folgen</>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
