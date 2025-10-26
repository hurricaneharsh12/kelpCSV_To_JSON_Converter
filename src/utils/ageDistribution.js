const pool = require('../config/database');

class AgeDistributionCalculator {
  /**
   * Calculate and print age distribution
   * @returns {Promise<void>}
   */
  async calculateAndPrint() {
    try {
      const distribution = await this.getAgeDistribution();
      this.printDistribution(distribution);
    } catch (error) {
      console.error('Error calculating age distribution:', error.message);
      throw error;
    }
  }

  /**
   * Get age distribution from database
   * @returns {Promise<Object>} - Age distribution object
   */
  async getAgeDistribution() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) as under_20,
        SUM(CASE WHEN age >= 20 AND age <= 40 THEN 1 ELSE 0 END) as age_20_40,
        SUM(CASE WHEN age > 40 AND age <= 60 THEN 1 ELSE 0 END) as age_40_60,
        SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) as over_60
      FROM users
    `;

    const result = await pool.query(query);
    const data = result.rows[0];
    const total = parseInt(data.total);

    if (total === 0) {
      return {
        under_20: 0,
        age_20_40: 0,
        age_40_60: 0,
        over_60: 0
      };
    }

    return {
      under_20: Math.round((parseInt(data.under_20) / total) * 100),
      age_20_40: Math.round((parseInt(data.age_20_40) / total) * 100),
      age_40_60: Math.round((parseInt(data.age_40_60) / total) * 100),
      over_60: Math.round((parseInt(data.over_60) / total) * 100)
    };
  }

  /**
   * Print age distribution in table format
   * @param {Object} distribution - Age distribution object
   */
  printDistribution(distribution) {
    console.log('\n');
    console.log('='.repeat(50));
    console.log('AGE DISTRIBUTION REPORT');
    console.log('='.repeat(50));
    console.log('');
    console.log('┌─────────────────────┬──────────────────┐');
    console.log('│ Age Group           │ % Distribution   │');
    console.log('├─────────────────────┼──────────────────┤');
    console.log(`│ < 20                │ ${this.padNumber(distribution.under_20)}               │`);
    console.log(`│ 20 to 40            │ ${this.padNumber(distribution.age_20_40)}               │`);
    console.log(`│ 40 to 60            │ ${this.padNumber(distribution.age_40_60)}               │`);
    console.log(`│ > 60                │ ${this.padNumber(distribution.over_60)}               │`);
    console.log('└─────────────────────┴──────────────────┘');
    console.log('');
    console.log('='.repeat(50));
    console.log('\n');
  }

  /**
   * Pad number to 2 digits
   * @param {number} num - Number to pad
   * @returns {string} - Padded string
   */
  padNumber(num) {
    return String(num).padStart(2, ' ');
  }
}

module.exports = new AgeDistributionCalculator();