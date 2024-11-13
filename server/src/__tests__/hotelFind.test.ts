import { Request, Response, NextFunction } from 'express';
import { getHotel } from '../controllers/hotelFindController';
import { readDb } from '../utils/db';
import { Hotel } from '../types/hotel';

// Mock the database function
jest.mock('../utils/db', () => ({
  readDb: jest.fn(),
}));

describe('getHotel', () => {
  let mockRequest: Partial<Request<{ id: string }>>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      params: { id: '' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return a hotel when it exists', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, title: 'Test Hotel 1' } as Hotel,
      { hotelId: 2, title: 'Test Hotel 2' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.params = { id: '2' };

    await getHotel(mockRequest as Request<{ id: string }>, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      hotelId: 2,
      title: 'Test Hotel 2',
    }));
  });

  it('should return 404 when hotel does not exist', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, title: 'Test Hotel 1' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.params = { id: '2' };

    await getHotel(mockRequest as Request<{ id: string }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Hotel not found' });
  });

  it('should handle non-numeric id', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, title: 'Test Hotel 1' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.params = { id: 'abc' };

    await getHotel(mockRequest as Request<{ id: string }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Hotel not found' });
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Database error');
    (readDb as jest.Mock).mockRejectedValue(mockError);

    mockRequest.params = { id: '1' };

    await getHotel(mockRequest as Request<{ id: string }>, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(mockError);
  });
});