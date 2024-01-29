import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import {expect, jest, test} from '@jest/globals';

const prisma = new PrismaClient();
  describe('Restaurant Search Tests', () => {
    // Helper function to get a single user ID with a vegan dietary restriction
    async function getSingleVeganUserId() {
      const veganRestriction = await prisma.dietaryRestriction.findFirst({
        where: { name: 'Vegan' }
      });
      const user = await prisma.eater.findFirst({
        where: { dietaryRestrictionIds: { has: veganRestriction?.id } }
      });
      return user?.id;
    }
  
    // Helper function to get three user IDs, ensuring at least one is vegan
    async function getThreeUserIdsWithOneVegan() {
      const veganRestriction = await prisma.dietaryRestriction.findFirst({
        where: { name: 'Vegan' }
      });
      const veganUser = await prisma.eater.findFirst({
        where: { dietaryRestrictionIds: { has: veganRestriction?.id } }
      });
  
      const otherUsers = await prisma.eater.findMany({
        where: { id: { not: veganUser?.id } },
        take: 2
      });
  
      return [veganUser?.id, ...otherUsers.map(u => u.id)];
    }
  
    // Helper function to get all user IDs
    async function getAllUserIds() {
      const users = await prisma.eater.findMany();
      return users.map(u => u.id);
    }
    // Helper function to get UserIds by Name
    async function getUserIdsByName(names: string[]) {
        const users = await prisma.eater.findMany({
            where: {
                name: { in: names }
            }
        });
        return users.map(user => user.id);
    }

      async function createReservationsForUsers(userNames: string[], tableIds: string[], dateTime: string) {
        for (const userName of userNames) {
          const user = await prisma.eater.findFirst({ where: { name: userName } });
          if (!user) {
            throw new Error(`User ${userName} not found.`);
          }
          for (let i=0; i<userNames.length; i++) {
            await prisma.reservation.create({
              data: {
                time: new Date(dateTime),
                tableId: tableIds[i],
                eaters: {
                  connect: [{ id: user.id }]
                }
              }
            });
          }
        }
      }
      
      // Helper function to get table IDs for a specific restaurant
      async function getTableIdsForRestaurant(restaurantId: string | '') {
        const tables = await prisma.table.findMany({
          where: { restaurantId }
        });
        return tables.map(table => table.id);
      }

      async function getRestaurantIdByName(name: string) {
        const restaurant = await prisma.restaurant.findFirst({ where: { name } });
        if (!restaurant) throw new Error(`Restaurant ${name} not found.`);
        return restaurant.id;
    }
    async function testTableSizeForUserCount(userNames: string[], expectedCapacity: number, dateTime: string, restaurantId: string) {
        const userIds = await getUserIdsByName(userNames);
        const response = await request(app).post('/restaurants/search').send({
            dateTime: dateTime, userIds
        });
        expect(response.status).toBe(200);
        const restaurant = response.body.find((r: { id: string; }) => r.id === restaurantId);
        expect(restaurant.suitableTable.capacity).toBe(expectedCapacity);
    }

      test('Vegan user searches for a table when all are reserved', async () => {
        const veganUserId = await getSingleVeganUserId();
        const veganRestaurantId = await getRestaurantIdByName('u.to.pi.a');
        const dateTime = '2024-01-25T19:00:00';
        const tableIds = await getTableIdsForRestaurant(veganRestaurantId);
        const userNames = ['Tobias', 'Michael'];
        // Create reservations for all tables at the vegan restaurant
        await createReservationsForUsers(userNames, tableIds, dateTime);
    
        // Search for restaurants at the same time - expecting no available tables
        let response = await request(app)
          .post('/restaurants/search')
          .send({ dateTime, userIds: [veganUserId] });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
    
        // Search two hours later - expecting available tables
        const twoHoursLater = new Date(new Date(dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();
        response = await request(app)
          .post('/restaurants/search')
          .send({ dateTime: twoHoursLater, userIds: [veganUserId] });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
      });
    

  
    test('Search available restaurants for a single vegan user', async () => {
      const userId = await getSingleVeganUserId();
      const dateTime = '2024-01-26T19:00:00';
  
      const response = await request(app)
        .post('/restaurants/search')
        .send({ dateTime, userIds: [userId] });
  
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

    });
  
    test('Search available restaurants for three users, one being vegan', async () => {
      const userIds = await getThreeUserIdsWithOneVegan();
      const dateTime = '2024-01-25T19:00:00';
  
      const response = await request(app)
        .post('/restaurants/search')
        .send({ dateTime, userIds });
  
      expect(response.status).toBe(200);
      //There is only one vegan friendly restaurant in the db, but it only has two 2 person tables. 
      //this test should return 0 in the search results since there is no restaurant that satisfies the dietary restrictions of the entire group
      expect(response.body.length).toBe(0);
    });
  
    test('Search available restaurants for all users', async () => {
      const userIds = await getAllUserIds();
      const dateTime = '2024-01-25T19:00:00';
  
      const response = await request(app)
        .post('/restaurants/search')
        .send({ dateTime, userIds });
  
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
    // //Following test is to ensure that the "table" being returned 
    // //is the smallest possible available table. If 2 people search, first prioritize 2 person tables then 4 then 6. 
    test('Table size prioritization', async () => {
        const panaderiaRosettaId = await getRestaurantIdByName('Panadería Rosetta')
        const dateTime = '2024-01-30T19:00:00';
        await testTableSizeForUserCount(['Michael', 'Lucile'], 2, dateTime, panaderiaRosettaId); // Expect 2-person table
        await testTableSizeForUserCount(['Michael', 'Lucile', 'George Michael'], 4, dateTime, panaderiaRosettaId); // Expect 4-person table
        const tableIds = await getTableIdsForRestaurant(panaderiaRosettaId || '')
        const userNames = ['Michael', 'Lucile', 'Tobias'];
        await testTableSizeForUserCount(['George Michael'], 2, dateTime, panaderiaRosettaId); // Expect 2-person table before reservations
        await createReservationsForUsers(userNames, tableIds, dateTime);
        await testTableSizeForUserCount(['George Michael'], 4, dateTime, panaderiaRosettaId); // Expect 4-person table after reservations
      });
  });

  