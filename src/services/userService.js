const pool = require("../config/database");

class UserService {
  async processUsers(records) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let insertedCount = 0;
      const batchSize = 1000;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const count = await this.insertBatch(client, batch);
        insertedCount += count;
        console.log(
          `Processed ${Math.min(i + batchSize, records.length)} / ${
            records.length
          } records`
        );
      }
      await client.query("COMMIT");
      return { success: true, insertedCount, totalRecords: records.length };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async insertBatch(client, batch) {
    const values = [];
    const placeholders = [];
    let paramIndex = 1;
    for (const record of batch) {
      const { name, age, address, gender, additional_info } =
        this.transformRecord(record);
      placeholders.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${
          paramIndex + 3
        }, $${paramIndex + 4})`
      );
      values.push(
        JSON.stringify(name),
        age,
        JSON.stringify(address),
        gender,
        additional_info ? JSON.stringify(additional_info) : null
      );
      paramIndex += 5;
    }
    if (placeholders.length === 0) return 0;
    const query = `
      INSERT INTO users (name, age, address, gender, additional_info)
      VALUES ${placeholders.join(", ")}
    `;
    const result = await client.query(query, values);
    return result.rowCount;
  }

  // transformRecord(record) {
  //   // Your parser emits address as an object!
  //   const address = {
  //     line1: record.address?.line1 || "",
  //     line2: record.address?.line2 || "",
  //     city: record.address?.city || "",
  //     state: record.address?.state || "",
  //   };

  //   const name = {
  //     firstName: record.name?.firstName || "",
  //     lastName: record.name?.lastName || "",
  //   };

  //   const age = parseInt(record.age, 10) || 0;
  //   const gender =
  //     record.gender && record.gender.trim() !== "" ? record.gender : "unknown";

  //   // Don't put gender here!
  //   const known = ["name", "age", "address", "gender"];
  //   const additional_info = { importSource: "csv-batch" };
  //   for (const key in record) {
  //     if (!known.includes(key)) {
  //       additional_info[key] = record[key];
  //     }
  //   }

  //   return { name, age, address, gender, additional_info };
  // }
  transformRecord(record) {
    const name = {
      firstName: record.name?.firstName || "",
      lastName: record.name?.lastName || "",
    };
    const age = parseInt(record.age, 10) || 0;

    // Address: patch ALL fields so null becomes ""
    const address = {};
    if (typeof record.address === "object" && record.address !== null) {
      address.line1 = record.address.line1 != null ? record.address.line1 : "";
      address.line2 = record.address.line2 != null ? record.address.line2 : "";
      address.city = record.address.city != null ? record.address.city : "";
      address.state = record.address.state != null ? record.address.state : "";
    } else {
      address.line1 = address.line2 = address.city = address.state = "";
    }

    const gender =
      record.gender && record.gender.trim() !== "" ? record.gender : "unknown";
    const additional_info = { importSource: "csv-batch" };
    return { name, age, address, gender, additional_info };
  }

  async getAllUsers() {
    const result = await pool.query(
      "SELECT id, name, age, address, gender, additional_info FROM users"
    );
    return result.rows.map((row) => ({
      id: row.id, // <-- Add this line for the ID
      name: {
        firstName:
          (typeof row.name === "string" ? JSON.parse(row.name) : row.name)
            .firstName || "",
        lastName:
          (typeof row.name === "string" ? JSON.parse(row.name) : row.name)
            .lastName || "",
      },
      age: row.age,
      address:
        typeof row.address === "string" ? JSON.parse(row.address) : row.address,
      gender: row.gender,
      additional_info:
        row.additional_info && typeof row.additional_info === "string"
          ? JSON.parse(row.additional_info)
          : row.additional_info,
    }));
  }

  async clearAllUsers() {
    await pool.query("TRUNCATE TABLE users");
  }
}

module.exports = new UserService();
