import { NextFunction, Request, Response } from 'express';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { CreateHotelDto, Hotel } from '../types/hotel';
import { readDb, writeDb } from '../utils/db';

export const createHotel = async (
    req: Request<{}, {}, CreateHotelDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const hotels = await readDb();
      const slug = slugify(req.body.title, { lower: true, strict: true });
      const roomsWithSlugs = req.body.rooms.map(room => ({
        ...room,
        hotelSlug: slugify(req.body.title, { lower: true, strict: true }),
        roomSlug: slugify(room.roomTitle, { lower: true, strict: true })
      }));
      
      // Validate required fields
      const requiredFields: (keyof CreateHotelDto)[] = [
        'title', 
        'description', 
        'amenities', 
        'bathroomCount', 
        'bedroomCount', 
        'guestCount', 
        'host', 
        'location', 
        'address', 
        'rooms',
        'images'
      ];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        res.status(400).json({ 
          error: `The following fields are required: ${missingFields.join(', ')}` 
        });
        return;
      }
  
      // Find the next available hotelId (smallest missing number)
      const hotelIds = hotels.map(hotel => hotel.hotelId);
      let nextHotelId = 1;
  
      // Loop to find the smallest missing hotelId
      while (hotelIds.includes(nextHotelId)) {
        nextHotelId++;
      }

      const {rooms, ...newHotelData} = req.body
  
      const newHotel: Hotel = {
        id: uuidv4(),
        hotelId: nextHotelId,
        slug,
        ...newHotelData,
        rooms: roomsWithSlugs,
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