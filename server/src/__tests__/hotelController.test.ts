import { Request, Response, NextFunction } from 'express';
import { createHotel, getHotel } from '../controllers/hotelController';
import { readDb, writeDb } from '../utils/db';

// Mock the database utilities
jest.mock('../utils/db', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

describe('Hotel Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createHotel', () => {
    it('should create a new hotel successfully', async () => {
      const hotelData = {
        name: 'Test Hotel',
        location: 'Test Location',
        description: 'Test Description',
      };
      mockRequest.body = hotelData;
      (readDb as jest.Mock).mockResolvedValue([]);
      (writeDb as jest.Mock).mockResolvedValue(undefined);

      await createHotel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ...hotelData,
          id: expect.any(String),
          images: [],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });
  });

  describe('getHotel', () => {
    it('should return a hotel if it exists', async () => {
      const mockHotel = {
        id: '123',
        name: 'Test Hotel',
        location: 'Test Location',
      };
      mockRequest.params = { hotelId: '123' };
      (readDb as jest.Mock).mockResolvedValue([mockHotel]);

      await getHotel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockHotel);
    });

    it('should return 404 if hotel does not exist', async () => {
      mockRequest.params = { hotelId: 'nonexistent' };
      (readDb as jest.Mock).mockResolvedValue([]);

      await getHotel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Hotel not found' });
    });
  });
});