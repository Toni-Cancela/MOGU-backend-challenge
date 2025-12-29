import { z } from 'zod'

export const tripSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1).max(255),
  destination: z.string().min(1).max(255),
  start_date: z.string().date(),
  end_date: z.string().date(),
  // owner_id references organizations table instead of users.
  // This allows all users within an organization to manage trips created by any member.
  // In the future, different privilege levels could be added for finer access control.
  owner_id: z.number().int(),
  is_public: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
})

export const tripCreateSchema = tripSchema.omit({ id: true, created_at: true, owner_id: true })

export const tripUpdateSchema = tripCreateSchema.partial()

export type Trip = z.infer<typeof tripSchema>
export type TripCreate = z.infer<typeof tripCreateSchema>
export type TripUpdate = z.infer<typeof tripUpdateSchema>
