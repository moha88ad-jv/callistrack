# CallisTrack - Calisthenics Web-App

Software Engineering PL 5 - Hochschule Mainz SS 2026
Team 02: Daniel Abdullah, Mohammed Elmodalal, Mohammad Alhasan

---

## SCHNELLSTART - App in 3 Schritten starten

### Schritt 1: Repository klonen
git clone https://github.com/moelmoda/callistrack.git
cd callistrack

### Schritt 2: Umgebungsvariablen einrichten
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

### Schritt 3: App starten mit Docker
docker compose up --build

Die App ist danach erreichbar unter:
- Frontend: http://localhost
- Backend API: http://localhost:3001/api/health

FERTIG! Keine weitere Konfiguration noetig.

---

## Login-Daten zum Testen

| E-Mail | Passwort | Rolle |
|--------|----------|-------|
| modalalm9@gmail.com | Test1234! | Admin (Vollzugriff) |
| test@example.com | Test1234! | Normaler Nutzer |
| delete@example.com | Test1234! | Nutzer (DSGVO-Test) |

Tipp: Mit dem Admin-Account kann man im Profil-Tab das Admin-Panel oeffnen.

---

## Lokale Entwicklung ohne Docker

Voraussetzungen: Node.js >= 20, npm

Terminal 1 - Backend starten:
cd backend
npm install
npm run dev
-> laeuft auf http://localhost:3001

Terminal 2 - Frontend starten:
cd frontend
npm install
npm run dev
-> laeuft auf http://localhost:5173

---

## Unit Tests ausfuehren

cd backend
npm test
npm run test:coverage

Ergebnisse:
- 72 Tests, alle gruen
- 100% Statement Coverage
- 100% Function Coverage
- 100% Line Coverage

---

## Tech-Stack

| Schicht | Technologie |
|---------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Leaflet |
| Backend | Node.js 20, Express, TypeScript |
| Datenbank | Supabase (PostgreSQL 16) |
| Tests | Jest |
| Deployment | Docker, Docker Compose, Nginx |

---

## Datenbank

Die Datenbank laeuft auf Supabase (PostgreSQL 16) in der Cloud.
Keine lokale Datenbankinstallation noetig.

Verbindungsdaten (bereits in .env.example enthalten):
- Host: aws-0-eu-west-1.pooler.supabase.com
- Port: 5432
- Datenbank: postgres
- User: postgres.gwkpryeeilfdhfpqbwgb
- Passwort: BoMrHs2004@#!

Supabase Dashboard: https://supabase.com/dashboard/project/gwkpryeeilfdhfpqbwgb

Falls die Datenbank neu eingerichtet werden muss:
1. database/001_init.sql im Supabase SQL-Editor ausfuehren
2. database/002_seed.sql im Supabase SQL-Editor ausfuehren

---

## App-Funktionen

### Karte und Spots
- Interaktive Karte mit Calisthenics-Spots in Mainz (OpenStreetMap + Leaflet)
- Spots nach Equipment filtern (Klimmzugstange, Barren, Ringe, etc.)
- Neuen Spot hinzufuegen mit Adresse-Autocomplete
- Spot bewerten (1-5 Sterne) und kommentieren
- Eigene Spots bearbeiten und loeschen
- Admin kann Spots freigeben oder ablehnen

### Workout und Fortschritt
- Workout loggen mit Uebungen aus dem Wiki
- Eigene Trainingplaene erstellen
- Fortschritt und Statistiken einsehen

### Uebungs-Wiki
- 10 Uebungen mit Beschreibung, Schwierigkeit und Muskelgruppe
- Suche und Filter nach Schwierigkeit
- Uebungen direkt beim Workout oder Trainingsplan auswaehlen

### Gamification
- Punkte sammeln: +10 pro Workout, +5 pro Bewertung, +20 pro neuen Spot
- Level-System mit Fortschrittsanzeige im Profil
- Ranking der besten Nutzer

### Community
- Communities erstellen, beitreten und verlassen
- Posts in Communities erstellen und liken
- Anderen Nutzern folgen
- Nutzer und Communities suchen

### Events und News
- Events ansehen und beitreten
- Admin kann Events und News erstellen

### Admin-Panel
- Spots moderieren (freigeben oder ablehnen)
- Events erstellen und loeschen
- News erstellen und loeschen
- Zugriff ueber Profil-Tab -> Admin-Panel oeffnen

---

## API-Endpunkte Uebersicht

Alle geschuetzten Endpunkte benoetigen: Authorization: Bearer <JWT>

Authentifizierung:
POST   /api/auth/register        Registrierung
POST   /api/auth/login           Login, gibt JWT zurueck
DELETE /api/auth/account         Account loeschen (DSGVO Art. 17)

Spots:
GET    /api/spots                Alle Spots (optional: ?equipment=Klimmzugstange)
GET    /api/spots/:id            Spot mit Bewertungen
POST   /api/spots                Spot erstellen (Auth)
PUT    /api/spots/:id            Spot bearbeiten (Ersteller oder Admin)
DELETE /api/spots/:id            Spot loeschen (Ersteller oder Admin)
PATCH  /api/spots/:id/moderate   Freigeben oder ablehnen (Admin)

Workouts:
GET    /api/workouts/my          Eigene Workouts
POST   /api/workouts             Workout speichern (Auth)

Bewertungen:
POST   /api/ratings              Spot bewerten (Auth)

Nutzer:
GET    /api/users/me             Eigenes Profil mit Stats
PATCH  /api/users/me             Profil bearbeiten
GET    /api/users/me/following   Liste gefolgter Nutzer
GET    /api/users/search?q=name  Nutzer suchen
POST   /api/users/:id/follow     Nutzer folgen (Auth)
DELETE /api/users/:id/follow     Nutzer entfolgen (Auth)

Communities:
GET    /api/communities          Alle Communities mit Mitgliederzahl
GET    /api/communities/search   Communities suchen
POST   /api/communities          Community erstellen (Auth)
POST   /api/communities/:id/join Community beitreten (Auth)
DELETE /api/communities/:id/join Community verlassen (Auth)

Posts:
GET    /api/posts/:communityId   Posts einer Community
POST   /api/posts/:communityId   Post erstellen (Mitglied)
POST   /api/posts/:postId/like   Post liken oder unliken (Auth)

Events:
GET    /api/events               Alle zukuenftigen Events
POST   /api/events               Event erstellen (Admin)
POST   /api/events/:id/join      Event beitreten (Auth)
DELETE /api/events/:id/join      Event verlassen (Auth)
DELETE /api/events/:id           Event loeschen (Admin)

News:
GET    /api/news                 Alle News
POST   /api/news                 News erstellen (Admin)
DELETE /api/news/:id             News loeschen (Admin)

Uebungs-Wiki:
GET    /api/wiki                 Alle Uebungen
GET    /api/wiki?search=name     Uebungen suchen
GET    /api/wiki?difficulty=X    Nach Schwierigkeit filtern

Trainingplaene:
GET    /api/plans                Eigene Plaene
POST   /api/plans                Plan erstellen (Auth)
DELETE /api/plans/:id            Plan loeschen (Auth)

Ranking:
GET    /api/ranking              Top-50 Nutzer nach Punkten

Health:
GET    /api/health               Server- und DB-Status

---

## Projektstruktur

callistrack/
├── backend/
│   ├── src/
│   │   ├── routes/          API Routen
│   │   ├── services/        Business Logik
│   │   ├── middleware/      JWT Authentifizierung
│   │   └── db/              Datenbankverbindung
│   ├── tests/               Unit Tests
│   ├── .env.example         Vorlage fuer Umgebungsvariablen
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── components/      React Komponenten
│   │   ├── context/         Auth Context
│   │   └── api.ts           API Client
│   ├── .env.example         Vorlage fuer Umgebungsvariablen
│   └── Dockerfile
├── database/
│   ├── 001_init.sql         Datenbankschema
│   └── 002_seed.sql         Testdaten
├── docker-compose.yml       Docker Konfiguration
└── README.md

---

## Sicherheit

- JWT Authentifizierung (7 Tage Gueltigkeit)
- Passwort-Hashing mit bcrypt (10 Salt Rounds)
- Input-Validierung mit express-validator
- CORS Konfiguration
- DSGVO-konformes Account-Loeschen
- Admin-Rollensystem

---

## GitHub Repository

https://github.com/moelmoda/callistrack
Branch: main
