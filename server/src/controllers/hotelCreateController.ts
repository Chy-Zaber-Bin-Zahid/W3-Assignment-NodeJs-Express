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
      
      // Validate required fields
      if (!req.body.title || !req.body.description || !req.body.amenities || !req.body.bathroomCount || !req.body.bedroomCount || !req.body.guestCount || !req.body.host || !req.body.location || !req.body.address || !req.body.rooms) {
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
        hotelId: nextHotelId,
        slug,
        ...req.body,
        images: [],
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