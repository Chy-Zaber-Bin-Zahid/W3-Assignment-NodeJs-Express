import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { hotelRoutes } from './routes/hotelRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the Hotel Management API',
      version: '1.0.0',
      endpoints: {
        hotels: {
          create: 'POST /api/hotel',
          get: 'GET /api/hotel/:id',
          update: 'PUT /api/hotel/:id',
          uploadImages: 'POST /api/images'
        }
      },
      documentation: 'For detailed API documentation, please refer to README.md'
    });
  });

app.use('/api', hotelRoutes);

app.use(errorHandler as express.ErrorRequestHandler);

export default app;