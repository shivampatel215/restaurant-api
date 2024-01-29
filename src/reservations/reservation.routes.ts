import express from 'express';
import { createReservationEndpoint, deleteReservationEndpoint } from './reservation.controller';


const router = express.Router();

router.post('/create-reservation', createReservationEndpoint);
router.delete('/:reservationId', deleteReservationEndpoint);


export default router;
