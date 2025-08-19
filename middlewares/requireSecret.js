// backend/middlewares/requireSecret.js
import jwt from "jsonwebtoken";

export function requireSecret(req, res, next) {
  try {
    const token = req.cookies?.secret_unlock;
    if (!token) return res.status(401).json({ error: "No autorizado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.secret)
      return res.status(401).json({ error: "No autorizado" });

    next();
  } catch {
    return res.status(401).json({ error: "Token inválido/expirado" });
  }
}
