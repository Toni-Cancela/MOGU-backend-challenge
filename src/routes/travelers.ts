import Router from '@koa/router'
import { getTravelers, getTraveler, createTraveler, updateTraveler, deleteTraveler } from '../middleware/travelersMiddleware'

const router = new Router({ prefix: '/travelers' })

/**
 * @openapi
 * /travelers:
 *   get:
 *     summary: Get all travelers
 *     tags: [Travelers]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of travelers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Traveler'
 */
router.get('/', getTravelers)

/**
 * @openapi
 * /travelers/{id}:
 *   get:
 *     summary: Get a single traveler
 *     tags: [Travelers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Traveler details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Traveler'
 *       404:
 *         description: Traveler not found
 */
router.get('/:id', getTraveler)

/**
 * @openapi
 * /travelers:
 *   post:
 *     summary: Create a new traveler
 *     tags: [Travelers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Traveler created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Traveler'
 *       400:
 *         description: Validation error
 */
router.post('/', createTraveler)

/**
 * @openapi
 * /travelers/{id}:
 *   put:
 *     summary: Update a traveler
 *     tags: [Travelers]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Traveler updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Traveler'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Traveler not found
 */
router.put('/:id', updateTraveler)

/**
 * @openapi
 * /travelers/{id}:
 *   delete:
 *     summary: Delete a traveler
 *     tags: [Travelers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Traveler deleted successfully
 *       404:
 *         description: Traveler not found
 */
router.delete('/:id', deleteTraveler)

export default router
