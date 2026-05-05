import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.session as { userId?: number; userRole?: string };
  if (!session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const session = req.session as { userId?: number; userRole?: string };
  if (!session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (session.userRole !== "owner") {
    res.status(403).json({ error: "Forbidden: owner access required" });
    return;
  }
  next();
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  const session = req.session as { userId?: number; userRole?: string };
  if (!session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (session.userRole !== "tenant") {
    res.status(403).json({ error: "Forbidden: tenant access required" });
    return;
  }
  next();
}
