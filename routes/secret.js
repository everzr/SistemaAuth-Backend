import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/verify", async (req, res) => {
  try {
    const { pin } = req.body || {};
    if (!pin) return res.status(400).json({ error: "PIN requerido" });

    // DEMO: comparación simple (en prod usa bcrypt con SECRET_PIN_HASH)
    if (pin !== process.env.SECRET_PIN) {
      return res.status(401).json({ error: "PIN inválido" });
    }

    const token = jwt.sign(
      { secret: true }, // claim
      process.env.JWT_SECRET,
      { expiresIn: process.env.SECRET_TOKEN_TTL || "15m" }
    );

    res.cookie("secret_unlock", token, {
      httpOnly: true,
      secure: false, // true si usas HTTPS
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Error interno" });
  }
});

export default router;
