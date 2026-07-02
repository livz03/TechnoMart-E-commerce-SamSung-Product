import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  sqlUser?: {
    id: number;
    uid: string;
    email: string;
    createdAt: Date | null;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Fast-sync and cache the corresponding PostgreSQL user profile
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';

    let [sqlUser] = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (!sqlUser) {
      // Register new user on first-touch
      const [newSqlUser] = await db
        .insert(users)
        .values({ uid, email })
        .returning();
      req.sqlUser = newSqlUser;
    } else {
      req.sqlUser = sqlUser;
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

