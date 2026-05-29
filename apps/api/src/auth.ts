import type { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { execute, query } from './db.js';

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  role: string;
};

export type AuthUser = {
  id: number;
  username: string;
  role: string;
};

export async function bootstrapAdminIfNeeded() {
  const rows = await query<{ count: number }>('SELECT COUNT(*) AS count FROM users');
  if (rows[0]?.count > 0) return;
  const hash = await bcrypt.hash(config.adminPassword, 10);
  await execute(
    'INSERT INTO users (username, password_hash, role) VALUES (:username, :passwordHash, :role)',
    { username: config.adminUsername, passwordHash: hash, role: 'admin' }
  );
}

export async function verifyLogin(username: string, password: string) {
  await bootstrapAdminIfNeeded();
  const rows = await query<UserRow>('SELECT * FROM users WHERE username = :username LIMIT 1', { username });
  const user = rows[0];
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, username: user.username, role: user.role };
}

export function signUser(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: '7d' });
}

export function readUser(request: FastifyRequest) {
  const token = request.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, config.jwtSecret) as AuthUser;
  } catch {
    return null;
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = readUser(request);
  if (!user || user.role !== 'admin') {
    return reply.code(401).send({ message: '未登录或无权限' });
  }
}
