import express from "express";
import cors from "cors"; // 1. Importa a biblioteca CORS
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { criarTabelaSeNaoExistir } from "./config/db.js";
import { popularDadosIniciais } from "./models/popular.js";
import ecopontoRoutes from "./routes/rotas.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Libera o CORS para permitir chamadas do Live Server (127.0.0.1:5500) ou Netlify
app.use(cors());

app.use(express.json());

// Serve a pasta 'public'
app.use(express.static(path.join(__dirname, "../public")));

// Rotas da API
app.use("/api/v1", ecopontoRoutes);

app.listen(PORT, async () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  await criarTabelaSeNaoExistir();
  await popularDadosIniciais();
});