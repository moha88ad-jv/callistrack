/**
 * Unit-Tests: gamificationService
 * US-11 – Punktevergabe (Medium)
 * US-12 – Level-Aufstiege (Medium)
 * US-10 – Spot bewerten / Rating-Durchschnitt (Medium)
 */
import { calcLevel, LEVEL_THRESHOLDS, POINTS, calcAverageRating } from '../src/services/gamificationService';

describe('calcLevel (Gamification)', () => {
  test('Level 1 ab 0 Punkten', () => expect(calcLevel(0)).toBe(1));
  test('Level 1 bis 99 Punkte', () => expect(calcLevel(99)).toBe(1));

  test('Grenzwert Level 2: genau 100 Punkte', () => expect(calcLevel(100)).toBe(2));
  test('Level 2 bei 299 Punkte', () => expect(calcLevel(299)).toBe(2));

  test('Grenzwert Level 3: genau 300 Punkte', () => expect(calcLevel(300)).toBe(3));

  // TC-17: Grenzwerttest – Nutzer kurz unterhalb der Schwelle
  test('TC-17 Grenzwert: 999 Punkte → Level 4', () => expect(calcLevel(999)).toBe(4));
  test('TC-17 Grenzwert: 1000 Punkte → Level 5 (Level-Up)', () => expect(calcLevel(1000)).toBe(5));

  test('Alle Schwellenwerte stimmen mit LEVEL_THRESHOLDS überein', () => {
    LEVEL_THRESHOLDS.forEach((pts, idx) => {
      expect(calcLevel(pts)).toBe(idx + 1);
    });
  });
});

describe('POINTS Konstanten', () => {
  test('Workout gibt 10 Punkte', () => expect(POINTS.WORKOUT).toBe(10));
  test('Rating gibt 5 Punkte', () => expect(POINTS.RATING).toBe(5));
  test('Spot erstellt gibt 20 Punkte', () => expect(POINTS.SPOT_CREATED).toBe(20));
});

describe('calcAverageRating', () => {
  test('Leeres Array → 0', () => {
    expect(calcAverageRating([])).toBe(0);
  });

  test('Ein Rating → derselbe Wert', () => {
    expect(calcAverageRating([4])).toBe(4);
  });

  test('Durchschnitt zweier Werte', () => {
    expect(calcAverageRating([3, 5])).toBe(4);
  });

  test('Durchschnitt wird auf 2 Nachkommastellen gerundet', () => {
    expect(calcAverageRating([1, 2, 3])).toBe(2);
    expect(calcAverageRating([4, 5, 5])).toBeCloseTo(4.67, 2);
  });

  test('Alle Höchstwerte → 5', () => {
    expect(calcAverageRating([5, 5, 5, 5])).toBe(5);
  });
});
