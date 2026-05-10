import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('/tmp/zid_data.json', 'utf8'));

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('Connected to DB');

  // Import reviews
  let revOk = 0, revErr = 0;
  for (const r of data.reviews) {
    try {
      await conn.execute(
        "INSERT INTO hajj_company_reviews (companyId, reviewerName, rating, reviewText, isApproved, bookingReference, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ['go-umrah', r[0], r[1], r[2], r[3], r[4], r[5]]
      );
      revOk++;
    } catch(e) { revErr++; }
  }
  console.log(`Reviews: ${revOk} imported, ${revErr} errors`);

  // Import orders in batches of 100
  let ordOk = 0, ordErr = 0;
  const BATCH = 100;
  for (let i = 0; i < data.orders.length; i += BATCH) {
    const batch = data.orders.slice(i, i + BATCH);
    for (const o of batch) {
      try {
        await conn.execute(
          "INSERT IGNORE INTO orders (orderNumber, status, items, subtotalUSD, shippingUSD, taxUSD, totalUSD, currency, shippingAddress, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          o
        );
        ordOk++;
      } catch(e) {
        ordErr++;
        if (ordErr <= 3) console.error('ORD ERR:', e.message.substring(0, 120));
      }
    }
    if ((i / BATCH) % 10 === 0) console.log(`Orders progress: ${i}/${data.orders.length}`);
  }
  console.log(`Orders: ${ordOk} imported, ${ordErr} errors`);

  await conn.end();
  console.log('Done!');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
