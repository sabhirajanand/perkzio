import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('X-Request-Id');
  const id = header && header.length > 0 ? header : randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}
