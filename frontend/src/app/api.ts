/**
 * Centralised API client for CallisTrack.
 * All calls go through here so the base URL is configured in one place.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

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
    get: (id: string) => request<object>('GET', `/users/${id}`),
    update: (body: { bio?: string; isPublic?: boolean }) => request<object>('PATCH', '/users/me', body),
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
