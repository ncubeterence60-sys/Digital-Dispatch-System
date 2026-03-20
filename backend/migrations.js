// SQLite Migration Script for Node.js Backend - Better-SQLite3 Version
// This script updates the dispatch_system.db database with new schema

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dispatch_system.db');
const db = new Database(dbPath);
console.log('Connected to SQLite database (better-sqlite3)');

try {
  console.log('Starting database migration...\n');

  // 1. Update Drivers table
  console.log('Updating Drivers table...');
  db.exec(`
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
  `);
  console.log('✓ Created drivers_new table');

  // 2. Copy existing data to new drivers table
  try {
    db.prepare(`
      INSERT INTO drivers_new (driver_id, name, phone, vehicle_info, status, lat, lng, created_at, updated_at)
      SELECT driver_id, name, phone, vehicle_info, status, lat, lng, updated_at, updated_at
      FROM drivers
      WHERE NOT EXISTS (SELECT 1 FROM drivers_new WHERE driver_id = drivers.driver_id)
    `).run();
    console.log('✓ Migrated existing driver data');
  } catch (err) {
    if (err.message.includes('no such table')) {
      console.log('✓ No existing drivers to migrate');
    } else {
      console.error('Error copying drivers data:', err.message);
    }
  }

  // 3. Drop old drivers table and rename
  try {
    db.exec('DROP TABLE IF EXISTS drivers');
    console.log('✓ Dropped old drivers table');
  } catch (err) {
    if (!err.message.includes('no such table')) {
      console.error('Error dropping old drivers table:', err.message);
    }
  }

  db.exec('ALTER TABLE drivers_new RENAME TO drivers');
  console.log('✓ Renamed drivers_new to drivers');

  // 4. Create Trips table
  console.log('\nCreating Trips table...');
  db.exec(`
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
  `);
  console.log('✓ Created trips table');

  // 5. Create Visits/Jobs table
  console.log('\nUpdating Jobs/Dispatches table...');
  db.exec(`
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
  `);
  console.log('✓ Jobs table confirmed');

  // 6. Add indexes for better performance
  console.log('\nCreating indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status)',
    'CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone)',
    'CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)',
    'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)'
  ];
  
  indexes.forEach((sql, i) => {
    try {
      db.exec(sql);
      console.log(`✓ Created index ${i + 1}`);
    } catch (err) {
      console.error(`Error creating index ${i + 1}:`, err.message);
    }
  });

  // 7. Insert sample data if needed
  console.log('\nInserting sample data...');
  
  db.prepare(`
    INSERT OR IGNORE INTO drivers (name, phone, vehicle_info, status)
    VALUES ('John Doe', '123-456-7890', 'Toyota Camry', 'Available')
  `).run();
  console.log('✓ Sample driver John Doe confirmed');

  db.prepare(`
    INSERT OR IGNORE INTO drivers (name, phone, vehicle_info, status)
    VALUES ('Jane Smith', '098-765-4321', 'Ford F-150', 'Busy')
  `).run();
  console.log('✓ Sample driver Jane Smith confirmed');

  // Final verification
  const driverCount = db.prepare('SELECT COUNT(*) as count FROM drivers').get().count;
  console.log('\n✅ Migration completed successfully!');
  console.log(`Total drivers in database: ${driverCount}`);
  console.log('\nDatabase schema updated with:');
  console.log('  - Enhanced Drivers table (location, vehicle details)');
  console.log('  - Trips table for trip management');
  console.log('  - Jobs table structure');
  console.log('  - Performance indexes');
  
} catch (err) {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
} finally {
  // Close database connection
  setTimeout(() => {
    db.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }, 1000);
}

