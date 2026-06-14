import { useEffect, useState } from 'react';
import { Trophy, Users, UserPlus, UserCheck, Award, Plus, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { api, ApiRankingEntry, Community } from '../../api';

export function CommunityTab() {
  const [users, setUsers] = useState<ApiRankingEntry[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.ranking.list(),
      api.communities.list(),
      api.users.followingList(),
    ]).then(([usersData, communitiesData, followingIds]) => {
      setUsers(usersData.slice(0, 6));
      setCommunities(communitiesData);
      setFollowing(new Set(followingIds));
    }).catch(console.error)
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

  const toggleCommunity = async (community: Community) => {
    try {
      if (community.is_member) {
        await api.communities.leave(community.id);
      } else {
        await api.communities.join(community.id);
      }
      setCommunities(prev => prev.map(c =>
        c.id === community.id
          ? { ...c, is_member: !c.is_member, member_count: c.is_member ? c.member_count - 1 : c.member_count + 1 }
          : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await api.communities.create({
        name: newName,
        description: newDesc || undefined,
      });
      setCommunities(prev => [{ ...created, member_count: 1, is_member: true }, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const challenges = [
    { id: '1', title: '100 Pull-ups Challenge', description: 'Schaffe 100 Pull-ups in einer Woche', participants: 234, daysLeft: 4, progress: 65 },
    { id: '2', title: '30 Tage Muscle-Up', description: 'Lerne den Muscle-Up in 30 Tagen', participants: 156, daysLeft: 12, progress: 40 },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">COMMUNITY</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Challenges */}
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

        {/* Communities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">COMMUNITIES</h2>
            <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="size-4 mr-1" />
              Neu
            </Button>
          </div>

          {/* Community erstellen */}
          {showCreateForm && (
            <Card className="p-4 mb-3 border-2 border-emerald-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Neue Community</h3>
                <button onClick={() => setShowCreateForm(false)}>
                  <X className="size-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Name *"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Beschreibung (optional)"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button className="w-full" onClick={handleCreateCommunity} disabled={saving || !newName.trim()}>
                {saving ? 'Erstellen...' : 'Community erstellen'}
              </Button>
            </Card>
          )}

          {loading ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : (
            <div className="space-y-3">
              {communities.map((community) => (
                <Card key={community.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Users className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{community.name}</h3>
                      {community.description && (
                        <p className="text-xs text-gray-500 mb-1">{community.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="size-3" />
                        <span>{community.member_count} Mitglieder</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={community.is_member ? 'default' : 'outline'}
                      onClick={() => toggleCommunity(community)}
                    >
                      {community.is_member ? 'Verlassen' : 'Beitreten'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Nutzer */}
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
