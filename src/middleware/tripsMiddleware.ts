import { Context } from 'koa'
import TripModel from '../models/tripModel'
import { tripCreateSchema, tripUpdateSchema } from '../schemas/trip'
import { AuthContext } from './authMiddleware'

export async function getTrips(ctx: Context) {
  const destination = ctx.query.destination as string | undefined
  const trips = await TripModel.findAll({ 
    destination,
    is_public: true 
  })
  ctx.body = trips
}

// Protected endpoint: Get all trips for authenticated user's organization
export async function getMyTrips(ctx: AuthContext) {
  const destination = ctx.query.destination as string | undefined
  const trips = await TripModel.findAll({ 
    destination,
    owner_id: ctx.user!.organization_id 
  })
  ctx.body = trips
}

export async function getTrip(ctx: Context) {
  const id = parseInt(ctx.params.id, 10)
  const trip = await TripModel.findById(id)

  if (!trip) {
    ctx.status = 404
    ctx.body = { error: 'Trip not found' }
    return
  }

  // Only show public trips to non-authenticated users
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

  const trip = await TripModel.create(validation.data, ctx.user!.organization_id)
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

  if (existingTrip.owner_id !== ctx.user!.organization_id) {
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

  if (existingTrip.owner_id !== ctx.user!.organization_id) {
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
