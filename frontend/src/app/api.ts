/**
 * Centralised API client for CallisTrack.
 * All calls go through here so the base URL is configured in one place.
 */

const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('ct_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Prüfe ob die Response einen Body hat
  const contentType = res.headers.get('content-type');
  let data: any;
  
  if (contentType?.includes('application/json')) {
    data = await res.json();
  } else {
    data = null;
  }

  if (!res.ok) {
    const errorMessage = data?.error ?? data?.message ?? 'Serverfehler';
    throw new Error(errorMessage);
  }
  
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (body: { username: string; email: string; password: string }) =>
      request<{ message: string; user: object }>('POST', '/auth/register', body),

    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: AuthUser }>('POST', '/auth/login', body),

    deleteAccount: () => request<{ message: string }>('DELETE', '/auth/account'),
  },

  // ── Spots ──────────────────────────────────────────────────────────────────
  spots: {
    list: (equipment?: string[]) => {
      const qs = equipment?.length ? `?equipment=${equipment.join(',')}` : '';
      return request<ApiSpot[]>('GET', `/spots${qs}`);
    },
    get: (id: string) => request<ApiSpot>('GET', `/spots/${id}`),
    create: (body: CreateSpotBody) => request<ApiSpot>('POST', '/spots', body),
    update: (id: string, body: { name?: string; description?: string; address?: string; equipment?: string[] }) => request<ApiSpot>('PUT', '/spots/' + id, body),
    delete: (id: string) => request<{ message: string }>('DELETE', '/spots/' + id),
    moderate: (id: string, action: 'validate' | 'reject') =>
      request<ApiSpot>('PATCH', `/spots/${id}/moderate`, { action }),
  },

  // ── Workouts ───────────────────────────────────────────────────────────────
  workouts: {
    myWorkouts: () => request<ApiWorkout[]>('GET', '/workouts/my'),
    create: (body: CreateWorkoutBody) =>
      request<{ workout: ApiWorkout; points: number; level: number; levelUp: boolean }>('POST', '/workouts', body),
  },

  // ── Ratings ───────────────────────────────────────────────────────────────
  ratings: {
    create: (body: { spotId: string; stars: number; comment?: string }) =>
      request<{ rating: object; newAverage: number; points: number; level: number; levelUp: boolean }>('POST', '/ratings', body),
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    me: () => request<ApiUser>('GET', '/users/me'),
    followingList: () => request<string[]>('GET', '/users/me/following'),
    search: (q: string) => request<ApiRankingEntry[]>('GET', `/users/search?q=${encodeURIComponent(q)}`),
    get: (id: string) => request<object>('GET', `/users/${id}`),
    update: (body: { bio?: string; isPublic?: boolean }) => request<object>('PATCH', '/users/me', body),
  },

  // ── Wiki
  wiki: {
    list: (params?: { search?: string; difficulty?: string; muscle_group?: string }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.append('search', params.search);
      if (params?.difficulty) qs.append('difficulty', params.difficulty);
      if (params?.muscle_group) qs.append('muscle_group', params.muscle_group);
      const q = qs.toString() ? `?${qs.toString()}` : '';
      return request<WikiExercise[]>('GET', `/wiki${q}`);
    },
    get: (id: string) => request<WikiExercise>('GET', `/wiki/${id}`),
  },
  // ── Plans
  plans: {
    list: () => request<TrainingPlan[]>('GET', '/plans'),
    create: (body: { name: string; description?: string; exercises: { name: string; sets: number; reps: number; notes?: string }[] }) =>
      request<TrainingPlan>('POST', '/plans', body),
    delete: (id: string) => request<{ message: string }>('DELETE', `/plans/${id}`),
  },
  // ── Communities
  communities: {
    list: () => request<Community[]>('GET', '/communities'),
    search: (q: string) => request<Community[]>('GET', `/communities/search?q=${encodeURIComponent(q)}`),
    create: (body: { name: string; description?: string }) => request<Community>('POST', '/communities', body),
    join: (id: string) => request<{ message: string }>('POST', `/communities/${id}/join`),
    leave: (id: string) => request<{ message: string }>('DELETE', `/communities/${id}/join`),
  },
  // ── Ranking ───────────────────────────────────────────────────────────────
  ranking: {
    list: () => request<ApiRankingEntry[]>('GET', '/ranking'),
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  level: number;
  points: number;
  isPublic: boolean;
  isAdmin: boolean;
}

export interface ApiSpot {
  id: string;
  name: string;
  description?: string;
  address?: string;
  lat: number;
  lng: number;
  equipment: string[];
  rating: number;
  status: 'validated' | 'unvalidated' | 'user-created' | 'top-rated' | 'archived';
  created_by?: string;
  ratings?: ApiRating[];
}

export interface ApiRating {
  id: string;
  stars: number;
  comment?: string;
  username: string;
  created_at: string;
}

export interface ApiWorkout {
  id: string;
  spot_id?: string;
  title?: string;
  duration_sec?: number;
  notes?: string;
  exercises: { id: string; name: string; reps: number; sets: number }[];
  created_at: string;
}

export interface ApiUser {
  id: string;
  username: string;
  bio?: string;
  level: number;
  points: number;
  is_public: boolean;
  is_admin: boolean;
  stats: { workouts_completed: number; spots_rated: number; spots_created: number };
  activities: { id: string; type: string; description: string; created_at: string }[];
}

export interface WikiExercise {
  id: string;
  name: string;
  description: string;
  difficulty: 'Anfänger' | 'Mittel' | 'Fortgeschritten';
  muscle_group: string;
  created_at: string;
}

export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
  order_index: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  exercises: PlanExercise[];
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  member_count: number;
  is_member: boolean;
  created_at: string;
}

export interface ApiRankingEntry {
  id: string;
  username: string;
  level: number;
  points: number;
}

export interface CreateSpotBody {
  name: string;
  description?: string;
  address?: string;
  lat: number;
  lng: number;
  equipment: string[];
}

export interface CreateWorkoutBody {
  spotId?: string;
  title?: string;
  durationSec?: number;
  notes?: string;
  exercises: { name: string; reps: number; sets: number }[];
}
