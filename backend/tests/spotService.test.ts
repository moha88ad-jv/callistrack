import { haversineDistance, findNearbySpots, getAllSpots, getSpotById, createSpot, moderateSpot } from '../src/services/spotService';

jest.mock('../src/db/pool', () => ({
  query: jest.fn(),
}));

import pool from '../src/db/pool';
const mockPool = pool as jest.Mocked<typeof pool>;

describe('haversineDistance', () => {
  it('same point = 0 meters', () => {
    expect(haversineDistance(50.0, 8.0, 50.0, 8.0)).toBe(0);
  });

  it('Mainz Volkspark to Rheinufer ~3km', () => {
    const dist = haversineDistance(50.030, 8.215, 50.045, 8.245);
    expect(dist).toBeGreaterThan(2000);
    expect(dist).toBeLessThan(4000);
  });

  it('Berlin to Munich ~500km', () => {
    const dist = haversineDistance(52.52, 13.405, 48.137, 11.576);
    expect(dist).toBeGreaterThan(500000);
    expect(dist).toBeLessThan(600000);
  });

  it('very close points < 20m', () => {
    const dist = haversineDistance(50.0297, 8.2399, 50.0298, 8.2400);
    expect(dist).toBeLessThan(20);
  });
});

describe('findNearbySpots', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty array when no nearby spots', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const result = await findNearbySpots(50.0297, 8.2399);
    expect(result).toEqual([]);
  });

  it('filters spots outside radius', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Far Spot', lat: 50.035, lng: 8.245 }]
    });
    const result = await findNearbySpots(50.0297, 8.2399);
    expect(result).toEqual([]);
  });

  it('returns spots within 20m radius', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Near Spot', lat: 50.02971, lng: 8.23991 }]
    });
    const result = await findNearbySpots(50.0297, 8.2399);
    expect(result.length).toBe(1);
  });
});

describe('getAllSpots', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all spots without filter', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Spot 1' }, { id: '2', name: 'Spot 2' }]
    });
    const result = await getAllSpots();
    expect(result.length).toBe(2);
  });

  it('filters by equipment', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Spot 1', equipment: ['Klimmzugstange'] }]
    });
    const result = await getAllSpots(['Klimmzugstange']);
    expect(result.length).toBe(1);
  });
});

describe('getSpotById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null if spot not found', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const result = await getSpotById('non-existent-id');
    expect(result).toBeNull();
  });

  it('returns spot with ratings', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: '1', name: 'Test Spot', rating: 4.5 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'r1', stars: 5, comment: 'Super', username: 'User1' }] });
    const result = await getSpotById('1');
    expect(result).not.toBeNull();
    expect(result!.ratings.length).toBe(1);
  });
});

describe('createSpot', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws duplicate warning if nearby spot exists', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Existing', lat: 50.02971, lng: 8.23991 }]
    });
    await expect(createSpot({
      name: 'New Spot', lat: 50.0297, lng: 8.2399,
      equipment: ['Barren'], userId: 'user-1'
    })).rejects.toThrow('Duplikat');
  });

  it('creates spot when no duplicates', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'new-1', name: 'New Spot' }] });
    const result = await createSpot({
      name: 'New Spot', lat: 50.0297, lng: 8.2399,
      equipment: ['Barren'], userId: 'user-1'
    });
    expect(result.name).toBe('New Spot');
  });
});

describe('moderateSpot', () => {
  beforeEach(() => jest.clearAllMocks());

  it('validates a spot', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Test Spot', status: 'validated' }]
    });
    const result = await moderateSpot('1', 'validate');
    expect(result!.status).toBe('validated');
  });

  it('rejects a spot', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: '1', name: 'Test Spot', status: 'archived' }]
    });
    const result = await moderateSpot('1', 'reject');
    expect(result!.status).toBe('archived');
  });

  it('returns null if spot not found', async () => {
    (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const result = await moderateSpot('non-existent', 'validate');
    expect(result).toBeNull();
  });
});
