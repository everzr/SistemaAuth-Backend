import express from "express";
import { getProof } from "../controllers/proofController.js";

const router = express.Router();
router.get("/prueba", getProof); //http://localhost:4000/api/proof/prueba  para probar la conexión

export default router;
