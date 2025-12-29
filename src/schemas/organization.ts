import { z } from 'zod'

export const organizationSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(255),
  created_at: z.string().datetime().optional(),
})

export const organizationCreateSchema = organizationSchema.omit({ id: true, created_at: true })

export const organizationUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
})

export type Organization = z.infer<typeof organizationSchema>
export type OrganizationCreate = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdate = z.infer<typeof organizationUpdateSchema>
