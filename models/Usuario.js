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
},
{tableName: "usuarios" ,
  timestamps: false,
});

export default Usuario;
