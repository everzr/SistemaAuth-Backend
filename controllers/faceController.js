import Usuario from "../models/Usuario.js";
import { conectarDB } from "../config/database.js";

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
      return res.status(200).json({
        message: "Usuario reconocido",
        usuario: {
          id: usuarioReconocido.id,
          nombre: usuarioReconocido.nombre,
          email: usuarioReconocido.email,
        },
        distancia: distanciaMinima,
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