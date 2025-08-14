// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const verificarAutenticacion = async (req, res, next) => {
 
    console.log("Cookies recibidas:", req.cookies);
console.log("Header Authorization:", req.headers.authorization);

    let token = null;

  // Primero busca en header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Si no hay en header, busca en cookies
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.name === "TokenExpiredError" ? "Token expirado" : "Token inválido" });
  }
};

export default verificarAutenticacion;
