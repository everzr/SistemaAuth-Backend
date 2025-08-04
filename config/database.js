import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

export const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a bd");

    await sequelize.sync();
    // await sequelize.sync({ force: true });
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:", error.message);
    process.exit(1);
  }
};

export default sequelize;
