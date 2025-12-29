import { executeQuery } from '../db'
import { Organization, OrganizationCreate, OrganizationUpdate } from '../schemas/organization'

async function findAll(): Promise<Organization[]> {
  const query = 'SELECT * FROM organizations ORDER BY created_at DESC'
  const result = await executeQuery<Organization>(query)
  return result.rows
}

async function findById(id: number): Promise<Organization | undefined> {
  const query = 'SELECT * FROM organizations WHERE id = $1'
  const result = await executeQuery<Organization>(query, [id])
  return result.rows[0]
}

async function findByName(name: string): Promise<Organization | undefined> {
  const query = 'SELECT * FROM organizations WHERE name = $1'
  const result = await executeQuery<Organization>(query, [name])
  return result.rows[0]
}

async function create(data: OrganizationCreate): Promise<Organization> {
  const query = `
    INSERT INTO organizations (name)
    VALUES ($1)
    RETURNING *
  `
  const result = await executeQuery<Organization>(query, [data.name])
  return result.rows[0]
}

async function update(id: number, data: OrganizationUpdate): Promise<Organization | undefined> {
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }

  if (updates.length === 0) {
    return undefined
  }

  values.push(id)
  const query = `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
  const result = await executeQuery<Organization>(query, values)
  return result.rows[0]
}

async function remove(id: number): Promise<boolean> {
  const query = 'DELETE FROM organizations WHERE id = $1'
  const result = await executeQuery(query, [id])
  return (result.rowCount ?? 0) > 0
}

export default {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
}
