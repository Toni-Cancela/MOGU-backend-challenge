import { Context } from 'koa'
import TripModel from '../models/tripModel'
import TripPermissionModel from '../models/tripPermissionModel'
import UserModel from '../models/userModel'
import { tripCreateSchema, tripUpdateSchema } from '../schemas/trip'
import { shareWithOrganizationSchema, shareWithUserSchema } from '../schemas/tripPermission'
import { AuthContext } from './authMiddleware'

export async function getTrips(ctx: Context) {
  const destination = ctx.query.destination as string | undefined
  const trips = await TripModel.findAll({
    destination,
    is_public: true,
  })
  ctx.body = trips
}

export async function getMyTrips(ctx: AuthContext) {
  const destination = ctx.query.destination as string | undefined

  const ownedTrips = await TripModel.findAll({
    destination,
    owner_id: ctx.user!.id,
  })

  const accessibleTripIds = await TripPermissionModel.findAccessibleTripIds(
    ctx.user!.id,
    ctx.user!.organization_id
  )

  const accessibleTrips =
    accessibleTripIds.length > 0 ? await TripModel.findByIds(accessibleTripIds) : []

  const filteredAccessibleTrips = destination
    ? accessibleTrips.filter((trip) =>
        trip.destination.toLowerCase().includes(destination.toLowerCase())
      )
    : accessibleTrips

  const combined = [...ownedTrips, ...filteredAccessibleTrips]
  ctx.body = combined
}

export async function getTrip(ctx: Context) {
  const id = parseInt(ctx.params.id, 10)
  const trip = await TripModel.findById(id)

  if (!trip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  if (!trip.is_public) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  ctx.body = trip
}

export async function createTrip(ctx: AuthContext) {
  const validation = tripCreateSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  const trip = await TripModel.create(validation.data, ctx.user!.id)
  ctx.status = 201
  ctx.body = trip
}

export async function updateTrip(ctx: AuthContext) {
  const id = parseInt(ctx.params.id, 10)
  const validation = tripUpdateSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  if (Object.keys(validation.data).length === 0) {
    ctx.status = 400
    ctx.body = { error: 'No fields to update' }
    return
  }

  const existingTrip = await TripModel.findById(id)

  if (!existingTrip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  if (existingTrip.owner_id === ctx.user!.id) {
    const trip = await TripModel.update(id, validation.data)
    ctx.body = trip
    return
  }

  const permission = await TripPermissionModel.getUserPermission(
    id,
    ctx.user!.id,
    ctx.user!.organization_id
  )

  if (permission !== 'write') {
    ctx.status = 403
    ctx.body = { error: 'You do not have permission to update this trip' }
    return
  }

  const trip = await TripModel.update(id, validation.data)

  if (!trip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  ctx.body = trip
}

export async function deleteTrip(ctx: AuthContext) {
  const id = parseInt(ctx.params.id, 10)

  const existingTrip = await TripModel.findById(id)

  if (!existingTrip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  if (existingTrip.owner_id === ctx.user!.id) {
    await TripModel.remove(id)
    ctx.status = 204
    return
  }

  const permission = await TripPermissionModel.getUserPermission(
    id,
    ctx.user!.id,
    ctx.user!.organization_id
  )

  if (permission !== 'write') {
    ctx.status = 403
    ctx.body = { error: 'You do not have permission to delete this trip' }
    return
  }

  const deleted = await TripModel.remove(id)

  if (!deleted) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  ctx.status = 204
}

export async function shareWithOrganization(ctx: AuthContext) {
  const tripId = parseInt(ctx.params.id, 10)
  const validation = shareWithOrganizationSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  const trip = await TripModel.findById(tripId)

  if (!trip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  if (trip.owner_id !== ctx.user!.id) {
    ctx.status = 403
    ctx.body = { error: 'Only the trip owner can share with organization' }
    return
  }

  const { permission } = validation.data

  const tripPermission = await TripPermissionModel.setOrganizationPermission(
    tripId,
    ctx.user!.organization_id,
    permission
  )

  ctx.body = {
    message: 'Trip shared with organization successfully',
    permission: tripPermission,
  }
}

export async function shareWithUser(ctx: AuthContext) {
  const tripId = parseInt(ctx.params.id, 10)
  const validation = shareWithUserSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  const trip = await TripModel.findById(tripId)

  if (!trip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  if (trip.owner_id !== ctx.user!.id) {
    ctx.status = 403
    ctx.body = { error: 'Only the trip owner can share with users' }
    return
  }

  const { user_id, permission } = validation.data

  const targetUser = await UserModel.findById(user_id)
  if (!targetUser) {
    ctx.status = 404
    ctx.body = { error: 'Target user not found' }
    return
  }

  const tripPermission = await TripPermissionModel.setUserPermission(tripId, user_id, permission)

  ctx.body = {
    message: 'Trip shared with user successfully',
    permission: tripPermission,
  }
}
