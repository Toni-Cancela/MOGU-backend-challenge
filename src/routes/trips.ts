import Router from '@koa/router'
import {
  getTrips,
  getTrip,
  getMyTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  shareWithOrganization,
  shareWithUser,
} from '../middleware/tripsMiddleware'
import { requireAuth } from '../middleware/authMiddleware'

const router = new Router({ prefix: '/trips' })

/**
 * @openapi
 * /trips:
 *   get:
 *     summary: Get all public trips
 *     description: Returns all trips that are marked as public (for travelers to browse)
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter trips by destination
 *     responses:
 *       200:
 *         description: List of public trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 */
router.get('/', getTrips)

/**
 * @openapi
 * /trips/my-trips:
 *   get:
 *     summary: Get all accessible trips for authenticated user
 *     description: Returns trips owned by user or shared with user/organization
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter trips by destination
 *     responses:
 *       200:
 *         description: List of accessible trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-trips', requireAuth, getMyTrips)

/**
 * @openapi
 * /trips/{id}:
 *   get:
 *     summary: Get a single public trip
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found or not public
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getTrip)

/**
 * @openapi
 * /trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - destination
 *               - start_date
 *               - end_date
 *             properties:
 *               title:
 *                 type: string
 *               destination:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               is_public:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAuth, createTrip)

/**
 * @openapi
 * /trips/{id}:
 *   put:
 *     summary: Update a trip
 *     description: Only owner or users with write permission can update
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               destination:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               is_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       403:
 *         description: No permission to update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', requireAuth, updateTrip)

/**
 * @openapi
 * /trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     description: Only owner or users with write permission can delete
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trip ID
 *     responses:
 *       204:
 *         description: Trip deleted successfully
 *       403:
 *         description: No permission to delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', requireAuth, deleteTrip)

/**
 * @openapi
 * /trips/{id}/share/organization:
 *   post:
 *     summary: Share trip with organization
 *     description: Share trip with all users in owner's organization with specific permission level
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission
 *             properties:
 *               permission:
 *                 type: string
 *                 enum: [read, write]
 *     responses:
 *       200:
 *         description: Trip shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 permission:
 *                   $ref: '#/components/schemas/TripPermission'
 *       403:
 *         description: Only owner can share
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/share/organization', requireAuth, shareWithOrganization)

/**
 * @openapi
 * /trips/{id}/share/user:
 *   post:
 *     summary: Share trip with specific user
 *     description: Grant specific user access to trip with permission level
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - permission
 *             properties:
 *               user_id:
 *                 type: integer
 *               permission:
 *                 type: string
 *                 enum: [read, write]
 *     responses:
 *       200:
 *         description: Trip shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 permission:
 *                   $ref: '#/components/schemas/TripPermission'
 *       403:
 *         description: Only owner can share
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Trip or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/share/user', requireAuth, shareWithUser)

export default router
