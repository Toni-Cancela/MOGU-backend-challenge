import { pool } from '../src/db'

async function seed() {
  const client = await pool.connect()

  try {
    console.log('Seeding database...')

    // Clear existing data (in reverse order of dependencies)
    await client.query('DELETE FROM payments')
    await client.query('DELETE FROM bookings')
    await client.query('DELETE FROM trip_permissions')
    await client.query('DELETE FROM trips')
    await client.query('DELETE FROM travelers')
    await client.query('DELETE FROM users')
    await client.query('DELETE FROM organizations')

    // Reset sequences
    await client.query('ALTER SEQUENCE organizations_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE trips_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE travelers_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE payments_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE trip_permissions_id_seq RESTART WITH 1')

    // Insert organizations
    await client.query(`
      INSERT INTO organizations (name) VALUES
      ('Acme Corp'),
      ('Travel Agency Inc'),
      ('Adventure Co')
    `)

    // Insert users (password is 'password123' hashed with bcrypt)
    await client.query(`
      INSERT INTO users (email, password, name, organization_id) VALUES
      ('alice@acme.com', '$2b$10$rKqY7Y5p5V5T5p5T5p5T5.T5p5T5p5T5p5T5p5T5p5T5p5T5p5T5u', 'Alice Johnson', 1),
      ('bob@acme.com', '$2b$10$rKqY7Y5p5V5T5p5T5p5T5.T5p5T5p5T5p5T5p5T5p5T5p5T5p5T5u', 'Bob Smith', 1),
      ('charlie@travel.com', '$2b$10$rKqY7Y5p5V5T5p5T5p5T5.T5p5T5p5T5p5T5p5T5p5T5p5T5p5T5u', 'Charlie Brown', 2),
      ('diana@adventure.com', '$2b$10$rKqY7Y5p5V5T5p5T5p5T5.T5p5T5p5T5p5T5p5T5p5T5p5T5p5T5u', 'Diana Prince', 3)
    `)

    // Insert trips (owned by different users)
    await client.query(`
      INSERT INTO trips (title, destination, start_date, end_date, owner_id, is_public) VALUES
      ('Barcelona Adventure', 'Barcelona', '2025-03-15', '2025-03-20', 1, true),
      ('Paris Getaway', 'Paris', '2025-04-01', '2025-04-05', 2, false),
      ('Tokyo Explorer', 'Tokyo', '2025-05-10', '2025-05-20', 3, true)
    `)

    // Insert travelers
    await client.query(`
      INSERT INTO travelers (first_name, last_name, email) VALUES
      ('John', 'Doe', 'john@example.com'),
      ('Jane', 'Smith', 'jane@example.com'),
      ('Bob', 'Wilson', 'bob@example.com')
    `)

    // Insert bookings
    await client.query(`
      INSERT INTO bookings (trip_id, traveler_id, status) VALUES
      (1, 1, 'confirmed'),
      (2, 2, 'pending'),
      (3, 3, 'confirmed')
    `)

    // Insert payments
    await client.query(`
      INSERT INTO payments (booking_id, amount, currency, status) VALUES
      (1, 500.00, 'EUR', 'completed'),
      (2, 750.00, 'EUR', 'pending'),
      (3, 1200.00, 'EUR', 'completed')
    `)

    // Insert trip permissions (examples of sharing)
    await client.query(`
      INSERT INTO trip_permissions (trip_id, user_id, permission) VALUES
      (1, 2, 'write'),
      (2, 4, 'read')
    `)

    await client.query(`
      INSERT INTO trip_permissions (trip_id, organization_id, permission) VALUES
      (3, 1, 'read')
    `)

    console.log('Seed data inserted successfully')
  } catch (error) {
    console.error('Seed failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
