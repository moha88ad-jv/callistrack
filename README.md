# CallisTrack – Calisthenics Web-App

> **Software Engineering PL 4 · Hochschule Mainz SS 2026**  
> Team: Daniel Abdullah · Mohammed Elmodalal · Mohammad Alhasan

## Tech-Stack

| Schicht | Technologie |
|---------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Leaflet / react-leaflet |
| Backend | Node.js 20, Express, TypeScript |
| Datenbank | **Supabase (PostgreSQL 16)** |
| Tests | Jest, Supertest |
| Deployment | Docker, Docker Compose, Nginx |

---

## ① Datenbank einrichten (Supabase – einmalig)

Öffne den **Supabase SQL-Editor** unter:  
`https://supabase.com/dashboard/project/gwkpryeeilfdhfpqbwgb/sql`

Führe nacheinander aus:
1. Inhalt von `database/001_init.sql` → Schema erstellen
2. Inhalt von `database/002_seed.sql` → Testdaten einfügen

**Oder** mit dem mitgelieferten Node-Script (kein psql nötig):
```bash
cd callistrack
node database/setup.js
```

---

## ② Lokale Entwicklung starten

### Voraussetzungen
- Node.js ≥ 20
- npm

### Backend
```bash
cd backend
npm install
# .env ist bereits konfiguriert mit Supabase-Verbindung
npm run dev
# → http://localhost:3001/api/health
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Das Frontend-Proxy leitet `/api`-Anfragen automatisch an `localhost:3001` weiter.

---

## ③ Deployment mit Docker

```bash
docker compose up --build
# → Frontend: http://localhost
# → API:      http://localhost:3001/api/health
```

---

## Test-Accounts (Seed-Daten)

| E-Mail | Passwort | Rolle |
|--------|----------|-------|
| test@example.com | Test1234! | Nutzer |
| admin@example.com | Test1234! | Admin |
| delete@example.com | Test1234! | Nutzer (DSGVO-Test) |

---

## Unit-Tests

```bash
cd backend
npm test              # alle 38 Tests
npm run test:coverage # mit Coverage-Bericht (≥ 70%)
```

| Test-Datei | User Stories |
|-----------|-------------|
| `tests/authService.test.ts` | US-08 Registrierung/Login |
| `tests/gamificationService.test.ts` | US-10/11/12 Punkte, Level |
| `tests/spotService.test.ts` | US-15 Duplikaterkennung |

---

## API-Endpunkte

| Method | Endpunkt | Beschreibung |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrierung |
| POST | `/api/auth/login` | Login → JWT |
| DELETE | `/api/auth/account` | Account löschen (DSGVO) |
| GET | `/api/spots` | Alle Spots (`?equipment=X,Y`) |
| GET | `/api/spots/:id` | Spot mit Ratings |
| POST | `/api/spots` | Spot anlegen (Auth) |
| PATCH | `/api/spots/:id/moderate` | Freigeben/Ablehnen (Admin) |
| GET | `/api/workouts/my` | Eigene Workouts |
| POST | `/api/workouts` | Workout speichern (Auth) |
| POST | `/api/ratings` | Spot bewerten (Auth) |
| GET | `/api/users/me` | Eigenes Profil |
| PATCH | `/api/users/me` | Profil bearbeiten |
| GET | `/api/users/:id` | Öffentliches Profil |
| GET | `/api/ranking` | Top-50 Nutzer |
| GET | `/api/health` | Health-Check |

Geschützte Endpunkte benötigen: `Authorization: Bearer <JWT>`

---

## Supabase-Verbindung

```
Host:     db.gwkpryeeilfdhfpqbwgb.supabase.co
Port:     5432
Database: postgres
User:     postgres
SSL:      required (automatisch konfiguriert)
```

Die Connection-URL mit URL-encodiertem Passwort steht in `backend/.env`.
