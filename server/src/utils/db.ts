import fs from 'fs/promises';
import path from 'path';
import { Hotel } from '../types/hotel';

const DB_PATH = path.join(process.cwd(), 'data', 'hotels.json');

export async function ensureDbExists() {
  try {
    await fs.access(path.dirname(DB_PATH));
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify([]));
  }
}

export async function readDb(): Promise<Hotel[]> {
  await ensureDbExists();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeDb(hotels: Hotel[]) {
  await fs.writeFile(DB_PATH, JSON.stringify(hotels, null, 2));
}