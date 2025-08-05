import express from "express";
import {
  registrarRostro,
  obtenerDescriptores,
  loginRostro,
} from "../controllers/faceController.js";

const router = express.Router();

router.post("/register-face", registrarRostro);
router.get("/descriptors", obtenerDescriptores);
router.post("/login-face", loginRostro); // 👈 nueva ruta

export default router;
