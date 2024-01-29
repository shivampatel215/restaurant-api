import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import {expect, jest, test} from '@jest/globals';

const prisma = new PrismaClient();
describe('Reservation Creation & Deletion Tests', () => {
    let sharedTableId: string;
    let reservationIdToDelete: string; 
    // Helper function to create a reservation
    async function createReservation(userIds: string[], dateTime: string, tableId: string) {
        const response = await request(app).post('/reservations/create-reservation').send({
            dateTime,
            userIds,
            tableId
        });
        return response;
    }
    async function getUserIdsByName(names: string[]) {
        const users = await prisma.eater.findMany({
            where: {
                name: { in: names }
            }
        });
        return users.map(user => user.id);
    }
    async function getRestaurantIdByName(name: string) {
        const restaurant = await prisma.restaurant.findFirst({ where: { name } });
        if (!restaurant) throw new Error(`Restaurant ${name} not found.`);
        return restaurant.id;
    }
    async function convertLocalToUTC(dateTimeString: string) {
        const localDate = new Date(dateTimeString + 'Z'); 
        // Calculate the UTC date-time
        const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
        return utcDate.toISOString().replace(/\.\d{3}Z$/, '.000Z');
    } 


    test('Create reservation for Gob, Tobias, and George Michael at Tetetlán', async () => {
        // Get user IDs by names
        const userNames = ['Gob', 'Tobias', 'Lucile'];
        const userIds = await getUserIdsByName(userNames);
        const dateTime = '2024-02-14T19:00:00';

        // Search for available tables
        const searchResponse = await request(app)
            .post('/restaurants/search')
            .send({ dateTime, userIds });

        expect(searchResponse.status).toBe(200);
        // Get the restaurant ID for 'Tetetlán'
        const tetetlanId = await getRestaurantIdByName('Tetetlán');

        // Find an available table at Tetetlán
        const tetetlan = searchResponse.body.find((r: { id: string; }) => r.id === tetetlanId);
        expect(tetetlan).toBeDefined();
        sharedTableId = tetetlan.suitableTable.id;


        // Create a reservation at the found table
        const reservationResponse = await createReservation(userIds, dateTime, tetetlan.suitableTable.id);
        reservationIdToDelete = reservationResponse.body.id;
        expect(reservationResponse.status).toBe(200); // Assuming 200 is the success status code
        expect(reservationResponse.body.id).toBeDefined();
        const dateTimeUTC = await convertLocalToUTC(dateTime);
        expect(reservationResponse.body.time).toBe(dateTimeUTC);

    });

    test('Attempt to create a reservation at an already taken table', async () => {
        const dateTime='2024-02-14T20:15:00';
        expect(sharedTableId).toBeDefined();

        // Attempt to create a reservation at the taken table
        const failedReservationResponse = await createReservation(['xxx333ddd'], '2024-02-14T20:15:00', sharedTableId);
        expect(failedReservationResponse.status).toBe(500);
        expect(failedReservationResponse.text).toBe('The table is not available at the requested time.')
    });
    test('Failed Reservation due to overlapping reservation by one or more member of party', async () => {
        // Get user IDs by names
        const userNames = ['Maeby', 'Tobias'];
        const userIds = await getUserIdsByName(userNames);
        const dateTime = '2024-02-14T20:30:00';

        // Search for available tables
        const searchResponse = await request(app)
            .post('/restaurants/search')
            .send({ dateTime, userIds });

        expect(searchResponse.status).toBe(200);
        // Get the restaurant ID for 'Tetetlán'
        const utopiaId = await getRestaurantIdByName('u.to.pi.a');

        // Find an available table at utopia 
        const utopia = searchResponse.body.find((r: { id: string; }) => r.id === utopiaId);

        // try to create a reservation at the found table (this should fail)
        const reservationResponse = await createReservation(userIds, dateTime, utopia.suitableTable.id);
        expect(reservationResponse.status).toBe(500);
        expect(reservationResponse.text).toBe('One or more users have overlapping reservations.')

    });
    test('Delete an Existing Reservation', async () => {
        expect(reservationIdToDelete).toBeDefined(); 

        // Make a DELETE request to the reservation endpoint
        const deleteResponse = await request(app).delete(`/reservations/${reservationIdToDelete}`);
        
        // Check if the response is successful
        expect(deleteResponse.status).toBe(200); 
        expect(deleteResponse.body.id).toBe(reservationIdToDelete); 
    });

});

  