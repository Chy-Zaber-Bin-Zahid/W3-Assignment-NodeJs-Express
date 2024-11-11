import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createHotel, getHotel, updateHotel, uploadImages } from '../controllers/hotelController';
import { upload } from '../middleware/upload';

const router = Router();

type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

router.post('/hotel', createHotel as RouteHandler);
router.get('/hotel/:hotelId', getHotel as RouteHandler);
router.put('/hotel/:hotelId', updateHotel as RouteHandler);
router.post('/images/:hotelId', upload.array('images', 5), uploadImages as RouteHandler);

export const hotelRoutes = router;