import { PrismaClient, Endorsement, Table } from '@prisma/client';
import { Restaurant } from './entities/restaurant.entity';
const prisma = new PrismaClient();

export const searchRestaurants = async (userIds: string[], dateTime: Date) => {
  const groupSize = userIds.length;
  const dietaryRestrictionIds = await getUserDietaryRestrictions(userIds);
  const endorsementIds = await getEndorsementsFromDietaryRestrictions(dietaryRestrictionIds);
  const compatibleRestaurants = await findCompatibleRestaurants(endorsementIds);
  const dateTimeUTC = new Date(dateTime).toISOString();


  return getAvailableRestaurants(compatibleRestaurants, groupSize, dateTimeUTC);
};

async function getUserDietaryRestrictions(userIds: string[]) {
  const users = await prisma.eater.findMany({
    where: { id: { in: userIds } }
  });
  return [...new Set(users.flatMap(user => user.dietaryRestrictionIds))];
}

async function getEndorsementsFromDietaryRestrictions(dietaryRestrictionIds: string[]) {
  const endorsementMappings = await prisma.dietaryEndorsementMapping.findMany({
    where: { dietaryRestrictionId: { in: dietaryRestrictionIds } }
  });
  return endorsementMappings.map(mapping => mapping.endorsementId);
}

async function findCompatibleRestaurants(endorsementIds: string[]) {
    return prisma.restaurant.findMany({
      where: { endorsementsIds: { hasEvery: endorsementIds } },
      include: { 
        tables: {
          include: {
            reservations: true,
          }
        } 
      }
    });
  }
  

  async function getAvailableRestaurants(restaurants: Restaurant[], groupSize: number, dateTimeUTC: string) {
    const availableRestaurants: any[] = [];
  
    // Fetch all unique endorsement IDs from restaurants
    const allEndorsementIds: string[] = [...new Set(restaurants.flatMap(r => r.endorsementsIds))];
    
    // Fetch names for all endorsements in a single query. The FE may want to display these endorsements for each available restaurant.
    const endorsements = await prisma.endorsement.findMany({
      where: { id: { in: allEndorsementIds } }
    });
  
    // Create a map of endorsement IDs to names
    const endorsementMap = endorsements.reduce((map: Record<string, string>, endorsement: Endorsement) => {
      map[endorsement.id] = endorsement.name;
      return map;
    }, {});
  
    for (let restaurant of restaurants) {
      const suitableTable = findSuitableTable(restaurant.tables, groupSize, dateTimeUTC);
      if (suitableTable) {
        const endorsementNames = restaurant.endorsementsIds.map((id: string | number) => endorsementMap[id]);
  
        availableRestaurants.push({
          id: restaurant.id,
          name: restaurant.name,
          endorsements: endorsementNames,
          suitableTable: {
            id: suitableTable.id,
            capacity: suitableTable.capacity
          }
        });
      }
    }
    return availableRestaurants;
  }

  function findSuitableTable(tables: Table[], requiredCapacity: number, dateTimeUTC: string) {
    /*Sort tables by capacity in ascending order. The goal of this function is to find the best table given the party's size. 
    Restaurants wouldn't want us giving a 9 person table to a group of 3 if there is a 4 person table available.*/
    const sortedTables = tables.sort((a, b) => a.capacity - b.capacity);

    // Iterate over sorted tables to find the first available and suitable one. This is mainly for performance reasons. Especially if a restaurant has a lot of tables. 
    for (let table of sortedTables) {
        if (table.capacity >= requiredCapacity && isTableAvailable(table, dateTimeUTC)) {
            return table; // Return the first suitable and available table
        }
    }
    return null; 
}

  
function isTableAvailable(table: any, dateTimeUTC: string) {
    if (!Array.isArray(table.reservations)) {
        return true; // If no reservations, the table is available
      }
    // Convert to UTC so the db stores times consistently
    const reservationEndTimeUTC = new Date(new Date(dateTimeUTC).getTime() + 2 * 60 * 60 * 1000).toISOString();
    
    return !table.reservations.some((reservation: { time: Date; }) => {
      const existingReservationEndTimeUTC = new Date(new Date(reservation.time).getTime() + 2 * 60 * 60 * 1000).toISOString();
      return (dateTimeUTC >= reservation.time.toISOString() && dateTimeUTC < existingReservationEndTimeUTC) ||
             (reservationEndTimeUTC > reservation.time.toISOString() && reservationEndTimeUTC <= existingReservationEndTimeUTC);
    });
  }
