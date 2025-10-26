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




1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
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

## Configuration

`.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=csv_converter
DB_USER=postgres
DB_PASSWORD=newpassword
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
name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state,gender
John,Doe,25,123 Main St,Apt 4B,New York,NY,male
Jane,Smith,35,456 Oak Ave,,Los Angeles,CA,male
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

CREATE TABLE public.users (
"name" varchar NOT NULL, (name = firstName + lastName)
age int4 NOT NULL, address
jsonb NULL,
additional_info jsonb NULL, id
serial4 NOT NULL
);


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


### Testing Recommendations
```bash
# Test with sample data
npm start
curl -X POST http://localhost:3000/api/users/import

# Verify database
psql -U postgres -d csv_converter -c "SELECT COUNT(*) FROM users;"
*also to shee all of the json data in database use SELECT COUNT FROM users;*
```
also one can use node fetch.js to convert csv to output.json 
*output images:*

<img width="1920" height="833" alt="image" src="https://github.com/user-attachments/assets/ffb6b9bf-8f58-4a77-b2da-eedc05d8cdef" />

<img width="879" height="195" alt="image" src="https://github.com/user-attachments/assets/117f10a5-6c3c-4f3f-9e4a-f89518fb4d0b" />
<img width="1007" height="219" alt="image" src="https://github.com/user-attachments/assets/89d9628b-8408-4442-af2f-3f3638db65e4" />


https://github.com/user-attachments/assets/937fe795-f7f8-4540-b214-9886f6822e7b


```

```
