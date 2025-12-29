import Router from '@koa/router'
import { getPayments, getPayment, createPayment, updatePayment, deletePayment } from '../middleware/paymentsMiddleware'

const router = new Router({ prefix: '/payments' })

/**
 * @openapi
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *       - in: query
 *         name: booking_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 */
router.get('/', getPayments)

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     summary: Get a single payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 */
router.get('/:id', getPayment)

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *               - amount
 *             properties:
 *               booking_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *                 default: EUR
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *                 default: pending
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Validation error
 */
router.post('/', createPayment)

/**
 * @openapi
 * /payments/{id}:
 *   put:
 *     summary: Update a payment
 *     tags: [Payments]
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
 *                 enum: [pending, completed, failed, refunded]
 *               amount:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Payment not found
 */
router.put('/:id', updatePayment)

/**
 * @openapi
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 */
router.delete('/:id', deletePayment)

export default router
