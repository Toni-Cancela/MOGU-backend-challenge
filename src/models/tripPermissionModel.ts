import { executeQuery } from '../db'
import { TripPermission } from '../schemas/tripPermission'

type TargetType = 'user' | 'organization'

async function findByTripId(tripId: number): Promise<TripPermission[]> {
  const query = 'SELECT * FROM trip_permissions WHERE trip_id = $1'
  const result = await executeQuery<TripPermission>(query, [tripId])
  return result.rows
}

async function findAccessibleTripIds(userId: number, organizationId: number): Promise<number[]> {
  const query = `
    SELECT DISTINCT trip_id 
    FROM trip_permissions 
    WHERE user_id = $1 OR organization_id = $2
  `
  const result = await executeQuery<{ trip_id: number }>(query, [userId, organizationId])
  return result.rows.map((row) => row.trip_id)
}

async function findPermission(
  tripId: number,
  targetId: number,
  type: TargetType
): Promise<TripPermission | undefined> {
  const field = type === 'user' ? 'user_id' : 'organization_id'
  const query = `SELECT * FROM trip_permissions WHERE trip_id = $1 AND ${field} = $2`
  const result = await executeQuery<TripPermission>(query, [tripId, targetId])
  return result.rows[0] || undefined
}

async function setPermission(
  tripId: number,
  targetId: number,
  type: TargetType,
  permission: string
): Promise<TripPermission> {
  const field = type === 'user' ? 'user_id' : 'organization_id'
  const existing = await findPermission(tripId, targetId, type)

  if (existing) {
    const query = `
      UPDATE trip_permissions 
      SET permission = $1 
      WHERE trip_id = $2 AND ${field} = $3
      RETURNING *
    `
    const result = await executeQuery<TripPermission>(query, [permission, tripId, targetId])
    
    if (!result.rows[0]) {
      throw new Error('Failed to update permission')
    }
    
    return result.rows[0]
  } else {
    const query = `
      INSERT INTO trip_permissions (trip_id, ${field}, permission)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await executeQuery<TripPermission>(query, [tripId, targetId, permission])
    
    if (!result.rows[0]) {
      throw new Error('Failed to create permission')
    }
    
    return result.rows[0]
  }
}

async function removePermission(tripId: number, targetId: number, type: TargetType): Promise<boolean> {
  const field = type === 'user' ? 'user_id' : 'organization_id'
  const query = `DELETE FROM trip_permissions WHERE trip_id = $1 AND ${field} = $2`
  const result = await executeQuery(query, [tripId, targetId])
  return (result.rowCount ?? 0) > 0
}

async function findOrganizationPermission(
  tripId: number,
  organizationId: number
): Promise<TripPermission | undefined> {
  return findPermission(tripId, organizationId, 'organization')
}

async function findUserPermission(tripId: number, userId: number): Promise<TripPermission | undefined> {
  return findPermission(tripId, userId, 'user')
}

async function setOrganizationPermission(
  tripId: number,
  organizationId: number,
  permission: string
): Promise<TripPermission> {
  return setPermission(tripId, organizationId, 'organization', permission)
}

async function setUserPermission(
  tripId: number,
  userId: number,
  permission: string
): Promise<TripPermission> {
  return setPermission(tripId, userId, 'user', permission)
}

async function removeOrganizationPermission(tripId: number, organizationId: number): Promise<boolean> {
  return removePermission(tripId, organizationId, 'organization')
}

async function removeUserPermission(tripId: number, userId: number): Promise<boolean> {
  return removePermission(tripId, userId, 'user')
}

async function getUserPermission(
  tripId: number,
  userId: number,
  organizationId: number
): Promise<'write' | 'read' | null> {
  const userPerm = await findUserPermission(tripId, userId)
  if (userPerm) {
    return userPerm.permission as 'write' | 'read'
  }

  const orgPerm = await findOrganizationPermission(tripId, organizationId)
  if (orgPerm) {
    return orgPerm.permission as 'write' | 'read'
  }

  return null
}

export default {
  findByTripId,
  findAccessibleTripIds,
  findPermission,
  findOrganizationPermission,
  findUserPermission,
  setPermission,
  setOrganizationPermission,
  setUserPermission,
  removePermission,
  removeOrganizationPermission,
  removeUserPermission,
  getUserPermission,
}
