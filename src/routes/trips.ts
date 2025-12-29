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

router.get('/', getTrips)
router.get('/my-trips', requireAuth, getMyTrips)
router.get('/:id', getTrip)
router.post('/', requireAuth, createTrip)
router.put('/:id', requireAuth, updateTrip)
router.delete('/:id', requireAuth, deleteTrip)
router.post('/:id/share/organization', requireAuth, shareWithOrganization)
router.post('/:id/share/user', requireAuth, shareWithUser)

export default router
