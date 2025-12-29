import { pool } from '../src/db'

async function migrate() {
  const client = await pool.connect()

  try {
    console.log('Running migrations...')

    // Create organizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create trips table with owner_id and is_public
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        owner_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS travelers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        traveler_id INTEGER NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_traveler_id ON bookings(traveler_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id)
    `)

    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
