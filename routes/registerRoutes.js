import express from "express";
import { registerUser,
        registrarRostro
 } from "../controllers/registerController.js";
import verificarAutenticacion from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register-face", verificarAutenticacion, registrarRostro);

export default router;
