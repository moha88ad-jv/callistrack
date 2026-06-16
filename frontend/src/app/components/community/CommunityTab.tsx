import { useEffect, useState } from 'react';
import { Trophy, Users, UserPlus, UserCheck, Award, Plus, X, Search, Heart, ChevronLeft, Send } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { api, ApiRankingEntry, Community, CommunityPost } from '../../api';

export function CommunityTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<ApiRankingEntry[]>([]);
  const [communityResults, setCommunityResults] = useState<Community[]>([]);
  const [searching, setSearching] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [topUsers, setTopUsers] = useState<ApiRankingEntry[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    Promise.all([
      api.communities.list(),
      api.users.followingList(),
      api.ranking.list().catch(() => []),
    ]).then(([communitiesData, followingIds, usersData]) => {
      setCommunities(communitiesData);
      setFollowing(new Set(followingIds));
      setTopUsers((usersData as any[]).slice(0, 6));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setUserResults([]); setCommunityResults([]); return; }
    setSearching(true);
    try {
      const [usersData, communitiesData] = await Promise.all([
        api.users.search(q),
        api.communities.search(q),
      ]);
      setUserResults(usersData);
      setCommunityResults(communitiesData);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const openCommunity = async (community: Community) => {
    setSelectedCommunity(community);
    setLoadingPosts(true);
    try {
      const postsData = await api.posts.list(community.id);
      setPosts(postsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !selectedCommunity) return;
    try {
      const created = await api.posts.create(selectedCommunity.id, newPost);
      setPosts(prev => [{ ...created, likes: 0, is_liked: false }, ...prev]);
      setNewPost('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLikePost = async (post: CommunityPost) => {
    try {
      await api.posts.like(post.id);
      setPosts(prev => prev.map(p =>
        p.id === post.id
          ? { ...p, is_liked: !p.is_liked, likes: p.is_liked ? p.likes - 1 : p.likes + 1 }
          : p
      ));
    } catch (err) { console.error(err); }
  };

  const toggleFollow = async (userId: string) => {
    try {
      if (following.has(userId)) {
        await fetch(`/api/users/${userId}/follow`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('ct_token')}` } });
        setFollowing(prev => { const s = new Set(prev); s.delete(userId); return s; });
      } else {
        await fetch(`/api/users/${userId}/follow`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ct_token')}` } });
        setFollowing(prev => new Set(prev).add(userId));
      }
    } catch (err) { console.error(err); }
  };

  const toggleCommunity = async (community: Community) => {
    try {
      if (community.is_member) {
        await api.communities.leave(community.id);
      } else {
        await api.communities.join(community.id);
      }
      const updated = { ...community, is_member: !community.is_member, member_count: community.is_member ? community.member_count - 1 : community.member_count + 1 };
      setCommunities(prev => prev.map(c => c.id === community.id ? updated : c));
      setCommunityResults(prev => prev.map(c => c.id === community.id ? updated : c));
      if (selectedCommunity?.id === community.id) setSelectedCommunity(updated);
    } catch (err) { console.error(err); }
  };

  const handleCreateCommunity = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await api.communities.create({ name: newName, description: newDesc || undefined });
      setCommunities(prev => [{ ...created, member_count: 1, is_member: true }, ...prev]);
      setNewName(''); setNewDesc(''); setShowCreateForm(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const challenges = [
    { id: '1', title: '100 Pull-ups Challenge', description: 'Schaffe 100 Pull-ups in einer Woche', participants: 234, daysLeft: 4, progress: 65 },
    { id: '2', title: '30 Tage Muscle-Up', description: 'Lerne den Muscle-Up in 30 Tagen', participants: 156, daysLeft: 12, progress: 40 },
  ];

  const joinedCommunities = communities.filter(c => c.is_member);
  const notJoinedCommunities = communities.filter(c => !c.is_member);
  const isSearching = searchQuery.trim().length >= 2;

  if (selectedCommunity) {
    return (
      <div className="size-full overflow-y-auto bg-gray-50">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => setSelectedCommunity(null)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold">{selectedCommunity.name}</h1>
            <p className="text-xs text-gray-500">{selectedCommunity.member_count} Mitglieder</p>
          </div>
          <Button size="sm" variant={selectedCommunity.is_member ? 'outline' : 'default'} onClick={() => toggleCommunity(selectedCommunity)}>
            {selectedCommunity.is_member ? 'Verlassen' : 'Beitreten'}
          </Button>
        </div>
        <div className="p-4 space-y-4">
          {selectedCommunity.is_member && (
            <Card className="p-4">
              <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Was möchtest du teilen?" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              <Button size="sm" className="mt-2 w-full" onClick={handleCreatePost} disabled={!newPost.trim()}>
                <Send className="size-4 mr-1" />Posten
              </Button>
            </Card>
          )}
          {loadingPosts ? (
            <p className="text-center text-gray-500 py-4">Lädt...</p>
          ) : posts.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <p>Noch keine Posts.</p>
              {selectedCommunity.is_member && <p className="text-sm mt-1">Sei der Erste!</p>}
            </Card>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-emerald-600 text-white text-xs">{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{post.username}</div>
                    <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('de-DE')}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{post.content}</p>
                <button onClick={() => handleLikePost(post)} className={`flex items-center gap-1 text-sm ${post.is_liked ? 'text-red-500' : 'text-gray-400'}`}>
                  <Heart className={`size-4 ${post.is_liked ? 'fill-red-500' : ''}`} />
                  <span>{post.likes}</span>
                </button>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold mb-3">COMMUNITY</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input type="text" placeholder="Nutzer oder Community suchen..." value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          {searchQuery && <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="size-4 text-gray-400" /></button>}
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* Suchergebnisse */}
        {isSearching && (
          <section>
            {searching ? (
              <p className="text-center text-gray-500 py-4">Suche...</p>
            ) : userResults.length === 0 && communityResults.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">Keine Ergebnisse</Card>
            ) : (
              <div className="space-y-4">
                {userResults.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-2">NUTZER</h3>
                    <div className="space-y-2">
                      {userResults.map(user => (
                        <Card key={user.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10"><AvatarFallback className="bg-emerald-600 text-white text-sm">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                            <div className="flex-1">
                              <div className="font-semibold">{user.username}</div>
                              <div className="text-xs text-gray-500">Level {user.level} • {user.points} Punkte</div>
                            </div>
                            <Button size="sm" variant={following.has(user.id) ? 'default' : 'outline'} onClick={() => toggleFollow(user.id)}>
                              {following.has(user.id) ? <><UserCheck className="size-4 mr-1" />Gefolgt</> : <><UserPlus className="size-4 mr-1" />Folgen</>}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {communityResults.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-2">COMMUNITIES</h3>
                    <div className="space-y-2">
                      {communityResults.map(community => (
                        <Card key={community.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-600 flex items-center justify-center"><Users className="size-5 text-white" /></div>
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
              </div>
            )}
          </section>
        )}

        {/* Challenges */}
        {!isSearching && (
          <section>
            <h2 className="text-lg font-bold mb-4">CHALLENGES</h2>
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0"><Trophy className="size-6 text-white" /></div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Fortschritt</span><span>{challenge.progress}%</span></div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-600" style={{ width: `${challenge.progress}%` }} /></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600"><Users className="size-4" /><span>{challenge.participants} Teilnehmer</span></div>
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
        {!isSearching && joinedCommunities.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">MEINE COMMUNITIES</h2>
            <div className="space-y-3">
              {joinedCommunities.map(community => (
                <Card key={community.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openCommunity(community)}>
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0"><Users className="size-6 text-white" /></div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{community.name}</h3>
                      {community.description && <p className="text-xs text-gray-500">{community.description}</p>}
                      <div className="text-xs text-gray-500">{community.member_count} Mitglieder</div>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">Öffnen →</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Communities entdecken */}
        {!isSearching && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">COMMUNITIES ENTDECKEN</h2>
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="size-4 mr-1" />Neu
              </Button>
            </div>

            {showCreateForm && (
              <Card className="p-4 mb-3 border-2 border-emerald-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Neue Community</h3>
                  <button onClick={() => setShowCreateForm(false)}><X className="size-4 text-gray-400" /></button>
                </div>
                <div className="space-y-2 mb-3">
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name *" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Beschreibung (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <Button className="w-full" onClick={handleCreateCommunity} disabled={saving || !newName.trim()}>
                  {saving ? 'Erstellen...' : 'Community erstellen'}
                </Button>
              </Card>
            )}

            {loading ? (
              <p className="text-center text-gray-500 py-4">Lädt...</p>
            ) : notJoinedCommunities.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">Du bist bereits in allen Communities! Erstelle eine neue.</Card>
            ) : (
              <div className="space-y-3">
                {notJoinedCommunities.map(community => (
                  <Card key={community.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><Users className="size-6 text-white" /></div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{community.name}</h3>
                        {community.description && <p className="text-xs text-gray-500">{community.description}</p>}
                        <div className="text-xs text-gray-500">{community.member_count} Mitglieder</div>
                      </div>
                      <Button size="sm" onClick={() => toggleCommunity(community)}>Beitreten</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Nutzer aus Ranking */}
        {!isSearching && (
          <section>
            <h2 className="text-lg font-bold mb-4">NUTZER</h2>
            {loading ? (
              <p className="text-center text-gray-500 py-4">Lädt...</p>
            ) : topUsers.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">Keine Nutzer gefunden</Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {topUsers.map(user => (
                  <Card key={user.id} className="p-4 text-center">
                    <Avatar className="size-16 mx-auto mb-3">
                      <AvatarFallback className="bg-emerald-600 text-white text-lg">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{user.username}</h3>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-3">
                      <Award className="size-3" /><span>Level {user.level}</span><span>•</span><span>{user.points} Punkte</span>
                    </div>
                    <Button size="sm" variant={following.has(user.id) ? 'default' : 'outline'} className="w-full" onClick={() => toggleFollow(user.id)}>
                      {following.has(user.id) ? <><UserCheck className="size-4 mr-1" />Gefolgt</> : <><UserPlus className="size-4 mr-1" />Folgen</>}
                    </Button>
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
