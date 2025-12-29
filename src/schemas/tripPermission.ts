import { z } from 'zod'

export const PermissionLevel = {
  Read: 'read',
  Write: 'write',
} as const

export const permissionLevelSchema = z.enum(['read', 'write'])

export const tripPermissionSchema = z.object({
  id: z.number().int(),
  trip_id: z.number().int(),
  user_id: z.number().int().nullable(),
  organization_id: z.number().int().nullable(),
  permission: permissionLevelSchema,
  created_at: z.string().datetime().optional(),
})

export const shareWithOrganizationSchema = z.object({
  permission: permissionLevelSchema,
})

export const shareWithUserSchema = z.object({
  user_id: z.number().int(),
  permission: permissionLevelSchema,
})

export type TripPermission = z.infer<typeof tripPermissionSchema>
export type ShareWithOrganization = z.infer<typeof shareWithOrganizationSchema>
export type ShareWithUser = z.infer<typeof shareWithUserSchema>
