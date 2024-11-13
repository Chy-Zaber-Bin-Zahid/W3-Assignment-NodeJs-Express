import { Request, Response, NextFunction } from 'express';
import { createHotel } from '../controllers/hotelCreateController';
import { readDb, writeDb } from '../utils/db';
import { CreateHotelDto, Hotel } from '../types/hotel';

// Mock the database functions
jest.mock('../utils/db', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

describe('createHotel', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      body: {} as CreateHotelDto,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should create a new hotel successfully', async () => {
    const mockHotels: Hotel[] = [{ hotelId: 1 } as Hotel];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.body = {
      title: 'Test Hotel',
      description: 'A test hotel',
      amenities: ['WiFi', 'Pool'],
      bathroomCount: 2,
      bedroomCount: 3,
      guestCount: 6,
      host: 'Test Host',
      location: 'Test Location',
      address: 'Test Address',
      images: ["/uploads/image.png"],
      rooms: [
        { roomTitle: 'Deluxe Room', bedroomCount: 1 },
        { roomTitle: 'Suite', bedroomCount: 2 }
      ],
    };

    await createHotel(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      hotelId: 2,
      slug: 'test-hotel',
      title: 'Test Hotel',
      rooms: [
        expect.objectContaining({ roomSlug: 'deluxe-room', hotelSlug: 'test-hotel' }),
        expect.objectContaining({ roomSlug: 'suite', hotelSlug: 'test-hotel' })
      ]
    }));
    expect(writeDb).toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing', async () => {
    mockRequest.body = {
      title: 'Test Hotel',
      description: 'A test hotel',
      amenities: ['WiFi', 'Pool'],
      host: 'Test Host',
      location: 'Test Location',
      address: 'Test Address',
      rooms: [
        { roomTitle: 'Deluxe Room', bedroomCount: 1 },
        { roomTitle: 'Suite', bedroomCount: 2 }
      ],
    };

    await createHotel(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('should generate a unique slug', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1, slug: 'test-hotel' } as Hotel,
      { hotelId: 2, slug: 'test-hotel-1' } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.body = {
      title: 'Test Hotel',
      description: 'A test hotel',
      amenities: ['WiFi'],
      bathroomCount: 1,
      bedroomCount: 1,
      guestCount: 2,
      host: 'Test Host',
      location: 'Test Location',
      address: 'Test Address',
      images: ["/uploads/image.png"],
      rooms: [{ roomTitle: 'Standard Room', bedroomCount: 1 }],
    };

    await createHotel(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'test-hotel',
      rooms: [expect.objectContaining({ roomSlug: 'standard-room', hotelSlug: 'test-hotel' })]
    }));
  });

  it('should assign the correct hotelId', async () => {
    const mockHotels: Hotel[] = [
      { hotelId: 1 } as Hotel,
      { hotelId: 2 } as Hotel,
      { hotelId: 4 } as Hotel,
    ];
    (readDb as jest.Mock).mockResolvedValue(mockHotels);

    mockRequest.body = {
      title: 'Test Hotel',
      description: 'A test hotel',
      amenities: ['WiFi'],
      bathroomCount: 1,
      bedroomCount: 1,
      guestCount: 2,
      host: 'Test Host',
      location: 'Test Location',
      address: 'Test Address',
      images: ["/uploads/image.png"],
      rooms: [{ roomTitle: 'Economy Room', bedroomCount: 1 }],
    };

    await createHotel(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      hotelId: 3,
      rooms: [expect.objectContaining({ roomSlug: 'economy-room', hotelSlug: 'test-hotel' })]
    }));
  });

  it('should handle errors and call next function', async () => {
    const mockError = new Error('Database error');
    (readDb as jest.Mock).mockRejectedValue(mockError);

    mockRequest.body = {
      title: 'Test Hotel',
      description: 'A test hotel',
      amenities: ['WiFi'],
      bathroomCount: 1,
      bedroomCount: 1,
      guestCount: 2,
      host: 'Test Host',
      location: 'Test Location',
      address: 'Test Address',
      rooms: [{ roomTitle: 'Standard Room', bedroomCount: 1 }],
    };

    await createHotel(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(mockError);
  });
});