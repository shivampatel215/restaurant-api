import express from 'express';
import { findRestaurants } from './restaurant.controller';

const router = express.Router();

router.post('/search', findRestaurants);

export default router;
