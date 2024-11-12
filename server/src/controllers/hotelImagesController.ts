import { NextFunction, Request, Response } from 'express';
import { readDb, writeDb } from '../utils/db';

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id  = req.body.hotelId;
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