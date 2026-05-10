import { drizzle } from "drizzle-orm/mysql2";
import { hajjPrograms } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);
const rows = await db.select().from(hajjPrograms);
console.log(`Total hajj_programs: ${rows.length}`);
for (const r of rows) {
  console.log(`  #${r.id} title="${r.title}" portalType=${r.portalType} isActive=${r.isActive} priceFromSAR=${r.priceFromSAR} minyaSleeping=${r.minyaSleeping} arafatSleeping=${r.arafatSleeping}`);
}
process.exit(0);
