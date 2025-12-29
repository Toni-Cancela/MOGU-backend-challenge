import { executeQuery } from '../db'
import { User, UserCreate, UserUpdate } from '../schemas/user'

interface UserFilters {
  organization_id?: number
}

async function findAll(filters: UserFilters = {}): Promise<User[]> {
  let query = 'SELECT * FROM users'
  const conditions: string[] = []
  const params: unknown[] = []
  let paramIndex = 1

  if (filters.organization_id) {
    conditions.push(`organization_id = $${paramIndex++}`)
    params.push(filters.organization_id)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC'

  const result = await executeQuery<User>(query, params)
  return result.rows
}

async function findById(id: number): Promise<User | undefined> {
  const query = 'SELECT * FROM users WHERE id = $1'
  const result = await executeQuery<User>(query, [id])
  return result.rows[0]
}

async function findByEmail(email: string): Promise<User | undefined> {
  const query = 'SELECT * FROM users WHERE email = $1'
  const result = await executeQuery<User>(query, [email])
  return result.rows[0]
}

async function create(data: UserCreate): Promise<User> {
  const query = `
    INSERT INTO users (email, password, name, organization_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  const result = await executeQuery<User>(query, [
    data.email,
    data.password,
    data.name || null,
    data.organization_id,
  ])
  return result.rows[0]
}

async function update(id: number, data: UserUpdate): Promise<User | undefined> {
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (data.email !== undefined) {
    updates.push(`email = $${paramIndex++}`)
    values.push(data.email)
  }
  if (data.password !== undefined) {
    updates.push(`password = $${paramIndex++}`)
    values.push(data.password)
  }
  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }
  if (data.organization_id !== undefined) {
    updates.push(`organization_id = $${paramIndex++}`)
    values.push(data.organization_id)
  }

  if (updates.length === 0) {
    return undefined
  }

  values.push(id)
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
  const result = await executeQuery<User>(query, values)
  return result.rows[0]
}

async function remove(id: number): Promise<boolean> {
  const query = 'DELETE FROM users WHERE id = $1'
  const result = await executeQuery(query, [id])
  return (result.rowCount ?? 0) > 0
}

export default {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
}
