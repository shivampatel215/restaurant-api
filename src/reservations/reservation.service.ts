import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createReservation = async (dateTime: Date, userIds: string[], tableId: string) => {
  const dateTimeUTC = new Date(dateTime).toISOString();
  const twoHoursBefore = new Date(new Date(dateTimeUTC).getTime() - 2 * 60 * 60 * 1000);
  const twoHoursAfter = new Date(new Date(dateTimeUTC).getTime() + 2 * 60 * 60 * 1000);
  const overlappingTableReservations = await prisma.reservation.findMany({
    where: {
      tableId: tableId,
      AND: [
        {
          time: {
            gte: twoHoursBefore,
          },
        },
        {
          time: {
            lte: twoHoursAfter,
          },
        },
      ],
    },
  });

    // Handle the case where the table is not available
  if (overlappingTableReservations.length > 0) {
    throw new Error('The table is not available at the requested time.');
  }
  const overlappingUserReservations = await prisma.reservation.findMany({
    where: {
      eaters: {
        some: {
          id: {
            in: userIds,
          },
        },
      },
      AND: [
        {
          time: {
            gte: twoHoursBefore,
          },
        },
        {
          time: {
            lte: twoHoursAfter,
          },
        },
      ],
    },
  });
  
  
  // Handle the case where there are overlapping reservations
  if (overlappingUserReservations.length > 0) {
    throw new Error('One or more users have overlapping reservations.');
  }
  const reservation = await prisma.reservation.create({
    data: {
      time: new Date(dateTime).toISOString(),
      tableId: tableId,
      eaters: {
        connect: userIds.map(id => ({ id })),
      },
    },
  });

  return reservation;
};

export const deleteReservation = async (reservationId: string) => {
    return await prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });
  };
  