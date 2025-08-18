import express from "express";
import {
  registrarRostro,
  obtenerDescriptores,
  loginRostro,
  loginNormal,
} from "../controllers/loginController.js";
import verificarAutenticacion from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register-face", verificarAutenticacion, registrarRostro);
router.get("/descriptors", verificarAutenticacion, obtenerDescriptores);
router.post("/login-face", loginRostro); 
router.post("/login-normal", loginNormal)

export default router;
