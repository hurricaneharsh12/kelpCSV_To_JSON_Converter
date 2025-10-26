const { Pool } = require("pg");
const fs = require("fs");

// Configure your DB connection!
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "csv_converter",
  password: "newpassword",
  port: 5432,
});

const DATA_FILE = "./output.json"; // path to your { data: [...] } file

async function insertUsers() {
  let userJson;
  try {
    userJson = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    console.error("Failed to read/parse input file:", err.message);
    process.exit(1);
  }
  const records = Array.isArray(userJson.data) ? userJson.data : userJson;
  console.log(`Loaded ${records.length} records from file.`);

  const client = await pool.connect();
  let inserted = 0,
    failed = 0;
  try {
    // Wipe old data & reset id counter
    await client.query("TRUNCATE TABLE users RESTART IDENTITY");
    for (const obj of records) {
      try {
        const { name, age, address, gender, additional_info } = obj;
        await client.query(
          `INSERT INTO users (name, age, address, gender, additional_info)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            JSON.stringify(name),
            parseInt(age, 10),
            JSON.stringify(address),
            gender,
            additional_info ? JSON.stringify(additional_info) : null,
          ]
        );
        inserted++;
      } catch (rowErr) {
        failed++;
        console.error(
          "Row insert error:",
          (obj.name?.firstName ?? "") + " " + (obj.name?.lastName ?? ""),
          "-",
          rowErr.message
        );
      }
    }
    console.log(`Inserted ${inserted} records, ${failed} failed.`);
  } finally {
    client.release();
    pool.end();
  }
}

insertUsers();
