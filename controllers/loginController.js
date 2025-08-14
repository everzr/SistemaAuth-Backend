import Usuario from "../models/Usuario.js";
import { conectarDB } from "../config/database.js";
import jwt from "jsonwebtoken";
import { signUserJwt } from "../utils/jwt.js";

import { euclideanDistance } from "../utils/euclideanDistance.js"; // Lo crearemos abajo

export const registrarRostro = async (req, res) => {
  const { nombre, email, descriptor } = req.body;

  if (!nombre || !email || !descriptor) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    await conectarDB();

    /*console.log({
  nombre,
  email,
  descriptorType: typeof descriptor,
  descriptorLength: descriptor.length,
  descriptorPreview: descriptor.slice(0, 5),
});*/
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      face_descriptor:  JSON.stringify(descriptor),
    });

    res.status(201).json({ message: "Rostro registrado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el rostro" });
  }
};

export const obtenerDescriptores = async (req, res) => {
  try {
    await conectarDB();

    const usuarios = await Usuario.findAll({
      attributes: ["id", "nombre", "email", "face_descriptor"],
    });

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los descriptores" });
  }
};


export const loginRostro = async (req, res) => {
  const { descriptor } = req.body;

  if (!descriptor || !Array.isArray(descriptor)) {
    return res.status(400).json({ message: "Descriptor inválido o ausente" });
  }

  try {
    await conectarDB();

    const usuarios = await Usuario.findAll({
      attributes: ["id", "nombre", "email", "face_descriptor"],
    });

    let usuarioReconocido = null;
    let distanciaMinima = Infinity;

    usuarios.forEach((usuario) => {
      // Parseamos el descriptor guardado como string
      let dbDescriptor;
      try {
        dbDescriptor = JSON.parse(usuario.face_descriptor);
      } catch (e) {
        console.warn(`Descriptor JSON inválido para usuario ID ${usuario.id}`);
        return; // saltar a siguiente usuario
      }

      // Validamos longitud para evitar errores
      if (!Array.isArray(dbDescriptor) || dbDescriptor.length !== descriptor.length) {
        return;
      }

      const distancia = euclideanDistance(descriptor, dbDescriptor);

      if (distancia < 0.6 && distancia < distanciaMinima) {
        distanciaMinima = distancia;
        usuarioReconocido = usuario;
      }
    });

    if (usuarioReconocido) {
      console.log(`Usuario reconocido: ${usuarioReconocido.nombre} (ID: ${usuarioReconocido.id})`);

      /*
      const token = jwt.sign(
      { id_usuario: usuarioReconocido.id },
      process.env.JWT_SECRET,
      { expiresIn: "1m" }
      );
      */
     // ✅ Generar JWT usando tu util
      const token = signUserJwt(usuarioReconocido);

      // ✅ Guardar token en cookie httpOnly
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1 * 60 * 1000, // 1 minuto
      });

      return res.status(200).json({
        success: true,
        message: "Usuario reconocido",
        usuario: {
          id: usuarioReconocido.id,
          nombre: usuarioReconocido.nombre,
          email: usuarioReconocido.email,
        },
        distancia: distanciaMinima,
        token,
      });
    } else {
      console.log("Ningún usuario reconocido");
      return res.status(401).json({ message: "Usuario no reconocido" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en login facial" });
  }
};

export const loginNormal = async (req, res) => {
   const { email, password } = req.body;

   console.log("Datos de login normal:", { email, password });
   try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    /*const esPasswordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!esPasswordCorrecta) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }
      */
     //Para probar contraseña sin escriptar
     if(password !== usuario.password){
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "1m" } // o el tiempo que prefieras
    );

    // Guardar token en cookie httpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 60 * 1000, // 5 min
    });

    return res.status(200).json({
        success: true,
        message: "Usuario encontrado",
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
        },
        token,
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }

}