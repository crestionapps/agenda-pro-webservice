import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface JwtPayload { userId: string; email: string; role: string; tenantId?: string | null; }

export function signToken(p: JwtPayload): string {
  return jwt.sign(p, SECRET, { expiresIn: '7d' });
}
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
