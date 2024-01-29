# restaurant-api
Restaurant API with a social Twist (Rec.us)

This API is a backend service for managing restaurant reservations. 

## Setup Instructions

### Clone the Repository
`git clone https://github.com/shivampatel215/restaurant-api.git`
`cd restaurant-api`

### Environment Variables
Create a `.env` file in the root directory and add the necessary environment variables. 

### Install Dependencies
`npm install`

### Docker Setup
#### Start the Docker Container for PostgreSQL. Run the following command: 

`docker-compose up -d`

### DB Setup

#### Initialize Prisma:

`npx prisma init`

At this point, open a database client of your choice (I used DBeaver) and connect to the postgresql db using
the credentials provided. Test the connection. You should see it connected and at this point there should be no tables in the db.

#### Run Migrations
##### Run the following command to run the db migrations. After this, you should see tables (no records or data) in your db

`npx prisma migrate dev`

#### Run the following command to generate the prisma client. 

`npx prisma generate`


#### Seed the DB
`npm run seed`

Now you should see data in your database. 

### Start the Application
`npm run start`

### Running Tests
`npm run test`

### Additional Scripts
### Resetting the DB
`npm run reset-db`

Make sure to reset the DB after before running the tests as the test suite affects the actual database. 
This command can be run at any time if you want to clear your DB. It will repopulate the DB with the initial seed data (clear all existing reservations).







