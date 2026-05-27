import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { signToken } from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';

export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw ApiError.badRequest('Email already in use');
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = signToken({ sub: user.id, email: user.email, name: user.name });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ sub: user.id, email: user.email, name: user.name });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}
