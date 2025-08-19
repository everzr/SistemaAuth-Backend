import Usuario from "../models/Usuario.js";
import { conectarDB } from "../config/database.js";
import bcrypt from "bcrypt"; // <- importar bcrypt

export const registerUser = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Validación correo y contraseña
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Correo no válido" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Contraseña debe tener mínimo 8 caracteres y un carácter especial" });
  }

  try {
    await conectarDB();

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // 🔒 Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Guardar usuario con contraseña hasheada
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
      },
    });
  } catch (error) {
    console.error("Error en registerUser:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
};

export const registrarRostro = async (req, res) => {
  const { id, nombre, email, descriptor } = req.body;

  // Validaciones básicas
  if (!id || !nombre || !email || !descriptor) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  if (!Array.isArray(descriptor) || descriptor.length === 0) {
    return res.status(400).json({ message: "Descriptor inválido o vacío" });
  }

  try {
    await conectarDB();

    // Buscar el usuario por ID
    const usuario = await Usuario.findOne({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

      // Validar si ya tiene un descriptor
    if (usuario.face_descriptor) {
      return res.status(400).json({ message: "El rostro ya fue asociado previamente" });
    }

    // Actualizar usuario con el descriptor
    await usuario.update({
      face_descriptor: JSON.stringify(descriptor),
    });

    res.status(200).json({
      message: "Rostro asociado correctamente al usuario",
      usuario,
    });
  } catch (error) {
    console.error("Error al registrar rostro:", error);
    res.status(500).json({ message: "Error al asociar el rostro" });
  }
};

