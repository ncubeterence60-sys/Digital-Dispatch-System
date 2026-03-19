// SQLite Migration Script for Node.js Backend
// This script updates the dispatch_system.db database with new schema

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dispatch_system.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Run migrations sequentially
db.serialize(() => {
  console.log('Starting database migration...\n');

  // 1. Update Drivers table
  console.log('Updating Drivers table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS drivers_new (
      driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      email TEXT,
      vehicle_info TEXT,
      vehicle_registration TEXT,
      vehicle_make TEXT,
      vehicle_model TEXT,
      vehicle_color TEXT,
      status TEXT DEFAULT 'Offline',
      lat REAL,
      lng REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating drivers_new table:', err.message);
    else console.log('✓ Created drivers_new table');
  });

  // 2. Copy existing data to new drivers table
  db.run(`
    INSERT INTO drivers_new (driver_id, name, phone, vehicle_info, status, lat, lng, created_at, updated_at)
    SELECT driver_id, name, phone, vehicle_info, status, lat, lng, updated_at, updated_at
    FROM drivers
    WHERE NOT EXISTS (SELECT 1 FROM drivers_new WHERE driver_id = drivers.driver_id)
  `, (err) => {
    if (err && err.message.includes('no such table')) {
      console.log('✓ No existing drivers to migrate');
    } else if (err) {
      console.error('Error copying drivers data:', err.message);
    } else {
      console.log('✓ Migrated existing driver data');
    }
  });

  // 3. Drop old drivers table and rename
  db.run(`DROP TABLE IF EXISTS drivers`, (err) => {
    if (err && !err.message.includes('no such table')) {
      console.error('Error dropping old drivers table:', err.message);
    } else {
      console.log('✓ Dropped old drivers table');
    }
  });

  db.run(`ALTER TABLE drivers_new RENAME TO drivers`, (err) => {
    if (err) console.error('Error renaming table:', err.message);
    else console.log('✓ Renamed drivers_new to drivers');
  });

  // 4. Create Trips table
  console.log('\nCreating Trips table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
      pickup_location TEXT NOT NULL,
      dropoff_location TEXT NOT NULL,
      passenger_name TEXT,
      passenger_phone TEXT,
      passenger_email TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      pickup_time DATETIME,
      dropoff_time DATETIME,
      distance_km REAL,
      estimated_duration_minutes REAL,
      actual_duration_minutes REAL,
      fare REAL,
      tip_amount REAL,
      notes TEXT,
      driver_id INTEGER,
      FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
    )
  `, (err) => {
    if (err) console.error('Error creating trips table:', err.message);
    else console.log('✓ Created trips table');
  });

  // 5. Create Visits/Jobs table (if not exists)
  console.log('\nUpdating Jobs/Dispatches table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      job_id INTEGER PRIMARY KEY AUTOINCREMENT,
      pickup TEXT NOT NULL,
      dropoff TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      assigned_driver_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_driver_id) REFERENCES drivers(driver_id)
    )
  `, (err) => {
    if (err) console.error('Error: jobs table issue:', err.message);
    else console.log('✓ Jobs table confirmed');
  });

  // 6. Add indexes for better performance
  console.log('\nCreating indexes...');
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status)`, (err) => {
    if (err) console.error('Error creating driver status index:', err.message);
    else console.log('✓ Created index on drivers.status');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone)`, (err) => {
    if (err) console.error('Error creating driver phone index:', err.message);
    else console.log('✓ Created index on drivers.phone');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id)`, (err) => {
    if (err) console.error('Error creating trips driver index:', err.message);
    else console.log('✓ Created index on trips.driver_id');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)`, (err) => {
    if (err) console.error('Error creating trips status index:', err.message);
    else console.log('✓ Created index on trips.status');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)`, (err) => {
    if (err) console.error('Error creating jobs status index:', err.message);
    else console.log('✓ Created index on jobs.status');
  });

  // 7. Insert sample data if needed
  console.log('\nInserting sample data...');
  
  db.run(`
    INSERT OR IGNORE INTO drivers (name, phone, vehicle_info, status)
    VALUES ('John Doe', '123-456-7890', 'Toyota Camry', 'Available')
  `, (err) => {
    if (err) console.error('Error inserting John Doe:', err.message);
    else console.log('✓ Sample driver John Doe confirmed');
  });

  db.run(`
    INSERT OR IGNORE INTO drivers (name, phone, vehicle_info, status)
    VALUES ('Jane Smith', '098-765-4321', 'Ford F-150', 'Busy')
  `, (err) => {
    if (err) console.error('Error inserting Jane Smith:', err.message);
    else console.log('✓ Sample driver Jane Smith confirmed');
  });

  // Final callback
  db.all(`SELECT COUNT(*) as count FROM drivers`, (err, rows) => {
    if (err) {
      console.error('\nError verifying migration:', err.message);
    } else {
      const driverCount = rows[0].count;
      console.log('\n✅ Migration completed successfully!');
      console.log(`Total drivers in database: ${driverCount}`);
      console.log('\nDatabase schema is now updated with:');
      console.log('  - Enhanced Drivers table with location tracking and vehicle details');
      console.log('  - New Trips table for trip management');
      console.log('  - Updated Jobs table structure');
      console.log('  - Performance indexes on key columns');
    }
  });
});

// Close database connection after brief delay to allow queries to complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      process.exit(1);
    }
    console.log('\nDatabase connection closed.');
    process.exit(0);
  });
}, 2000);
