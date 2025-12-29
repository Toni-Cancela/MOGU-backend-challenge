import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(255).optional(),
  organization_id: z.number().int(),
  created_at: z.string().datetime().optional(),
})

export const userCreateSchema = userSchema.omit({ id: true, created_at: true })

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(255).optional(),
  organization_name: z.string().min(1).max(255),
})

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1).max(255).optional(),
  organization_id: z.number().int().optional(),
})

// User without password for responses
export const userResponseSchema = userSchema.omit({ password: true })

export type User = z.infer<typeof userSchema>
export type UserCreate = z.infer<typeof userCreateSchema>
export type UserRegister = z.infer<typeof userRegisterSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
