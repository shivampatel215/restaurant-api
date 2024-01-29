import { IsArray, IsDateString, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  dateTime!: string;

  @IsArray()
  @IsString({ each: true })
  userIds!: string[];

  @IsString()
  tableId!: string;
}
