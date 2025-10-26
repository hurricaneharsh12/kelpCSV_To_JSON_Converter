const fs = require('fs');

class CSVParserService {
  /**
   * Custom CSV Parser - Parses CSV file without external libraries
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Array>} - Array of parsed objects
   */
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(new Error(`Failed to read CSV file: ${err.message}`));
          return;
        }

        try {
          const rows = this.splitIntoRows(data);
          if (rows.length === 0) {
            resolve([]);
            return;
          }

          const headers = this.parseRow(rows[0]);
          const records = [];

          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;

            const values = this.parseRow(rows[i]);
            const record = this.createNestedObject(headers, values);
            records.push(record);
          }

          resolve(records);
        } catch (error) {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  /**
   * Split CSV content into rows
   * @param {string} data - Raw CSV content
   * @returns {Array<string>} - Array of row strings
   */
  splitIntoRows(data) {
    const rows = [];
    let currentRow = '';
    let insideQuotes = false;

    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      const nextChar = data[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentRow += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === '\n' && !insideQuotes) {
        if (currentRow.trim() !== '') {
          rows.push(currentRow);
        }
        currentRow = '';
      } else if (char === '\r') {
        // Skip carriage return
        continue;
      } else {
        currentRow += char;
      }
    }

    // Add last row if exists
    if (currentRow.trim() !== '') {
      rows.push(currentRow);
    }

    return rows;
  }

  /**
   * Parse a single CSV row into values
   * @param {string} row - Single CSV row
   * @returns {Array<string>} - Array of values
   */
  parseRow(row) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    values.push(currentValue.trim());
    return values;
  }

  /**
   * Create nested object from dot-notation headers and values
   * @param {Array<string>} headers - Array of header names (with dot notation)
   * @param {Array<string>} values - Array of corresponding values
   * @returns {Object} - Nested object
   */
  createNestedObject(headers, values) {
    const result = {};

    for (let i = 0; i < headers.length; i++) {
      const path = headers[i].split('.');
      const value = values[i];

      this.setNestedProperty(result, path, value);
    }

    return result;
  }

  /**
   * Set a nested property in an object using path array
   * @param {Object} obj - Target object
   * @param {Array<string>} path - Path array (e.g., ['name', 'firstName'])
   * @param {*} value - Value to set
   */
  setNestedProperty(obj, path, value) {
    let current = obj;

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = path[path.length - 1];
    current[lastKey] = this.parseValue(value);
  }

  /**
   * Parse value to appropriate type (number, boolean, string)
   * @param {string} value - String value
   * @returns {*} - Parsed value
   */
  parseValue(value) {
    if (value === '') return null;

    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
      return num;
    }

    // Parse boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    return value;
  }
}

module.exports = new CSVParserService();