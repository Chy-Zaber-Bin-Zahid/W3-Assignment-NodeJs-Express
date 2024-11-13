import { NextFunction, Request, Response } from 'express';
import { readDb } from '../utils/db';

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