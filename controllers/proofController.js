import { conectarDB } from "../config/database.js";

export const getProof = async (req, res) => {
  await conectarDB();
  res.send("Hola desde controller y rutas de prueba");
};
