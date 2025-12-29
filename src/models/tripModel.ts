import { executeQuery } from '../db'
import { Trip, TripCreate, TripUpdate } from '../schemas/trip'

interface TripFilters {
  destination?: string
  owner_id?: number
  is_public?: boolean
}

async function findAll(filters: TripFilters = {}): Promise<Trip[]> {
  let query = 'SELECT * FROM trips'
  const conditions: string[] = []
  const params: unknown[] = []
  let paramIndex = 1

  if (filters.destination) {
    conditions.push(`destination ILIKE $${paramIndex++}`)
    params.push(`%${filters.destination}%`)
  }

  if (filters.owner_id !== undefined) {
    conditions.push(`owner_id = $${paramIndex++}`)
    params.push(filters.owner_id)
  }

  if (filters.is_public !== undefined) {
    conditions.push(`is_public = $${paramIndex++}`)
    params.push(filters.is_public)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC'

  const result = await executeQuery<Trip>(query, params)
  return result.rows
}

async function findById(id: number): Promise<Trip | undefined> {
  const query = 'SELECT * FROM trips WHERE id = $1'
  const result = await executeQuery<Trip>(query, [id])
  return result.rows[0]
}

async function create(data: TripCreate, ownerId: number): Promise<Trip> {
  const query = `
    INSERT INTO trips (title, destination, start_date, end_date, owner_id, is_public)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  const result = await executeQuery<Trip>(query, [
    data.title,
    data.destination,
    data.start_date,
    data.end_date,
    ownerId,
    data.is_public ?? false,
  ])
  return result.rows[0]
}

async function update(id: number, data: TripUpdate): Promise<Trip | undefined> {
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`)
    values.push(data.title)
  }
  if (data.destination !== undefined) {
    updates.push(`destination = $${paramIndex++}`)
    values.push(data.destination)
  }
  if (data.start_date !== undefined) {
    updates.push(`start_date = $${paramIndex++}`)
    values.push(data.start_date)
  }
  if (data.end_date !== undefined) {
    updates.push(`end_date = $${paramIndex++}`)
    values.push(data.end_date)
  }
  if (data.is_public !== undefined) {
    updates.push(`is_public = $${paramIndex++}`)
    values.push(data.is_public)
  }

  if (updates.length === 0) {
    return undefined
  }

  values.push(id)
  const query = `UPDATE trips SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
  const result = await executeQuery<Trip>(query, values)
  return result.rows[0]
}

async function remove(id: number): Promise<boolean> {
  const query = 'DELETE FROM trips WHERE id = $1'
  const result = await executeQuery(query, [id])
  return (result.rowCount ?? 0) > 0
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
}
