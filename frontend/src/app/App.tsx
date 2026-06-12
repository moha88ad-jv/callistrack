import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import { Header } from './components/Header';
import { ActivityTab } from './components/activity/ActivityTab';
import { FeedTab } from './components/feed/FeedTab';
import { CommunityTab } from './components/community/CommunityTab';
import { ProgressTab } from './components/progress/ProgressTab';
import { SpotDetailView } from './components/activity/SpotDetailView';
import { UserProfile } from './components/profile/UserProfile';
import { BottomNav } from './components/BottomNav';
import { FilterDrawer } from './components/activity/FilterDrawer';
import { AddSpotModal } from './components/activity/AddSpotModal';
import { AdminPanel } from './components/profile/AdminPanel';
import { api, ApiSpot, ApiUser } from './api';
import type { Spot, User, Rating, Workout } from './types';

type View = 'feed' | 'community' | 'activity' | 'progress' | 'profile' | 'spot-detail' | 'admin';

/** Convert API spot to local Spot type */
function toSpot(s: ApiSpot): Spot {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    address: s.address ?? '',
    lat: s.lat,
    lng: s.lng,
    equipment: s.equipment,
    rating: s.rating,
    status: s.status,
    createdBy: s.created_by,
    ratings: (s.ratings ?? []).map((r) => ({
      id: r.id,
      spotId: s.id,
      username: r.username,
      stars: r.stars,
      comment: r.comment,
      date: r.created_at,
    })),
  };
}

/** Convert API user to local User type */
function toUser(u: ApiUser): User {
  return {
    id: u.id,
    username: u.username,
    bio: u.bio,
    level: u.level,
    points: u.points,
    isPublic: u.is_public,
    stats: {
      workoutsCompleted: u.stats.workouts_completed,
      spotsRated: u.stats.spots_rated,
      spotsCreated: u.stats.spots_created,
    },
    activities: u.activities.map((a) => ({
      id: a.id,
      type: a.type as 'workout' | 'rating' | 'spot',
      description: a.description,
      date: a.created_at,
    })),
  };
}

export default function App() {
  const { user: authUser, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('activity');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddSpotOpen, setIsAddSpotOpen] = useState(false);
  const [filters, setFilters] = useState({ equipment: [] as string[], minRating: 0, showUnvalidated: false });

  // Load spots from API
  useEffect(() => {
    api.spots.list().then((ss) => setSpots(ss.map(toSpot))).catch(() => {});
  }, []);

  // Load user profile when logged in
  useEffect(() => {
    if (authUser) {
      api.users.me().then((u) => setUser(toUser(u))).catch(() => {});
    }
  }, [authUser]);

  if (isLoading) {
    return <div className="size-full flex items-center justify-center text-gray-400">Laden…</div>;
  }

  if (!authUser) return <AuthPage />;

  const isAdmin = authUser.isAdmin;

  const allEquipment = Array.from(new Set(spots.flatMap((s) => s.equipment))).map((name) => ({
    name,
    count: spots.filter((s) => s.equipment.includes(name)).length,
  }));

  const filteredSpots = spots.filter((spot) => {
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.equipment.some((eq) => eq.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEquipment = filters.equipment.length === 0 || filters.equipment.some((eq) => spot.equipment.includes(eq));
    const matchesRating = filters.minRating === 0 || spot.rating >= filters.minRating;
    const matchesValidation = isAdmin || filters.showUnvalidated || spot.status !== 'unvalidated';
    return matchesSearch && matchesEquipment && matchesRating && matchesValidation;
  });

  const activeFilterCount = filters.equipment.length + (filters.minRating > 0 ? 1 : 0) + (filters.showUnvalidated ? 1 : 0);

  const handleSpotClick = (spot: Spot) => {
    // Reload spot with ratings
    api.spots.get(spot.id).then((s) => {
      setSelectedSpot(toSpot(s));
      setCurrentView('spot-detail');
    }).catch(() => {
      setSelectedSpot(spot);
      setCurrentView('spot-detail');
    });
  };

  const handleAddSpotSubmit = async (newSpotData: { name: string; description: string; address: string; equipment: string[]; lat: number; lng: number }) => {
    try {
      const created = await api.spots.create(newSpotData);
      setSpots((prev) => [...prev, toSpot(created)]);
      if (user) {
        setUser({ ...user, stats: { ...user.stats, spotsCreated: user.stats.spotsCreated + 1 } });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRatingSubmit = async (stars: number, comment: string) => {
    if (!selectedSpot) return;
    try {
      const res = await api.ratings.create({ spotId: selectedSpot.id, stars, comment });
      // Refresh spot
      const refreshed = await api.spots.get(selectedSpot.id);
      const updatedSpot = toSpot(refreshed);
      setSpots((prev) => prev.map((s) => (s.id === selectedSpot.id ? updatedSpot : s)));
      setSelectedSpot(updatedSpot);
      if (user) {
        setUser({ ...user, points: res.points, level: res.level, stats: { ...user.stats, spotsRated: user.stats.spotsRated + 1 } });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleWorkoutSubmit = async (workout: Workout) => {
    try {
      const res = await api.workouts.create({
        spotId: selectedSpot?.id,
        title: workout.exercise,
        exercises: [{ name: workout.exercise, reps: workout.reps, sets: workout.sets }],
      });
      if (user) {
        setUser({ ...user, points: res.points, level: res.level, stats: { ...user.stats, workoutsCompleted: user.stats.workoutsCompleted + 1 } });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTogglePublic = async (isPublic: boolean) => {
    await api.users.update({ isPublic });
    if (user) setUser({ ...user, isPublic });
  };

  const handleTabChange = (tab: 'feed' | 'community' | 'activity' | 'progress' | 'profile') => setCurrentView(tab);
  const handleRemoveFilter = (f: string) => setFilters((prev) => ({ ...prev, equipment: prev.equipment.filter((eq) => eq !== f) }));

  const displayUser: User = user ?? { id: authUser.id, username: authUser.username, level: authUser.level, points: authUser.points, isPublic: authUser.isPublic, stats: { workoutsCompleted: 0, spotsRated: 0, spotsCreated: 0 }, activities: [] };

  return (
    <div className="size-full flex flex-col bg-white">
      {currentView === 'feed' && (<><FeedTab /><BottomNav activeTab="feed" onTabChange={handleTabChange} /></>)}
      {currentView === 'community' && (<><CommunityTab /><BottomNav activeTab="community" onTabChange={handleTabChange} /></>)}
      {currentView === 'activity' && (
        <>
          <Header onProfileClick={() => setCurrentView('profile')} onSearchChange={setSearchQuery} searchQuery={searchQuery} onFilterClick={() => setIsFilterOpen(true)} activeFilterCount={activeFilterCount} activeFilters={filters.equipment} onRemoveFilter={handleRemoveFilter} onAddSpot={() => setIsAddSpotOpen(true)} />
          <div className="flex-1 overflow-hidden">
            <ActivityTab spots={filteredSpots} onSpotClick={handleSpotClick} highlightedEquipment={filters.equipment} />
          </div>
          <BottomNav activeTab="activity" onTabChange={handleTabChange} />
        </>
      )}
      {currentView === 'progress' && (<><ProgressTab /><BottomNav activeTab="progress" onTabChange={handleTabChange} /></>)}
      {currentView === 'spot-detail' && selectedSpot && (
        <SpotDetailView spot={selectedSpot} onBack={() => setCurrentView('activity')} onRatingSubmit={handleRatingSubmit} onWorkoutSubmit={handleWorkoutSubmit} />
      )}
      {currentView === 'profile' && (
        <>
          <div className="flex-1 overflow-y-auto">
            <UserProfile user={displayUser} onTogglePublic={handleTogglePublic} />
            {isAdmin && (<div className="p-4 border-t"><button onClick={() => setCurrentView('admin')} className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium text-sm">🔧 Admin-Panel öffnen</button></div>)}
          </div>
          <BottomNav activeTab="profile" onTabChange={handleTabChange} />
        </>
      )}
      {currentView === 'admin' && (
        <AdminPanel onBack={() => setCurrentView('profile')} onImport={(config) => { console.log('Import started:', config); }} />
      )}
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onApplyFilters={setFilters} availableEquipment={allEquipment} isAdmin={isAdmin} />
      <AddSpotModal isOpen={isAddSpotOpen} onClose={() => setIsAddSpotOpen(false)} onSubmit={handleAddSpotSubmit} />
    </div>
  );
}
