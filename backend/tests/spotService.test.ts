/**
 * Unit-Tests: spotService – Duplikaterkennung
 * US-15 – Duplicate-Spots erkennen (Medium)
 * US-01 – Spots anzeigen / filtern
 * Methode: Grenzwertanalyse (20 m Radius)
 */
import { haversineDistance } from '../src/services/spotService';

describe('haversineDistance', () => {
  test('Abstand eines Punktes zu sich selbst ist 0', () => {
    expect(haversineDistance(50.030, 8.215, 50.030, 8.215)).toBe(0);
  });

  test('Mainz Volkspark → Rheinufer (ca. 2 km) liegt über 20 m', () => {
    const d = haversineDistance(50.030, 8.215, 50.045, 8.245);
    expect(d).toBeGreaterThan(20);
  });

  test('Zwei Punkte mit ~15 m Abstand liegen unter 20 m (kein Duplikat-Block)', () => {
    // 0.00015° Lat ≈ 16.7 m
    const d = haversineDistance(50.030, 8.215, 50.0301353, 8.215);
    expect(d).toBeLessThan(20);
  });

  test('Grenzwert: Punkte exakt 20 m auseinander – Ergebnis ≈ 20 m', () => {
    // 0.00018° Lat ≈ 20 m
    const d = haversineDistance(50.000, 8.000, 50.00018, 8.000);
    expect(d).toBeCloseTo(20, 0); // within ±0.5 m
  });

  test('Nordpol-Äquator Abstand entspricht ca. 10,000 km', () => {
    const d = haversineDistance(90, 0, 0, 0);
    expect(d).toBeCloseTo(10_007_543, -3); // within ~1 km
  });

  test('Negative Koordinaten werden korrekt verarbeitet', () => {
    const d = haversineDistance(-33.8688, 151.2093, -33.8695, 151.2100);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(200);
  });
});
