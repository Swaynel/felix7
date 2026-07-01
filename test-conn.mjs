import { Client } from "pg";
import fs from "node:fs";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync("./certs/ca.pem").toString(),
    rejectUnauthorized: true,
  },
});

try {
  await client.connect();
  const res = await client.query("SELECT NOW()");
  console.log("✅ Connected:", res.rows[0]);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
} finally {
  await client.end();
}
