import { Request, Response, NextFunction } from "express";

// 404 handler — mount after all routes.
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

// Central error handler — mount last. Never leaks stack traces in production.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
  });
}
