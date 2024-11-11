import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../utils/db';
import { Hotel, CreateHotelDto } from '../types/hotel';

export const createHotel = async (req: Request<{}, {}, CreateHotelDto>, res: Response, next: NextFunction) => {
  try {
    const hotels = await readDb();
    const newHotel: Hotel = {
      id: uuidv4(),
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

export const getHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hotelId } = req.params;
    const hotels = await readDb();
    const hotel = hotels.find(h => h.id === hotelId);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hotelId } = req.params;
    const updateData = req.body;
    
    const hotels = await readDb();
    const hotelIndex = hotels.findIndex(h => h.id === hotelId);
    
    if (hotelIndex === -1) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    hotels[hotelIndex] = {
      ...hotels[hotelIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    await writeDb(hotels);
    
    res.json(hotels[hotelIndex]);
  } catch (error) {
    next(error);
  }
};

export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hotelId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    const hotels = await readDb();
    const hotelIndex = hotels.findIndex(h => h.id === hotelId);
    
    if (hotelIndex === -1) {
      return res.status(404).json({ error: 'Hotel not found' });
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