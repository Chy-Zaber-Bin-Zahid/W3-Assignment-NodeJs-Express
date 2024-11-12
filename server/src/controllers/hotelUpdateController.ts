import { NextFunction, Request, Response } from 'express';
import slugify from 'slugify';
import { UpdateHotelDto } from '../types/hotel';
import { readDb, writeDb } from '../utils/db';

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

    // Generate new hotel slug
    const hotelSlug = slugify(updateData.title || hotels[hotelIndex].title, { lower: true, strict: true });

    // Generate new room slugs and add hotelSlug
    const updatedRooms = updateData.rooms.map(room => ({
      ...room,
      hotelSlug,
      roomSlug: slugify(room.roomTitle, { lower: true, strict: true })
    }));

    hotels[hotelIndex] = {
      ...hotels[hotelIndex],
      ...updateData,
      slug: hotelSlug,
      rooms: updatedRooms,
      updatedAt: new Date().toISOString(),
    };

    await writeDb(hotels);
    
    res.json(hotels[hotelIndex]);
  } catch (error) {
    next(error);
  }
};