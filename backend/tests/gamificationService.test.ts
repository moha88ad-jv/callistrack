import { calcLevel, calcAverageRating, awardPoints, POINTS, LEVEL_THRESHOLDS } from '../src/services/gamificationService';

jest.mock('../src/db/pool', () => ({
  query: jest.fn(),
}));

import pool from '../src/db/pool';
const mockPool = pool as jest.Mocked<typeof pool>;

describe('calcLevel', () => {
  it('0 points = level 1', () => expect(calcLevel(0)).toBe(1));
  it('100 points = level 2', () => expect(calcLevel(100)).toBe(2));
  it('299 points = level 2', () => expect(calcLevel(299)).toBe(2));
  it('300 points = level 3', () => expect(calcLevel(300)).toBe(3));
  it('600 points = level 4', () => expect(calcLevel(600)).toBe(4));
  it('1000 points = level 5', () => expect(calcLevel(1000)).toBe(5));
  it('1500 points = level 6', () => expect(calcLevel(1500)).toBe(6));
  it('2100 points = level 7', () => expect(calcLevel(2100)).toBe(7));
  it('5500 points = level 11', () => expect(calcLevel(5500)).toBe(11));
});

describe('calcAverageRating', () => {
  it('empty array returns 0', () => expect(calcAverageRating([])).toBe(0));
  it('single rating returns that rating', () => expect(calcAverageRating([4])).toBe(4));
  it('multiple ratings returns average', () => expect(calcAverageRating([4, 5, 3])).toBe(4));
  it('rounds to 2 decimals', () => expect(calcAverageRating([1, 2, 3])).toBe(2));
  it('all 5 stars returns 5', () => expect(calcAverageRating([5, 5, 5])).toBe(5));
  it('all 1 stars returns 1', () => expect(calcAverageRating([1, 1, 1])).toBe(1));
});

describe('POINTS constants', () => {
  it('WORKOUT gives 10 points', () => expect(POINTS.WORKOUT).toBe(10));
  it('RATING gives 5 points', () => expect(POINTS.RATING).toBe(5));
  it('SPOT_CREATED gives 20 points', () => expect(POINTS.SPOT_CREATED).toBe(20));
});

describe('LEVEL_THRESHOLDS', () => {
  it('first threshold is 0', () => expect(LEVEL_THRESHOLDS[0]).toBe(0));
  it('second threshold is 100', () => expect(LEVEL_THRESHOLDS[1]).toBe(100));
  it('has 11 thresholds', () => expect(LEVEL_THRESHOLDS.length).toBe(11));
});

describe('awardPoints', () => {
  beforeEach(() => jest.clearAllMocks());

  it('awards workout points and returns new level', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ points: 110, old_level: 1 }] })
      .mockResolvedValueOnce({ rowCount: 1 });
    const result = await awardPoints('user-1', 'WORKOUT');
    expect(result.points).toBe(110);
    expect(result.level).toBe(2);
    expect(result.levelUp).toBe(true);
  });

  it('awards rating points', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ points: 55, old_level: 1 }] });
    const result = await awardPoints('user-1', 'RATING');
    expect(result.points).toBe(55);
    expect(result.levelUp).toBe(false);
  });

  it('throws if user not found', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(awardPoints('invalid', 'WORKOUT')).rejects.toThrow('Nutzer nicht gefunden');
  });

  it('awards spot creation points', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ points: 20, old_level: 1 }] });
    const result = await awardPoints('user-1', 'SPOT_CREATED');
    expect(result.points).toBe(20);
  });
});

describe('getRanking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns top users sorted by points', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: '1', username: 'TopUser', level: 5, points: 500 },
        { id: '2', username: 'SecondUser', level: 3, points: 300 },
      ]
    });
    const { getRanking } = require('../src/services/gamificationService');
    const result = await getRanking(50);
    expect(result.length).toBe(2);
  });

  it('returns empty array when no users', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const { getRanking } = require('../src/services/gamificationService');
    const result = await getRanking(50);
    expect(result).toEqual([]);
  });
});

describe('getRanking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns top users sorted by points', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: '1', username: 'TopUser', level: 5, points: 500 },
        { id: '2', username: 'SecondUser', level: 3, points: 300 },
      ]
    });
    const { getRanking } = require('../src/services/gamificationService');
    const result = await getRanking(50);
    expect(result.length).toBe(2);
  });

  it('returns empty array when no users', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const { getRanking } = require('../src/services/gamificationService');
    const result = await getRanking(50);
    expect(result).toEqual([]);
  });
});

describe('calcLevel edge cases', () => {
  it('negative points = level 1', () => expect(calcLevel(-1)).toBe(1));
});
