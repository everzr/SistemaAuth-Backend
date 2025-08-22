// backend/routes/secret.js
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const provided = (req.body?.pin ?? req.body?.key ?? "").toString();
    if (!provided) return res.status(400).json({ error: "PIN requerido" });

    if (provided !== (process.env.SECRET_PIN || process.env.SECRET_KEY)) {
      return res.status(401).json({ error: "PIN inválido" });
    }

    const token = jwt.sign({ secret: true }, process.env.JWT_SECRET, {
      expiresIn: process.env.SECRET_TOKEN_TTL || "15m",
    });

    res.cookie("secret_unlock", token, {
      httpOnly: true,
      secure: false, // true si usas HTTPS
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error interno" });
  }
});

export default router;
