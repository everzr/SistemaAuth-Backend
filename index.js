// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

//Referencias a las rutas
import proofRoutes from "./routes/proofRoutes.js";
import faceRoutes from "./routes/faceRoutes.js";

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.use("/api/proof" , proofRoutes)
app.use("/api/face", faceRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
  console.log(`${process.env.PORT ? `Puerto: ${process.env.PORT}` : 'Puerto no definido en .env'}`); // Verifica si PORT está definido
});
