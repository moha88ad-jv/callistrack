import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Wir erzwingen hier für die Supabase-Verbindung im Development-Modus das Übergehen der Zertifikatsprüfung
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Kurzer Verbindungscheck beim Instanziieren
pool.on('connect', () => {
  // Verbindung erfolgreich aufgebaut
});

pool.on('error', (err) => {
  console.error('Unerwarteter Fehler am DB pool:', err);
});

export default pool;