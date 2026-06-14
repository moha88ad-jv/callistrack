import { useEffect, useState } from 'react';
import { Trophy, Users, UserPlus, UserCheck, Award, Plus, X, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { api, ApiRankingEntry, Community } from '../../api';

export function CommunityTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiRankingEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [communitySearchResults, setCommunitySearchResults] = useState<Community[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.communities.list(),
      api.users.followingList(),
    ]).then(([communitiesData, followingIds]) => {
      setCommunities(communitiesData);
      setFollowing(new Set(followingIds));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Suche mit Debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      Promise.all([
        api.users.search(searchQuery),
        api.communities.search(searchQuery),
      ]).then(([usersData, communitiesData]) => {
        setSearchResults(usersData);
        setCommunitySearchResults(communitiesData);
      }).catch(console.error)
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      const created = await api.communities.create({ name: newName, description: newDesc || undefined });
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

  // Nur 3 Communities vorschlagen
  const suggestedCommunities = communities.filter(c => !c.is_member).slice(0, 3);
  const joinedCommunities = communities.filter(c => c.is_member);

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold mb-3">COMMUNITY</h1>
        {/* Suche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nutzer suchen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* Suchergebnisse */}
        {searchQuery.trim().length >= 2 && (
          <section>
            <h2 className="text-lg font-bold mb-3">SUCHERGEBNISSE</h2>
            {searching ? (
              <p className="text-center text-gray-500 py-4">Suche...</p>
            ) : searchResults.length === 0 && communitySearchResults.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">Keine Ergebnisse gefunden</Card>
            ) : (
              <div className="space-y-3">
                {searchResults.map(user => (
                  <Card key={user.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-emerald-600 text-white">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-xs text-gray-500">Level {user.level} • {user.points} Punkte</div>
                      </div>
                      <Button
                        size="sm"
                        variant={following.has(user.id) ? 'default' : 'outline'}
                        onClick={() => toggleFollow(user.id)}
                      >
                        {following.has(user.id)
                          ? <><UserCheck className="size-4 mr-1" />Gefolgt</>
                          : <><UserPlus className="size-4 mr-1" />Folgen</>
                        }
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {communitySearchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-700">COMMUNITIES</h3>
                <div className="space-y-3">
                  {communitySearchResults.map(community => (
                    <Card key={community.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <Users className="size-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{community.name}</div>
                          <div className="text-xs text-gray-500">{community.member_count} Mitglieder</div>
                        </div>
                        <Button size="sm" variant={community.is_member ? 'default' : 'outline'} onClick={() => toggleCommunity(community)}>
                          {community.is_member ? 'Verlassen' : 'Beitreten'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Challenges */}
        {!searchQuery && (
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
        )}

        {/* Meine Communities */}
        {!searchQuery && joinedCommunities.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">MEINE COMMUNITIES</h2>
            <div className="space-y-3">
              {joinedCommunities.map(community => (
                <Card key={community.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Users className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{community.name}</h3>
                      {community.description && <p className="text-xs text-gray-500">{community.description}</p>}
                      <div className="text-xs text-gray-500">{community.member_count} Mitglieder</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleCommunity(community)}>
                      Verlassen
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Vorgeschlagene Communities */}
        {!searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">COMMUNITIES ENTDECKEN</h2>
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="size-4 mr-1" />
                Neu
              </Button>
            </div>

            {showCreateForm && (
              <Card className="p-4 mb-3 border-2 border-emerald-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Neue Community</h3>
                  <button onClick={() => setShowCreateForm(false)}><X className="size-4 text-gray-400" /></button>
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
            ) : suggestedCommunities.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">
                Du bist bereits in allen Communities!
              </Card>
            ) : (
              <div className="space-y-3">
                {suggestedCommunities.map(community => (
                  <Card key={community.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Users className="size-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{community.name}</h3>
                        {community.description && <p className="text-xs text-gray-500">{community.description}</p>}
                        <div className="text-xs text-gray-500">{community.member_count} Mitglieder</div>
                      </div>
                      <Button size="sm" onClick={() => toggleCommunity(community)}>
                        Beitreten
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
