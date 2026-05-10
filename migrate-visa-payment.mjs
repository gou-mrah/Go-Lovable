import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [cols] = await conn.query('SHOW COLUMNS FROM visa_applications');
  const colNames = cols.map(c => c.Field);
  console.log('Existing columns:', colNames.join(', '));
  
  const alters = [];
  if (colNames.indexOf('feeSAR') === -1) alters.push('ADD COLUMN feeSAR DECIMAL(10,2) DEFAULT NULL');
  if (colNames.indexOf('paymentIntentId') === -1) alters.push('ADD COLUMN paymentIntentId VARCHAR(255) DEFAULT NULL');
  if (colNames.indexOf('paymentStatus') === -1) alters.push("ADD COLUMN paymentStatus ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid'");
  if (colNames.indexOf('paidAt') === -1) alters.push('ADD COLUMN paidAt TIMESTAMP DEFAULT NULL');
  
  if (alters.length > 0) {
    const sql = 'ALTER TABLE visa_applications ' + alters.join(', ');
    console.log('Running:', sql);
    await conn.query(sql);
    console.log('Done - added columns!');
  } else {
    console.log('All columns already exist');
  }
  
  await conn.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
