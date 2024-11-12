import { Request, Response, NextFunction } from 'express';
import { updateHotel } from '../controllers/hotelUpdateController';
import { readDb, writeDb } from '../utils/db';
import { Hotel, UpdateHotelDto } from '../types/hotel';

// Mock the database functions
jest.mock('../utils/db', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

describe('updateHotel', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      params: { id: '1' },
      body: {} as UpdateHotelDto,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should update a hotel successfully', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, title: 'Old Hotel', slug: 'old-hotel' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.body = {
      title: 'Updated Hotel',
      description: 'Updated description',
      images: ['image1.jpg', 'image2.jpg'],
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi', 'Pool'],
      host: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      address: '123 Main St',
      location: { latitude: 40.7128, longitude: -74.0060 },
      rooms: [
        { hotelSlug: 'updated-hotel', roomSlug: 'room-1', roomImage: 'room1.jpg', roomTitle: 'Room 1', bedroomCount: 1 },
      ],
    };

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(writeDb).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Updated Hotel',
      slug: 'updated-hotel',
    }));
  });

  it('should return 404 when hotel is not found', async () => {
    const mockHotels: Hotel[] = [
        { hotelId: 10} as Hotel,
      ];
      (readDb as jest.Mock).mockResolvedValue(mockHotels);
  
      mockRequest.body = {
        title: 'Updated Hotel',
        description: 'Updated description',
        images: ['image1.jpg', 'image2.jpg'],
        guestCount: 4,
        bedroomCount: 2,
        bathroomCount: 2,
        amenities: ['WiFi', 'Pool'],
        host: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        address: '123 Main St',
        location: { latitude: 40.7128, longitude: -74.0060 },
        rooms: [
          { hotelSlug: 'updated-hotel', roomSlug: 'room-1', roomImage: 'room1.jpg', roomTitle: 'Room 1', bedroomCount: 1 },
        ],
      };

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Hotel not found' });
  });

  it('should return 400 for invalid fields', async () => {
    mockRequest.body = {
      invalidField: 'Some value',
    } as any;

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Unwanted data in request',
      invalidFields: ['invalidField'],
    }));
  });

  it('should return 400 for missing required fields', async () => {
    mockRequest.body = {
      title: 'Updated Hotel',
      // Missing other required fields
    } as any;

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Missing required fields',
    }));
  });

  it('should return 400 for invalid host data', async () => {
    mockRequest.body = {
      title: 'Updated Hotel',
      description: 'Updated description',
      images: ['image1.jpg'],
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi'],
      host: { name: 'John Doe' }, // Missing email and phone
      address: '123 Main St',
      location: { latitude: 40.7128, longitude: -74.0060 },
      rooms: [{ hotelSlug: 'updated-hotel', roomSlug: 'room-1', roomImage: 'room1.jpg', roomTitle: 'Room 1', bedroomCount: 1 }],
    };

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid host data' });
  });

  it('should return 400 for invalid location data', async () => {
    mockRequest.body = {
      title: 'Updated Hotel',
      description: 'Updated description',
      images: ['image1.jpg'],
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi'],
      host: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      address: '123 Main St',
      location: { latitude: '40.7128' }, // Invalid latitude (string instead of number) and missing longitude
      rooms: [{ hotelSlug: 'updated-hotel', roomSlug: 'room-1', roomImage: 'room1.jpg', roomTitle: 'Room 1', bedroomCount: 1 }],
    };

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid location data' });
  });

  it('should return 400 for invalid rooms data', async () => {
    mockRequest.body = {
      title: 'Updated Hotel',
      description: 'Updated description',
      images: ['image1.jpg'],
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi'],
      host: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      address: '123 Main St',
      location: { latitude: 40.7128, longitude: -74.0060 },
      rooms: [], // Empty rooms array
    };

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid rooms data' });
  });

  it('should return 400 for invalid room data', async () => {
    mockRequest.body = {
      title: 'Updated Hotel',
      description: 'Updated description',
      images: ['image1.jpg'],
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi'],
      host: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      address: '123 Main St',
      location: { latitude: 40.7128, longitude: -74.0060 },
      rooms: [{ hotelSlug: 'updated-hotel' }], // Missing required room fields
    };

    await updateHotel(mockRequest as Request<{ id: string; }>, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Invalid room data',
    }));
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Database error');
    (readDb as jest.Mock).mockRejectedValue(mockError);
  
    mockRequest.body = {
      title: 'Updated Hotel',
      description: 'Updated description',
      images: ['image1.jpg'],
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi'],
      host: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      address: '123 Main St',
      location: { latitude: 40.7128, longitude: -74.0060 },
      rooms: [{ hotelSlug: 'updated-hotel', roomSlug: 'room-1', roomImage: 'room1.jpg', roomTitle: 'Room 1', bedroomCount: 1 }],
    };
  
    await updateHotel(mockRequest as Request<{ id: string }, {}, UpdateHotelDto>, mockResponse as Response, nextFunction);
  
    expect(nextFunction).toHaveBeenCalledWith(mockError);
  });
});