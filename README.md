# Restaurant-Reservation-API 
Restaurant API with a social Twist (Rec.us)

This API is a backend service for managing restaurant reservations. 

## Setup Instructions

### Prerequisites

1. **Node.js:** You need to have node.js installed to run the application. You can download and install the latest version from node's website here: https://nodejs.org/
2. **Docker:** Docker is used to setup the PostgreSQL Database. Please install Docker Desktop from their website if you don't already have it on your machine: https://www.docker.com/products/docker-desktop/
3. **Prisma CLI:** Prisma will be included in the package.json. You will need it to run Prisma commands. Install it globally using the following command before completing the next steps: `npm install -g prisma` 

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

After running the docker command, open docker desktop (or use terminal) to ensure that the container is up and running

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







