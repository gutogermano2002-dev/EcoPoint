import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "ecopoint",
  port: Number(process.env.DB_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false // Exigido para conexões seguras no Aiven
  },
  waitForConnections: true,
  connectionLimit: 10
});

export async function criarTabelaSeNaoExistir() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ecopontos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      bairro VARCHAR(100) NOT NULL,
      endereco TEXT NOT NULL,
      cidade VARCHAR(100) NOT NULL DEFAULT 'Mogi das Cruzes',
      latitude DECIMAL(10, 8) NULL,
      longitude DECIMAL(11, 8) NULL,
      tipos_residuos JSON NOT NULL,
      horario VARCHAR(150) NOT NULL,
      url_mapa TEXT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
  console.log("Tabela 'ecopontos' verificada/criada no MySQL do Aiven.");
}

export default pool;