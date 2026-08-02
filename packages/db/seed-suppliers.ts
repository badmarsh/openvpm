import { db } from './client';
import { suppliers, practices } from './schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

async function seedSuppliers() {
  try {
    const allPractices = await db.select().from(practices).limit(1);
    if (!allPractices.length) {
      console.error('No practices found in database');
      process.exit(1);
    }
    
    const practiceId = allPractices[0].id;
    
    console.log(`Seeding suppliers for practice: ${practiceId}`);
    
    const demoSuppliers = [
      {
        practiceId,
        name: "Med-Vet Supplies a.s.",
        contactEmail: "objednavky@medvet.sk",
        phone: "+421 905 123 456",
        address: "Veterinárna 12, 811 01 Bratislava",
        notes: "Hlavný dodávateľ liekov a vakcín."
      },
      {
        practiceId,
        name: "PetFood Slovakia",
        contactEmail: "distribucia@petfood.sk",
        phone: "+421 911 765 432",
        address: "Priemyselná 4, 917 01 Trnava",
        notes: "Krmivá, diéty a výživové doplnky."
      },
      {
        practiceId,
        name: "SurgicalTech s.r.o.",
        contactEmail: "info@surgicaltech.sk",
        phone: "+421 2 4567 8910",
        address: "Klinická 8, 040 01 Košice",
        notes: "Chirurgické nástroje a spotrebný materiál pre operačnú sálu."
      }
    ];
    
    for (const supplier of demoSuppliers) {
      await db.insert(suppliers).values(supplier);
    }
    
    console.log('Successfully seeded 3 demo suppliers!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed suppliers:', error);
    process.exit(1);
  }
}

seedSuppliers();
