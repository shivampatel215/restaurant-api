import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { createReservation, deleteReservation } from './reservation.service';

export const createReservationEndpoint = async (req: Request, res: Response) => {
  try {
    // validate the request
    const createReservationDto = plainToInstance(CreateReservationDto, req.body);
    const errors = await validate(createReservationDto);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    const { dateTime, userIds, tableId } = createReservationDto;
    const reservation = await createReservation(new Date(dateTime), userIds, tableId);
    res.json(reservation);

  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
export const deleteReservationEndpoint = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const deletedReservation = await deleteReservation(reservationId);
      //send back deleted resource's body if the UI needs to display any details
      res.json(deletedReservation);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  };
  