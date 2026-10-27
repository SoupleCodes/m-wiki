import { Context } from 'hono';
import { verify } from 'hono/jwt';

interface JwtPayload {
  user_id: number;
  role: string;
  exp: number;
}

export async function verifyToken(c: Context): Promise<JwtPayload | null> {
    const header = c.req.header('Authorization')
    const jwt = c.env.JWT_SECRET
    const authHeader = header
    if (!authHeader) {
      return null
    }

    const [bearer, token] = authHeader.split(' ')
    if (bearer !== 'Bearer' || !token) {
      return null;
    }

    try {
      const decoded = await verify(token, jwt, 'HS256')

      const { result } = await c.env.DB.prepare(`
          SELECT token_revoked_at FROM users
          WHERE id = ?
      `).bind(decoded.user_id).first()

      if (result && decoded.exp >= result.id) {
        return null;
      }

      return decoded as unknown as JwtPayload
    } catch (error) {
      console.log(error)
      return null
    }
}