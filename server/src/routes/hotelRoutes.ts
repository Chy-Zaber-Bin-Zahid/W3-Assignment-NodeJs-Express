import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { uploadImages } from '../controllers/hotelImagesController';
import { upload } from '../middleware/upload';
import { createHotel } from '../controllers/hotelCreateController';
import { getHotel } from '../controllers/hotelFindController';
import { updateHotel } from '../controllers/hotelUpdateController';

const router = Router();

type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

router.post('/hotel', createHotel as RouteHandler);
router.get('/hotel/:id', getHotel as RouteHandler);
router.put('/hotel/:id', updateHotel as RouteHandler);
router.post('/images', upload.array('images', 5), uploadImages as RouteHandler);

export const hotelRoutes = router;