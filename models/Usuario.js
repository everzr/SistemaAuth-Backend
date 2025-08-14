import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Usuario = sequelize.define("Usuario", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  face_descriptor: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, //De momento estará true para que se pueda registrar rostro, despues hay que cambiar la logica para registrar rostro
  },
},
{tableName: "usuario" ,
  timestamps: false,
});

export default Usuario;
