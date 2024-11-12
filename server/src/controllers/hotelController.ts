import { NextFunction, Request, Response } from 'express';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { CreateHotelDto, CreateRoomDto, Hotel, UpdateHotelDto } from '../types/hotel';
import { readDb, writeDb } from '../utils/db';


// Create New Hotel
export const createHotel = async (
  req: Request<{}, {}, CreateHotelDto>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotels = await readDb();
    const slug = slugify(req.body.title, { lower: true, strict: true });
    
    // Validate required fields
    if (!req.body.title || !req.body.description || !req.body.amenities || !req.body.bathroomCount || !req.body.bedroomCount || !req.body.guestCount || !req.body.host || !req.body.location || !req.body.address) {
      res.status(400).json({ error: 'Title, description, and other fields are required' });
      return;
    }

    // Find the next available hotelId (smallest missing number)
    const hotelIds = hotels.map(hotel => hotel.hotelId);
    let nextHotelId = 1;

    // Loop to find the smallest missing hotelId
    while (hotelIds.includes(nextHotelId)) {
      nextHotelId++;
    }

    const newHotel: Hotel = {
      id: uuidv4(),
      hotelId: nextHotelId,  // Assign the next available hotelId
      slug,
      ...req.body,
      images: [],
      rooms: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    hotels.push(newHotel);
    await writeDb(hotels);
    
    res.status(201).json(newHotel);
  } catch (error) {
    next(error);
  }
};


// Get Specific Hotel
export const getHotel = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const hotels = await readDb();
    const hotel = hotels.find(h => h.hotelId === Number(id));

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }
    
    res.json(hotel);
  } catch (error) {
    next(error);
  }
};


// Update Hotel Info
export const updateHotel = async (
  req: Request<{ id: string }, {}, UpdateHotelDto>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Define allowed fields for updating
    const allowedFields = [
      "title",
      "description",
      "images",
      "guestCount",
      "bedroomCount",
      "bathroomCount",
      "amenities",
      "host",
      "address",
      "location",
      "rooms"
    ];
    const invalidFields = Object.keys(updateData).filter(key => !allowedFields.includes(key));

    // If there are invalid fields, return an error
    if (invalidFields.length > 0) {
      res.status(400).json({
        error: 'Unwanted data in request',
        invalidFields,
      });
      return;
    }

    // Define required fields for updating
    const requiredFields = [
      "title",
      "description",
      "images",
      "guestCount",
      "bedroomCount",
      "bathroomCount",
      "amenities",
      "host",
      "address",
      "location",
      "rooms"
    ];

    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => !(field in updateData));

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Missing required fields',
        missingFields,
      });
      return;
    }

    // Validate nested objects
    if (typeof updateData.host !== 'object' || 
        !updateData.host.name || 
        !updateData.host.email || 
        !updateData.host.phone) {
      res.status(400).json({
        error: 'Invalid host data',
      });
      return;
    }

    if (typeof updateData.location !== 'object' || 
        typeof updateData.location.latitude !== 'number' || 
        typeof updateData.location.longitude !== 'number') {
      res.status(400).json({
        error: 'Invalid location data',
      });
      return;
    }

    if (!Array.isArray(updateData.rooms) || updateData.rooms.length === 0) {
      res.status(400).json({
        error: 'Invalid rooms data',
      });
      return;
    }

    // Validate room data
    const invalidRooms = updateData.rooms.filter(room => 
      !room.hotelSlug || 
      !room.roomSlug || 
      !room.roomImage || 
      !room.roomTitle || 
      typeof room.bedroomCount !== 'number'
    );

    if (invalidRooms.length > 0) {
      res.status(400).json({
        error: 'Invalid room data',
        invalidRooms,
      });
      return;
    }
    

    const hotels = await readDb();
    const hotelIndex = hotels.findIndex(h => h.hotelId === Number(id));
    
    if (hotelIndex === -1) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    // Update slug if title is being updated
    const slug = updateData.title 
      ? slugify(updateData.title, { lower: true, strict: true })
      : hotels[hotelIndex].slug;
    
    hotels[hotelIndex] = {
      ...hotels[hotelIndex],
      ...updateData,
      slug,
      updatedAt: new Date().toISOString(),
    };
    
    await writeDb(hotels);
    
    res.json(hotels[hotelIndex]);
  } catch (error) {
    next(error);
  }
};

// Upload Images
export const uploadImages = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No images uploaded' });
      return;
    }
    
    const hotels = await readDb();
    const hotelIndex = hotels.findIndex(h => h.hotelId === Number(id));
    
    if (hotelIndex === -1) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }
    
    const imageUrls = files.map(file => `/uploads/${file.filename}`);
    hotels[hotelIndex].images.push(...imageUrls);
    hotels[hotelIndex].updatedAt = new Date().toISOString();
    
    await writeDb(hotels);
    
    res.status(200).json({ imageUrls });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (
  req: Request<{ hotelId: string }, {}, CreateRoomDto>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hotelId } = req.params;
    const { roomTitle, bedroomCount } = req.body;
    
    if (!roomTitle) {
      res.status(400).json({ error: 'Room title is required' });
      return;
    }
    
    const hotels = await readDb();
    const hotelIndex = hotels.findIndex(h => h.id === hotelId || h.slug === hotelId);
    
    if (hotelIndex === -1) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }
    
    const roomSlug = slugify(roomTitle, { lower: true, strict: true });
    const newRoom = {
      hotelSlug: hotels[hotelIndex].slug,
      roomSlug,
      roomTitle,
      roomImage: '',
      bedroomCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    hotels[hotelIndex].rooms.push(newRoom);
    hotels[hotelIndex].updatedAt = new Date().toISOString();
    
    await writeDb(hotels);
    
    res.status(201).json(newRoom);
  } catch (error) {
    next(error);
  }
};