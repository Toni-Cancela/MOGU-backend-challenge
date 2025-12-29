import Router from '@koa/router'
import { getBookings, getBooking, createBooking, updateBooking, deleteBooking, cancelBooking } from '../middleware/bookingsMiddleware'

const router = new Router({ prefix: '/bookings' })

/**
 * @openapi
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *       - in: query
 *         name: trip_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
router.get('/', getBookings)

/**
 * @openapi
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBooking)

/**
 * @openapi
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trip_id
 *               - traveler_id
 *             properties:
 *               trip_id:
 *                 type: integer
 *               traveler_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 */
router.post('/', createBooking)

/**
 * @openapi
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *               trip_id:
 *                 type: integer
 *               traveler_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Booking updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Booking not found
 */
router.put('/:id', updateBooking)

/**
 * @openapi
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', deleteBooking)

/**
 * @openapi
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     description: Cancels booking and creates refund if payment was completed
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *                 refund:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Booking already cancelled
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to process cancellation
 */
router.patch('/:id/cancel', cancelBooking)

export default router
