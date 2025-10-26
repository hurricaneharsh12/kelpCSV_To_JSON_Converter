const csvParserService = require("../services/csvParserService");
const userService = require("../services/userService");
const ageDistribution = require("../utils/ageDistribution");
const config = require("../config/env");

class UserController {
  async importUsers(req, res) {
    try {
      const filePath = req.body.filePath || config.CSV_FILE_PATH;
      console.log(`Starting CSV import from: ${filePath}`);
      const startParse = Date.now();
      const records = await csvParserService.parseCSV(filePath);
      const parseTime = Date.now() - startParse;
      console.log(`Parsed ${records.length} records in ${parseTime}ms`);
      if (records.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No records found in CSV file" });
      }
      const validation = this.validateRecords(records);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }
      const startInsert = Date.now();
      const result = await userService.processUsers(records);
      const insertTime = Date.now() - startInsert;
      console.log(
        `Inserted ${result.insertedCount} records in ${insertTime}ms`
      );
      await ageDistribution.calculateAndPrint();
      res.json({
        success: true,
        message: "Users imported successfully",
        data: {
          totalRecords: result.totalRecords,
          insertedCount: result.insertedCount,
          parseTime: `${parseTime}ms`,
          insertTime: `${insertTime}ms`,
        },
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to import users",
        error: error.message,
      });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      // Map users: include id, never empty address, gender as top-level property, additional_info always present
      const filteredUsers = users.map(
        ({ id, name, age, address, gender, additional_info }) => ({
          id, // <-- Include id here!
          name,
          age,
          address: {
            line1: address.line1 || "NO LINE1",
            line2: address.line2 || "NO LINE2",
            city: address.city || "NO CITY",
            state: address.state || "NO STATE",
          },
          gender,
          additional_info: additional_info || { importSource: "csv-custom" },
        })
      );
      res.set("Content-Type", "application/json");
      res.send(
        JSON.stringify(
          {
            success: true,
            count: filteredUsers.length,
            data: filteredUsers,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve users",
        error: error.message,
      });
    }
  }

  async getAgeDistribution(req, res) {
    try {
      await ageDistribution.calculateAndPrint();
      res.json({
        success: true,
        message: "Age distribution printed to console",
      });
    } catch (error) {
      console.error("Age distribution error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate age distribution",
        error: error.message,
      });
    }
  }

  validateRecords(records) {
    const errors = [];
    for (let i = 0; i < Math.min(records.length, 100); i++) {
      const record = records[i];
      const rowNum = i + 2;
      if (!record.name?.firstName && !record["name.firstName"])
        errors.push(`Row ${rowNum}: Missing name.firstName`);
      if (!record.name?.lastName && !record["name.lastName"])
        errors.push(`Row ${rowNum}: Missing name.lastName`);
      if (
        record.age === undefined ||
        record.age === null ||
        record["age"] === undefined ||
        record["age"] === null
      )
        errors.push(`Row ${rowNum}: Missing age`);
      if (
        !record.address &&
        !record["address.line1"] &&
        !record["address.city"] &&
        !record["address.state"]
      )
        errors.push(`Row ${rowNum}: Missing address`);
      if (errors.length >= 10) break;
    }
    return { valid: errors.length === 0, errors };
  }
}

module.exports = new UserController();
