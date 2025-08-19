// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

// Carga .env con ruta absoluta (ESM-safe)
import { config as dotenvConfig } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "clave_por_defecto"; // 👈 Llave secreta

// --- Middlewares base ---
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true, // importante para cookies httpOnly
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Passport (estrategias OAuth) ---
import "./oauthStrategies.js"; // define Google/GitHub
app.use(passport.initialize());

// --- Rutas: imports ---
import proofRoutes from "./routes/proofRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import faceRoutes from "./routes/faceRoutes.js";

// OAuth router
import authRouter from "./routes/auth.js";

// JWT guard para /api/me
import { requireAuth } from "./utils/jwt.js";

// Ruta secreta como router + middleware (según tus archivos nuevos)
import requireSecret from "./middlewares/requireSecret.js";
import secretRouter from "./routes/secret.js";

// --- Salud ---
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// --- Rutas existentes ---
app.use("/api/proof", proofRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/face", faceRoutes);

// --- Rutas OAuth ---
app.use("/auth", authRouter);

// --- Endpoint protegido de ejemplo ---
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// --- 🔒 Ruta secreta protegida ---
app.use("/api/secret", requireSecret, secretRouter);

// --- Arranque ---
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
  console.log(
    `${
      process.env.PORT
        ? `Puerto: ${process.env.PORT}`
        : "Puerto no definido en .env"
    }`
  );
  console.log(`Secret Key: ${SECRET_KEY ? "cargada ✅" : "no definida ❌"}`);
});
