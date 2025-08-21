// backend/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import jwt from "jsonwebtoken";

// Carga .env con ruta absoluta (ESM-safe)
import { config as dotenvConfig } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.join(__dirname, ".env") });

/* =========================
   App base
========================= */
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "clave_por_defecto"; // para /api/secret
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* =========================
   Middlewares base
========================= */
app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true, // necesario para cookies httpOnly
  })
);
app.use(express.json());
app.use(cookieParser());

/* =========================
   Passport (OAuth)
========================= */
import "./oauthStrategies.js"; // define Google/GitHub
app.use(passport.initialize());

/* =========================
   Utils / Middlewares
========================= */
import { requireAuth } from "./utils/jwt.js";
import requireSecret from "./middlewares/requireSecret.js";
import { normalize } from "./utils/normalize.js"; // 👈 necesario para login por voz

/* =========================
   Routers
========================= */
import proofRoutes from "./routes/proofRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import authRouter from "./routes/auth.js";
import secretRouter from "./routes/secret.js";
import registerRoutes from "./routes/registerRoutes.js"

/* =========================
   Salud
========================= */
app.get("/", (_req, res) => {
  res.send("Servidor funcionando");
});

/* =========================
   Rutas existentes
========================= */
app.use("/api/proof", proofRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/register", registerRoutes);

/* =========================
   OAuth
========================= */
app.use("/auth", authRouter);

/* =========================
   Endpoints protegidos
========================= */
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/* =========================
   Ruta secreta (Konami + PIN)
========================= */
app.use("/api/secret", requireSecret, secretRouter);

/* =========================
   🔊 Login por voz
   - Opción A: simple (sin JWT)
   - Opción B: con JWT (cookie httpOnly)
========================= */
app.post("/api/voice-login-simple", (req, res) => {
  const { phrase } = req.body || {};
  const ok = normalize(phrase) === normalize(process.env.SECRET_PHRASE || "");
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: "Frase incorrecta" });
  }
  return res.json({ success: true, message: "Acceso por voz concedido" });
});

app.post("/api/voice-login", (req, res) => {
  const { phrase } = req.body || {};
  const ok = normalize(phrase) === normalize(process.env.SECRET_PHRASE || "");
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: "Frase incorrecta" });
  }

  const token = jwt.sign(
    { sub: "voice-access" },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: process.env.SECRET_TOKEN_TTL || "15m" }
  );

  res.cookie("auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // ⚠️ en prod: true con HTTPS
    maxAge: 15 * 60 * 1000,
  });

  return res.json({ success: true, message: "Acceso por voz concedido" });
});

/* =========================
   Arranque
========================= */
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
  console.log(`Frontend permitido: ${FRONTEND_URL}`);
  console.log(`Secret Key: ${SECRET_KEY ? "cargada ✅" : "no definida ❌"}`);
});
