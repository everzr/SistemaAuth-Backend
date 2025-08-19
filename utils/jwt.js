// utils/jwt.js
import jwt from "jsonwebtoken";
import "dotenv/config";

export function signUserJwt(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: "1m" }
  );
}

export function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) return res.status(401).json({ error: "No autorizado" });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
