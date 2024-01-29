import { PrismaClient, Restaurant as PrismaRestaurant, Table } from '@prisma/client';


export interface Restaurant extends PrismaRestaurant {
    tables: Table[];
  }