import { Request, Response, NextFunction } from 'express';

import { JwtService, JwtPayload } from '@/infrastructure/auth/jwtService';
import cacheService from '@/infrastructure/caching/redisClient';

import { HTTP_STATUS } from '@/utils/httpCodes';

interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = JwtService.verifyToken(token);

  if (!decoded) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
  }

  if (decoded.jti) {
    const isBlacklisted = await cacheService.get(`blacklist:${decoded.jti}`);
    if (isBlacklisted) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Token revoked' });
    }
  }

  if (decoded.sid) {
    const activeTokens = await cacheService.get<string[]>(`refresh_tokens:${decoded.id}`) || [];
    if (!activeTokens.includes(decoded.sid)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Session expired' });
    }
  }

  req.user = decoded;
  next();
};
