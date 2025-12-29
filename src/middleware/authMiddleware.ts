import { Context, Next } from 'koa'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserModel from '../models/userModel'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const SALT_ROUNDS = 10

export interface AuthUser {
  id: number
  email: string
  organization_id: number
}

export interface AuthContext extends Context {
  user?: AuthUser
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      organization_id: user.organization_id,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function requireAuth(ctx: AuthContext, next: Next) {
  const authHeader = ctx.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401
    ctx.body = { error: 'Authentication required' }
    return
  }

  const token = authHeader.substring(7)
  const user = verifyToken(token)

  if (!user) {
    ctx.status = 401
    ctx.body = { error: 'Invalid or expired token' }
    return
  }

  const dbUser = await UserModel.findById(user.id)
  if (!dbUser) {
    ctx.status = 401
    ctx.body = { error: 'User not found' }
    return
  }

  ctx.user = user
  await next()
}

export async function register(ctx: Context) {
  const { userRegisterSchema } = await import('../schemas/user')
  const OrganizationModel = (await import('../models/organizationModel')).default

  const validation = userRegisterSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  const { email, password, name, organization_name } = validation.data

  const existingUser = await UserModel.findByEmail(email)
  if (existingUser) {
    ctx.status = 400
    ctx.body = { error: 'User with this email already exists' }
    return
  }

  let organization = await OrganizationModel.findByName(organization_name)
  if (!organization) {
    organization = await OrganizationModel.create({ name: organization_name })
  }

  const hashedPassword = await hashPassword(password)

  const user = await UserModel.create({
    email,
    password: hashedPassword,
    name,
    organization_id: organization.id,
  })

  const token = generateToken({
    id: user.id,
    email: user.email,
    organization_id: user.organization_id,
  })

  ctx.status = 201
  ctx.body = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organization_id: user.organization_id,
    },
    organization: {
      id: organization.id,
      name: organization.name,
    },
    token,
  }
}

export async function login(ctx: Context) {
  const { userLoginSchema } = await import('../schemas/user')

  const validation = userLoginSchema.safeParse(ctx.request.body)

  if (!validation.success) {
    ctx.status = 400
    ctx.body = { error: 'Validation failed', details: validation.error.flatten().fieldErrors }
    return
  }

  const { email, password } = validation.data

  const user = await UserModel.findByEmail(email)
  if (!user) {
    ctx.status = 401
    ctx.body = { error: 'Invalid email or password' }
    return
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    ctx.status = 401
    ctx.body = { error: 'Invalid email or password' }
    return
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    organization_id: user.organization_id,
  })

  ctx.body = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organization_id: user.organization_id,
    },
    token,
  }
}
