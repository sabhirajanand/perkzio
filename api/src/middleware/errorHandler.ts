import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/codes.js';
import type { Logger } from '../config/logger.js';

export function errorHandler(logger: Logger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = req.requestId ?? 'unknown';

    if (err instanceof AppError) {
      res.status(err.status).json({
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      });
      return;
    }

    logger.error({ err, requestId }, 'unhandled_error');
    res.status(500).json({
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Internal server error',
      requestId,
    });
  };
}
