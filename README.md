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

### 2. Get Hotel Details

**Endpoint:** `GET /hotel/:id`

- **Description:** Retrieves detailed information about a specific hotel.
- **Parameters:**
- `id`: Hotel ID (URL parameter)
- **Response:** JSON object containing the hotel details.

### 3. Update Hotel

**Endpoint:** `PUT /hotel/:id`
- **Description:** Updates an existing hotel's information.
- **Parameters:**
- `id`: Hotel ID (URL parameter)

- **Response:** JSON object of the newly updated hotel.

Example Request Body:
```json
{
  "title": "Luxury Beach Side Resort New",
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
    "/uploads/example.jpeg",
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

### 4. Upload Images

**Endpoint:** `POST /images`
- **Description:** Uploads images for a hotel.

**Notes:**
- Maximum 5 images can be uploaded at once
- Supported formats: JPG`, `PNG`, `SVG`, and `JPEG`

- **Response:** JSON object of the newly updated hotel with images.

Common HTTP Status Codes:

- 200: Success
- 201: Created successfully
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

# Postman Collection

To help you get started quickly, I have provided a Postman collection that includes all our API endpoints with example requests.

### Importing the Collection

1. Download our Postman Collection: [Hotel API Collection.json](./postman/W3_NodeJs.postman_collection.json)

2. Open Postman and click on "Import" in the top left corner

3. Drag and drop the downloaded JSON file or click "Upload Files" to select it

4. The collection will be imported with all available endpoints

### Available Endpoints in Collection

The collection includes the following endpoints:

- Create Hotel (`POST /hotel`)
- Get Hotel Details (`GET /hotel/:id`)
- Update Hotel (`PUT /hotel/:id`)
- Upload Images (`POST /images`)