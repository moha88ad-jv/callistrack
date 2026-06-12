export interface Spot {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  equipment: string[];
  rating: number;
  ratings: Rating[];
  status: 'validated' | 'unvalidated' | 'user-created' | 'top-rated' | 'archived';
  createdBy?: string;
}

export interface Rating {
  id: string;
  spotId: string;
  username: string;
  stars: number;
  comment?: string;
  date: string;
}

export interface Workout {
  id: string;
  spotId: string;
  exercise: string;
  reps: number;
  sets: number;
  date: string;
}

export interface User {
  id: string;
  username: string;
  bio?: string;
  level: number;
  points: number;
  isPublic: boolean;
  stats: {
    workoutsCompleted: number;
    spotsRated: number;
    spotsCreated: number;
  };
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'workout' | 'rating' | 'spot';
  description: string;
  date: string;
}
