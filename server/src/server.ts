import dotenv from 'dotenv';
import app from './app';
import { ensureDbExists } from './utils/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  await ensureDbExists();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();