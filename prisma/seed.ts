import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Dietary Restrictions and Endorsements
  const [vegetarian, glutenFree, vegan, paleo] = await Promise.all([
    prisma.dietaryRestriction.create({ data: { name: 'Vegetarian' } }),
    prisma.dietaryRestriction.create({ data: { name: 'Gluten-Free' } }),
    prisma.dietaryRestriction.create({ data: { name: 'Vegan' } }),
    prisma.dietaryRestriction.create({ data: { name: 'Paleo' } })
  ]);

  const [vegetarianFriendly, glutenFreeOptions, veganFriendly, paleoFriendly] = await Promise.all([
    prisma.endorsement.create({ data: { name: 'Vegetarian-Friendly' } }),
    prisma.endorsement.create({ data: { name: 'Gluten Free Options' } }),
    prisma.endorsement.create({ data: { name: 'Vegan-Friendly' } }),
    prisma.endorsement.create({ data: { name: 'Paleo-Friendly' } })
  ]);
  await Promise.all([
    prisma.dietaryEndorsementMapping.create({ 
      data: { dietaryRestrictionId: vegetarian.id, endorsementId: vegetarianFriendly.id }
    }),
    prisma.dietaryEndorsementMapping.create({ 
      data: { dietaryRestrictionId: glutenFree.id, endorsementId: glutenFreeOptions.id }
    }),
    prisma.dietaryEndorsementMapping.create({ 
      data: { dietaryRestrictionId: vegan.id, endorsementId: veganFriendly.id }
    }),
    prisma.dietaryEndorsementMapping.create({ 
      data: { dietaryRestrictionId: paleo.id, endorsementId: paleoFriendly.id }
    })
  ]);

  // Seed DietaryEndorsementMappings
  // ... (create mappings based on the logic you have)

  // Seed Eaters with Dietary Restrictions
const michael = await prisma.eater.create({
        data: {
          name: 'Michael',
          location: '19.4153107,-99.1804722',
          dietaryRestrictionIds: [vegetarian.id] // Assuming this is an array field
        }
      });
      const george = await prisma.eater.create({
        data: {
          name: 'George Michael',
          location: '19.4058242,-99.1671942',
          dietaryRestrictionIds: [vegetarian.id, glutenFree.id] // Assuming this is an array field
        }
      });
      const lucile = await prisma.eater.create({
        data: {
          name: 'Lucile',
          location: '19.3634215,-99.1769323',
          dietaryRestrictionIds: [glutenFree.id] // Assuming this is an array field
        }
      });
      const gob = await prisma.eater.create({
        data: {
          name: 'Gob',
          location: '19.3318331,-99.2078983',
          dietaryRestrictionIds: [paleo.id] // Assuming this is an array field
        }
      });
      const tobias = await prisma.eater.create({
        data: {
          name: 'Tobias',
          location: '19.4384214,-99.2036906',
          dietaryRestrictionIds: [] // Assuming this is an array field
        }
      });
      const maeby = await prisma.eater.create({
        data: {
          name: 'Maeby',
          location: '19.4349474,-99.1419256',
          dietaryRestrictionIds: [vegan.id] // Assuming this is an array field
        }
      });

  // ... (seed other eaters similarly)

  // Seed Restaurants with Endorsements and Tables
  const lardo = await prisma.restaurant.create({
    data: {
      name: 'Lardo',
      endorsementsIds: [glutenFreeOptions.id],
      tables: {
        create: [
          { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, // Four two-top tables
          { capacity: 4 }, { capacity: 4 }, // Two four-top tables
          { capacity: 6 }  // One six-top table
        ]
      }
    }
  });
  const panaderiaRosetta = await prisma.restaurant.create({
    data: {
      name: 'Panadería Rosetta',
      endorsementsIds: [glutenFreeOptions.id, vegetarianFriendly.id],
      tables: {
        create: [
          { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, // three two-top tables
          { capacity: 4 }, { capacity: 4 }, // two four-top tables
        ]
      }
    }
  });
  const tetetlan = await prisma.restaurant.create({
    data: {
      name: 'Tetetlán',
      endorsementsIds: [paleoFriendly.id, glutenFreeOptions.id],
      tables: {
        create: [
          { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, // four two-top tables
          { capacity: 4 }, { capacity: 4 }, // two four-top tables
          { capacity: 6 }  // one six-top table
        ]
      }
    }
  });
  const fallingPianoBrewingCo = await prisma.restaurant.create({
    data: {
      name: 'Falling Piano Brewing Co',
      endorsementsIds: [],
      tables: {
        create: [
          { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, { capacity: 2 }, // four two-top tables
          { capacity: 4 }, { capacity: 4 },{ capacity: 4 },{ capacity: 4 },{ capacity: 4 }, // five four-top tables
          { capacity: 6 }, { capacity: 6 }, { capacity: 6 }, { capacity: 6 }, { capacity: 6 }, { capacity: 6 },  // one six-top table
        ]
      }
    }
  });
  const utopia = await prisma.restaurant.create({
    data: {
      name: 'u.to.pi.a',
      endorsementsIds: [veganFriendly.id, vegetarianFriendly.id],
      tables: {
        create: [
          { capacity: 2 }, { capacity: 2 } // Four two-top tables
         
        ]
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
