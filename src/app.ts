import express from 'express';
import 'dotenv/config';
import restaurantRouter from './restaurants/restaurant.routes';
import reservationRouter from './reservations/reservation.routes';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(express.json());
app.use('/restaurants', restaurantRouter);
app.use('/reservations', reservationRouter);

export default app;
