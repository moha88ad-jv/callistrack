import { Trophy, Calendar, Users, UserPlus, MapPin, Award } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function CommunityTab() {
  const challenges = [
    {
      id: '1',
      title: '100 Pull-ups Challenge',
      description: 'Schaffe 100 Pull-ups in einer Woche',
      participants: 234,
      daysLeft: 4,
      progress: 65,
    },
    {
      id: '2',
      title: '30 Tage Muscle-Up',
      description: 'Lerne den Muscle-Up in 30 Tagen',
      participants: 156,
      daysLeft: 12,
      progress: 40,
    },
  ];

  const events = [
    {
      id: '1',
      title: 'WERDE TEIL VON ADIDAS RUNNERS FRANKFURT',
      image: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
      type: 'CHALLENGES',
      subtype: 'CHALLENGE',
    },
    {
      id: '2',
      title: 'Street Workout Meetup Mainz',
      location: 'Mainz Volkspark',
      date: '15. Mai 2026, 18:00',
      participants: 24,
    },
  ];

  const communities = [
    {
      id: '1',
      name: 'Mainz Calisthenics Crew',
      members: 156,
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: '2',
      name: 'Rhein-Main Street Workout',
      members: 243,
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: '3',
      name: 'Beginner Gains Squad',
      members: 89,
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  const suggestedUsers = [
    { id: '1', name: 'MaxPower92', level: 8, workouts: 234 },
    { id: '2', name: 'StreetKing', level: 12, workouts: 567 },
    { id: '3', name: 'FitJulia', level: 6, workouts: 189 },
    { id: '4', name: 'PullUpPro', level: 10, workouts: 432 },
  ];

  return (
    <div className="size-full overflow-y-auto bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <h1 className="text-2xl font-bold">COMMUNITY</h1>
      </div>

      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center"
        >
          <div className="text-white text-center px-6">
            <h2 className="text-2xl font-bold mb-2">WERDE TEIL VON ADIDAS</h2>
            <h2 className="text-2xl font-bold">RUNNERS FRANKFURT</h2>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">CHALLENGES</h2>
            <button className="text-sm font-semibold">ENTDECKEN</button>
          </div>

          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4 hover:shadow-md transition-shadow">
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
                        <div
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="size-4" />
                        <span>{challenge.participants} Teilnehmer</span>
                      </div>
                      <div className="text-emerald-600 font-medium">
                        {challenge.daysLeft} Tage übrig
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">EVENTS</h2>
            <button className="text-sm font-semibold">ALLE ANSEHEN</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {events.slice(0, 2).map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.image ? (
                  <div className="h-32" style={{ background: event.image }}>
                    <div className="h-full flex flex-col justify-end p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="text-white text-xs font-semibold mb-1">{event.type}</div>
                      <div className="text-white text-xs">{event.subtype}</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600" />
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{event.title}</h3>
                  {event.location && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Calendar className="size-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="size-3" />
                        <span>{event.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">COMMUNITIES</h2>
            <button className="text-sm font-semibold">DURCHSUCHEN</button>
          </div>

          <div className="space-y-3">
            {communities.map((community) => (
              <Card key={community.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div
                    className="size-16 rounded-lg flex-shrink-0"
                    style={{ background: community.image }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{community.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="size-4" />
                      <span>{community.members} Mitglieder</span>
                    </div>
                  </div>
                  <Button size="sm">Beitreten</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">VORGESCHLAGENE NUTZER</h2>
            <button className="text-sm font-semibold">MEHR</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {suggestedUsers.map((user) => (
              <Card key={user.id} className="p-4 text-center hover:shadow-md transition-shadow">
                <Avatar className="size-16 mx-auto mb-3">
                  <AvatarFallback className="bg-emerald-600 text-white text-lg">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-1">{user.name}</h3>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-3">
                  <Award className="size-3" />
                  <span>Level {user.level}</span>
                  <span>•</span>
                  <span>{user.workouts} Workouts</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <UserPlus className="size-4 mr-1" />
                  Folgen
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
