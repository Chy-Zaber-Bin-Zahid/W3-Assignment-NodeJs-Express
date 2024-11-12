# W3-Assignment-NodeJs-Express

## Setup

- `git clone https://github.com/Chy-Zaber-Bin-Zahid/W3-Assignment-NodeJs-Express.git`
- `cd server`
- `mkdir uploads`
- `npm init -y`
- `npm install express cors dotenv`
- `npm install -D typescript @types/express @types/node @types/cors ts-node nodemon`
- `npm install multer uuid && npm install -D @types/multer @types/uuid`
- `npm install --save-dev jest @types/jest ts-jest`
- `npm install slugify`

### Environment Variables

Create an `.env` file in the `server` directory and add the following variables:

- `PORT=3000`
- `DB_PATH=./data/hotel-id.json`

## API Endpoints

### 1. Create a Hotel

**Endpoint:** `POST /hotel`

- **Description:** Creates a new hotel entry in the database.
- **Request Body:** JSON containing `title`, `description`, `guestCount`, `bedroomCount`, `bathroomCount`, `amenities`, `host`, `address`, `location`, `images`, and `rooms`.
- **Response:** JSON object of the newly created hotel.

Example Request Body:
```json
{
  "title": "Luxury Beach Side Resort",
  "description": "A resort with beautiful views of the ocean",
  "guestCount": 100,
  "bedroomCount": 50,
  "bathroomCount": 50,
  "amenities": ["Free Wi-Fi", "Swimming Pool"],
  "host": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "address": "123 Ocean Drive, Malibu, California",
  "location": {
    "latitude": 34.0259,
    "longitude": -118.7798,
  },
  "images": [
    "/uploads/example.png",
    "/uploads/example.jpg",
  ],
  "rooms": [
    {
      "roomTitle": "Ocean View Suite",
      "roomImage": "https://example.com/images/room3.jpg",
      "bedroomCount": 1
    }
  ]
}
```