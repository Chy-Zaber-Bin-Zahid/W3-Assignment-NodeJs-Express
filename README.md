# W3-Assignment-NodeJs-Express

#setup
-cd server
-npm init -y
-npm install express cors dotenv
-npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
-npx tsc --init
-npm install multer uuid && npm install -D @types/multer @types/uuid
-npm install --save-dev jest @types/jest ts-jest
-npm install slugify
-env file 
    -PORT=3000
    -NODE_ENV=development
    -DB_PATH=./data/hotels.json
    -UPLOAD_PATH=./uploads
-mkdir data upload