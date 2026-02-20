import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user) {
  return new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function authenticateUser(email, password, db) {
  const user = db.getUserByEmail(email);
  if (!user) return null;

  // For demo purposes, we'll use a simple password check
  // In production, you'd store hashed passwords
  if (password === 'password123') {
    return user;
  }
  
  return null;
}

export function getCurrentUser(token, db) {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return db.getUser(payload.userId) || null;
}
