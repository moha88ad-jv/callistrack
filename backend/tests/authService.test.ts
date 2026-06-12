/**
 * Unit-Tests: authService
 * US-08 – Registrierung & Login (Priorität: Highest)
 * Methode: Äquivalenzklassen + Grenzwertanalyse
 */
import { isValidEmail, isValidPassword, calcLevel } from '../src/services/authService';

describe('isValidEmail', () => {
  test('akzeptiert gültige E-Mail', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  test('lehnt E-Mail ohne @-Zeichen ab', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });

  test('lehnt E-Mail ohne Domain ab', () => {
    expect(isValidEmail('missing@')).toBe(false);
  });

  test('lehnt leere Zeichenkette ab', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  test('akzeptiert starkes Passwort', () => {
    expect(isValidPassword('Test1234!')).toBe(true);
    expect(isValidPassword('Secure#99')).toBe(true);
  });

  test('lehnt Passwort ohne Großbuchstaben ab', () => {
    expect(isValidPassword('test1234!')).toBe(false);
  });

  test('lehnt Passwort ohne Zahl ab', () => {
    expect(isValidPassword('TestPass!')).toBe(false);
  });

  test('lehnt Passwort ohne Sonderzeichen ab', () => {
    expect(isValidPassword('TestPass1')).toBe(false);
  });

  test('Grenzwert: 7 Zeichen wird abgelehnt', () => {
    expect(isValidPassword('Te1!abc')).toBe(false);
  });

  test('Grenzwert: 8 Zeichen wird akzeptiert', () => {
    expect(isValidPassword('Test123!')).toBe(true);
  });
});

describe('calcLevel (authService – 500 Punkte je Level)', () => {
  test('Level 1 bei 0 Punkten', () => expect(calcLevel(0)).toBe(1));
  test('Level 1 bei 499 Punkten (unterhalb der Schwelle)', () => expect(calcLevel(499)).toBe(1));
  test('Grenzwert: Level 2 bei genau 500 Punkten', () => expect(calcLevel(500)).toBe(2));
  test('Level 2 bei 999 Punkten', () => expect(calcLevel(999)).toBe(2));
  test('Grenzwert: Level 3 bei genau 1000 Punkten', () => expect(calcLevel(1000)).toBe(3));
  test('Level 20 (Maximum) wird nicht überschritten', () => expect(calcLevel(100_000)).toBe(20));
});
