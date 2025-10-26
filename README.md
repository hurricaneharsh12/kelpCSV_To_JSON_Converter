# CSV to JSON Converter API

A production-quality Node.js API that converts CSV files to JSON and stores data in PostgreSQL database with age distribution analytics.

## Features

- ✅ Custom CSV parser (no external CSV libraries)
- ✅ Supports nested properties with dot notation (e.g., `name.firstName`, `address.line1`)
- ✅ Handles large files (50,000+ records) with batch processing
- ✅ PostgreSQL database integration with JSONB support
- ✅ Age distribution analytics
- ✅ Express.js REST API
- ✅ Environment-based configuration
- ✅ Production-ready code quality

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd csv-to-json-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE csv_converter;

# Connect to the database
\c csv_converter

# Run the SQL script
\i src/models/init.sql
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

## Configuration

Edit `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=csv_converter
DB_USER=postgres
DB_PASSWORD=your_password
CSV_FILE_PATH=./data/sample.csv
```

## Usage

### Start the server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

### API Endpoints

#### 1. Import Users from CSV
```bash
POST /api/users/import

# Using default CSV file path (from .env)
curl -X POST http://localhost:3000/api/users/import

# Using custom CSV file path
curl -X POST http://localhost:3000/api/users/import \
  -H "Content-Type: application/json" \
  -d '{"filePath": "./data/custom.csv"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Users imported successfully",
  "data": {
    "totalRecords": 20,
    "insertedCount": 20,
    "parseTime": "45ms",
    "insertTime": "123ms"
  }
}
```

**Console Output:**
```
==================================================
AGE DISTRIBUTION REPORT
==================================================

┌─────────────────────┬──────────────────┐
│ Age Group           │ % Distribution   │
├─────────────────────┼──────────────────┤
│ < 20                │ 10               │
│ 20 to 40            │ 40               │
│ 40 to 60            │ 35               │
│ > 60                │ 15               │
└─────────────────────┴──────────────────┘

==================================================
```

#### 2. Get All Users
```bash
GET /api/users

curl http://localhost:3000/api/users
```

#### 3. Get Age Distribution
```bash
GET /api/users/age-distribution

curl http://localhost:3000/api/users/age-distribution
```

## CSV File Format

### Example CSV:
```csv
name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state
John,Doe,25,123 Main St,Apt 4B,New York,NY
Jane,Smith,35,456 Oak Ave,,Los Angeles,CA
```

### Mandatory Fields:
- `name.firstName`
- `name.lastName`
- `age`

### Nested Properties:
- Use dot notation for nested fields (e.g., `address.city`)
- Supports infinite nesting depth (e.g., `a.b.c.d.e.f`)
- All sub-properties should be adjacent in the CSV

## Database Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,              -- firstName + lastName
    age INTEGER NOT NULL,
    address JSONB,                           -- All address.* fields
    additional_info JSONB,                   -- All other fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Architecture

```
csv-to-json-api/
├── src/
│   ├── config/
│   │   ├── database.js         # PostgreSQL connection pool
│   │   └── env.js              # Environment configuration
│   ├── controllers/
│   │   └── userController.js   # Request handlers
│   ├── services/
│   │   ├── csvParserService.js # Custom CSV parser
│   │   └── userService.js      # Database operations
│   ├── utils/
│   │   └── ageDistribution.js  # Age analytics
│   ├── routes/
│   │   └── userRoutes.js       # API routes
│   └── models/
│       └── init.sql            # Database schema
├── data/
│   └── sample.csv              # Sample CSV file
├── .env.example
├── .gitignore
├── package.json
├── server.js                   # Application entry point
└── README.md
```

## Performance

- Handles 50,000+ records efficiently
- Batch processing (1,000 records per batch)
- Database transaction management
- Indexed age field for fast analytics

## Error Handling

- CSV file validation
- Mandatory field validation
- Database transaction rollback on errors
- Detailed error messages

## Assumptions

1. First row of CSV contains headers
2. Mandatory fields (name.firstName, name.lastName, age) are always present
3. Age is a valid integer
4. Sub-properties of complex objects are adjacent in CSV
5. Empty values are treated as NULL
6. Numeric values are automatically parsed

## Development

### Code Style
- Consistent formatting
- JSDoc comments for all methods
- Error handling at all levels
- Modular architecture

### Testing Recommendations
```bash
# Test with sample data
npm start
curl -X POST http://localhost:3000/api/users/import

# Verify database
psql -U postgres -d csv_converter -c "SELECT COUNT(*) FROM users;"
```

## Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
pg_isready

# Check credentials in .env file
```

### CSV Parse Error
```bash
# Ensure CSV format is correct
# Check for proper comma separation
# Verify headers match data columns
```

## License

ISC

## Author

Created for Kelp Global Coding Challenge
```