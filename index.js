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

// --- Referencias a las rutas existentes (se mantienen) ---
import proofRoutes from "./routes/proofRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";

// --- Rutas OAuth (nuevas) ---
import authRouter from "./routes/auth.js";
app.use("/auth", authRouter);

// --- Salud (se mantiene) ---
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// --- Rutas existentes (se mantienen) ---
app.use("/api/proof", proofRoutes);
app.use("/api/login", loginRoutes);

// --- Endpoint protegido de ejemplo (nuevo) ---
import { requireAuth } from "./utils/jwt.js";
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// --- Arranque (se mantiene) ---
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
  console.log(
    `${
      process.env.PORT
        ? `Puerto: ${process.env.PORT}`
        : "Puerto no definido en .env"
    }`
  );
});
