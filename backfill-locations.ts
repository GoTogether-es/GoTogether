import { PrismaClient } from './apps/api/src/generated/client';
import { GeocodingService } from './apps/api/src/modules/location/geocoding.service';

const prisma = new PrismaClient();
const geocoding = new GeocodingService();

async function backfillUserLocations() {
  console.log('🔍 Buscando usuarios sin coordenadas...');

  const users = await prisma.user.findMany({
    where: {
      privateLocation: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
    },
    include: {
      privateLocation: true,
      profile: true,
    },
  });

  console.log(`📊 Encontrados ${users.length} usuarios sin coordenadas`);

  for (const user of users) {
    const city = user.privateLocation?.city;
    const fullAddress = user.privateLocation?.fullAddress;

    if (!city || !fullAddress) {
      console.log(`⏭️  ${user.email} (${user.id}): sin city/fullAddress, omitiendo`);
      continue;
    }

    console.log(`📍 Geocodificando ${user.email}: "${fullAddress}, ${city}"`);
    const coords = await geocoding.geocode(city, fullAddress);

    if (coords) {
      await prisma.userLocation.update({
        where: { userId: user.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
      console.log(`✅ ${user.email}: ${coords.latitude}, ${coords.longitude}`);
    } else {
      console.log(`❌ ${user.email}: No se pudo geocodificar (dirección inválida?)`);
    }
  }

  console.log('🏁 Backfill completado');
  await prisma.$disconnect();
}

backfillUserLocations().catch((err) => {
  console.error('❌ Error en backfill:', err);
  process.exit(1);
});