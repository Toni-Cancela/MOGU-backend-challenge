import { Context } from 'koa'
import BookingModel from '../models/bookingModel'
import TripModel from '../models/tripModel'
import TravelerModel from '../models/travelerModel'
import PaymentModel from '../models/paymentModel'
import { bookingCreateSchema, bookingUpdateSchema, BookingStatus } from '../schemas/booking'
import { PaymentStatus } from '../schemas/payment'

export async function getBookings(ctx: Context) {
  const status = ctx.query.status as string | undefined
  const tripId = ctx.query.trip_id as string | undefined

  const bookings = await BookingModel.findAll({
    status,
    trip_id: tripId ? parseInt(tripId, 10) : undefined,
  })
  ctx.body = bookings
}

export async function getBooking(ctx: Context) {
  const id = parseInt(ctx.params.id, 10)
  const booking = await BookingModel.findById(id)

  if (!booking) {
    ctx.status = 404
    ctx.body = { error: 'Booking not found' }
    return
  }

  ctx.body = booking
}

export async function createBooking(ctx: Context) {
  const validation = bookingCreateSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  const { trip_id, traveler_id } = validation.data

  // Verify trip exists
  const trip = await TripModel.findById(trip_id)
  if (!trip) {
    ctx.status = 400
    ctx.body = { error: 'Trip not found' }
    return
  }

  // Verify traveler exists
  const traveler = await TravelerModel.findById(traveler_id)
  if (!traveler) {
    ctx.status = 400
    ctx.body = { error: 'Traveler not found' }
    return
  }

  const booking = await BookingModel.create(validation.data)
  ctx.status = 201
  ctx.body = booking
}

export async function updateBooking(ctx: Context) {
  const id = parseInt(ctx.params.id, 10)
  const validation = bookingUpdateSchema.safeParse(ctx.request.body)

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

  // Verify trip exists if updating
  if (validation.data.trip_id !== undefined) {
    const trip = await TripModel.findById(validation.data.trip_id)
    if (!trip) {
      ctx.status = 400
      ctx.body = { error: 'Trip not found' }
      return
    }
  }

  // Verify traveler exists if updating
  if (validation.data.traveler_id !== undefined) {
    const traveler = await TravelerModel.findById(validation.data.traveler_id)
    if (!traveler) {
      ctx.status = 400
      ctx.body = { error: 'Traveler not found' }
      return
    }
  }

  const booking = await BookingModel.update(id, validation.data)

  if (!booking) {
    ctx.status = 404
    ctx.body = { error: 'Booking not found' }
    return
  }

  ctx.body = booking
}

export async function deleteBooking(ctx: Context) {
  const id = parseInt(ctx.params.id, 10)
  const deleted = await BookingModel.remove(id)

  if (!deleted) {
    ctx.status = 404
    ctx.body = { error: 'Booking not found' }
    return
  }

  ctx.status = 204
}

export async function cancelBooking(ctx: Context) {
  const id = parseInt(ctx.params.id, 10)
  
  const booking = await BookingModel.findById(id)

  if (!booking) {
    ctx.status = 404
    ctx.body = { error: 'Booking not found' }
    return
  }

  if (booking.status === BookingStatus.Cancelled) {
    ctx.status = 400
    ctx.body = { error: 'Booking is already cancelled' }
    return
  }

  // Store original status for possible rollback
  const originalStatus = booking.status

  const cancelledBooking = await BookingModel.update(id, { status: BookingStatus.Cancelled })

  if (!cancelledBooking) {
    ctx.status = 500
    ctx.body = { error: 'Failed to cancel booking' }
    return
  }

  let refund = null

  try {
    const payments = await PaymentModel.findAll({ 
      booking_id: id,
      status: PaymentStatus.Completed 
    })

    if (payments.length > 0) {
      const completedPayment = payments[0]
      refund = await PaymentModel.create({
        booking_id: id,
        amount: -Math.abs(completedPayment.amount),
        currency: completedPayment.currency,
        status: PaymentStatus.Refunded,
      })

      if (!refund) {
        throw new Error('Failed to create refund')
      }
    }

    ctx.body = {
      booking: cancelledBooking,
      ...(refund && { refund })
    }
  } catch (error) {
    // Rollback: restore original booking status
    await BookingModel.update(id, { status: originalStatus })
    console.error('Error creating refund:', error)
    ctx.status = 500
    ctx.body = { error: 'Failed to process cancellation' }
  }
}
