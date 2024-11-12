import { Request, Response, NextFunction } from 'express';
import { uploadImages } from '../controllers/hotelImagesController';
import { readDb, writeDb } from '../utils/db';
import { Hotel } from '../types/hotel';

// Mock the database functions
jest.mock('../utils/db', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

describe('uploadImages', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      body: { hotelId: '1' },
      files: [],
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should upload images successfully', async () => {
    const mockHotels: Hotel[] = [
        { hotelId: 1, title: 'Old Hotel', slug: 'old-hotel' } as Hotel,
      ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.files = [
      { filename: 'image1.jpg' },
      { filename: 'image2.jpg' },
    ] as Express.Multer.File[];

    await uploadImages(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(writeDb).toHaveBeenCalledWith([
      expect.objectContaining({
        hotelId: 1,
        images: ['/uploads/image1.jpg', '/uploads/image2.jpg'],
        updatedAt: expect.any(String),
      }),
    ]);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      imageUrls: ['/uploads/image1.jpg', '/uploads/image2.jpg'],
    });
  });

  it('should return 400 when no images are uploaded', async () => {
    await uploadImages(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No images uploaded' });
  });

  it('should return 404 when hotel is not found', async () => {
    const mockHotels: Hotel[] = [];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.files = [{ filename: 'image1.jpg' }] as Express.Multer.File[];

    await uploadImages(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Hotel not found' });
  });

  it('should append new images to existing ones', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, images: ['/uploads/existing.jpg'], updatedAt: '2023-01-01T00:00:00.000Z' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.files = [{ filename: 'new.jpg' }] as Express.Multer.File[];

    await uploadImages(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(writeDb).toHaveBeenCalledWith([
      expect.objectContaining({
        hotelId: 1,
        images: ['/uploads/existing.jpg', '/uploads/new.jpg'],
        updatedAt: expect.any(String),
      }),
    ]);
  });

  it('should handle database read errors', async () => {
    const mockError = new Error('Database read error');
    (readDb as jest.Mock).mockRejectedValue(mockError);

    mockRequest.files = [{ filename: 'image1.jpg' }] as Express.Multer.File[];

    await uploadImages(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(mockError);
  });

  it('should handle database write errors', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, images: [], updatedAt: '2023-01-01T00:00:00.000Z' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    const mockError = new Error('Database write error');
    (writeDb as jest.Mock).mockRejectedValue(mockError);

    mockRequest.files = [{ filename: 'image1.jpg' }] as Express.Multer.File[];

    await uploadImages(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(mockError);
  });
});