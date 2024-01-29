import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FindRestaurantsDto } from './dto/find-restaurants.dto';
import { searchRestaurants } from './restaurant.service';

export const findRestaurants = async (req: Request, res: Response) => {
/*ASSUMPTION: The Frontend has access to all userIds that are attempting to make a reservation.
  if this was not the case this endpoint would have been handled differently. */
  try {
    //validate the request
    const findRestaurantsDto = plainToInstance(FindRestaurantsDto, req.body);
    const errors = await validate(findRestaurantsDto);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    const restaurants = await searchRestaurants(findRestaurantsDto.userIds, new Date(findRestaurantsDto.dateTime));
    res.json(restaurants);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
