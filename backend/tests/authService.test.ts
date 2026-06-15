import { isValidEmail, isValidPassword, calcLevel, registerUser, loginUser, deleteAccount } from '../src/services/authService';

// Mock pool
jest.mock('../src/db/pool', () => ({
  query: jest.fn(),
}));

import pool from '../src/db/pool';
const mockPool = pool as jest.Mocked<typeof pool>;

describe('isValidEmail', () => {
  it('valid email returns true', () => expect(isValidEmail('test@example.com')).toBe(true));
  it('email without @ returns false', () => expect(isValidEmail('testexample.com')).toBe(false));
  it('email without domain returns false', () => expect(isValidEmail('test@')).toBe(false));
  it('empty string returns false', () => expect(isValidEmail('')).toBe(false));
  it('email with subdomain returns true', () => expect(isValidEmail('user@mail.example.com')).toBe(true));
});

describe('isValidPassword', () => {
  it('valid password returns true', () => expect(isValidPassword('Test1234!')).toBe(true));
  it('too short returns false', () => expect(isValidPassword('Test1!')).toBe(false));
  it('no uppercase returns false', () => expect(isValidPassword('test1234!')).toBe(false));
  it('no digit returns false', () => expect(isValidPassword('TestTest!')).toBe(false));
  it('no special char returns false', () => expect(isValidPassword('Test12345')).toBe(false));
  it('exactly 8 chars valid returns true', () => expect(isValidPassword('Test123!')).toBe(true));
});

describe('calcLevel', () => {
  it('0 points = level 1', () => expect(calcLevel(0)).toBe(1));
  it('499 points = level 1', () => expect(calcLevel(499)).toBe(1));
  it('500 points = level 2', () => expect(calcLevel(500)).toBe(2));
  it('999 points = level 2', () => expect(calcLevel(999)).toBe(2));
  it('1000 points = level 3', () => expect(calcLevel(1000)).toBe(3));
  it('9500 points = level 20', () => expect(calcLevel(9500)).toBe(20));
});

describe('registerUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws on invalid email', async () => {
    await expect(registerUser({ username: 'test', email: 'invalid', password: 'Test1234!' }))
      .rejects.toThrow('Ungültige E-Mail-Adresse');
  });

  it('throws on invalid password', async () => {
    await expect(registerUser({ username: 'test', email: 'test@example.com', password: 'weak' }))
      .rejects.toThrow('Passwort');
  });

  it('throws if email already taken', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1, rows: [{ id: '1' }] });
    await expect(registerUser({ username: 'test', email: 'test@example.com', password: 'Test1234!' }))
      .rejects.toThrow('E-Mail bereits vergeben');
  });

  it('registers user successfully', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: '1', username: 'test', email: 'test@example.com', level: 1, points: 0 }] });
    const result = await registerUser({ username: 'test', email: 'test@example.com', password: 'Test1234!' });
    expect(result.username).toBe('test');
  });
});

describe('loginUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws if user not found', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(loginUser({ email: 'notfound@example.com', password: 'Test1234!' }))
      .rejects.toThrow('E-Mail oder Passwort falsch');
  });
});

describe('deleteAccount', () => {
  it('calls delete query', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });
    await deleteAccount('user-123');
    expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['user-123']);
  });
});

describe('loginUser - password check', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws if password is wrong', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rowCount: 1,
      rows: [{
        id: '1',
        username: 'test',
        email: 'test@example.com',
        password_hash: '$2a$10$invalidhashthatiswrong123456789',
        level: 1,
        points: 0,
        is_public: true,
        is_admin: false
      }]
    });
    await expect(loginUser({ email: 'test@example.com', password: 'WrongPass1!' }))
      .rejects.toThrow('E-Mail oder Passwort falsch');
  });
});

describe('loginUser - password check', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws if password is wrong', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rowCount: 1,
      rows: [{
        id: '1',
        username: 'test',
        email: 'test@example.com',
        password_hash: '$2a$10$invalidhashthatiswrong123456789',
        level: 1,
        points: 0,
        is_public: true,
        is_admin: false
      }]
    });
    await expect(loginUser({ email: 'test@example.com', password: 'WrongPass1!' }))
      .rejects.toThrow('E-Mail oder Passwort falsch');
  });
});

describe('loginUser - successful login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns token and user on successful login', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rowCount: 1,
      rows: [{
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: '$2a$10$ndusCS5TLGOFbIFDO3N08OPgFsM2mNUBhv5sDNElhBbbTgc5kfPjC',
        level: 1,
        points: 0,
        is_public: true,
        is_admin: false
      }]
    });
    const result = await loginUser({ email: 'test@example.com', password: 'Test1234!' });
    expect(result.token).toBeDefined();
    expect((result.user as any).username).toBe('testuser');
    expect((result.user as any).password_hash).toBeUndefined();
  });
});
