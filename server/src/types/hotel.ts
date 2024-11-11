export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelDto {
  name: string;
  description: string;
  location: string;
  rating: number;
}