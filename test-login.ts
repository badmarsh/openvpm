import { db } from "./packages/db/index";
import { users } from "./packages/db/schema";
import { eq } from "drizzle-orm";
// NextAuth hashes passwords using bcrypt? Let's just retrieve the user.
async function testLogin() {
  const adminEmail = 'admin@neighborhoodvet.example.com';
  console.log(`Checking OpenVPM database for ${adminEmail}...`);
  const foundUsers = await db.select().from(users).where(eq(users.email, adminEmail));
  
  if (foundUsers.length > 0) {
    const user = foundUsers[0];
    console.log(`✅ OpenVPM admin user found!`);
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
  } else {
    console.log(`❌ OpenVPM admin NOT found in DB`);
  }
  process.exit();
}
testLogin().catch(console.error);
