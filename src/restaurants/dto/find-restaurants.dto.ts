import { IsArray, IsDateString } from 'class-validator';

export class FindRestaurantsDto {
  @IsDateString()
    dateTime!: string;

  @IsArray()
  /*ASSUMPTION: The Frontend has access to all userIds that are attempting to make a reservation.
  if this was not the case this endpoint would have been handled differently. */
    userIds!: string[];
}
