import mysql from "mysql2/promise";
const conn = await mysql.createConnection(process.env.DATABASE_URL as string);
const [tables] = await conn.query("SHOW TABLES") as any;
console.log("Tables:", tables.map((r: any) => Object.values(r)[0]));
try {
  const [migs] = await conn.query("SELECT hash FROM __drizzle_migrations") as any;
  console.log("Migration hashes:", migs.map((r:any)=>r.hash));
} catch(e: any) { console.log("No migrations table:", e.message); }
await conn.end();
