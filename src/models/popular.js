import pool from "../config/db.js";
import { ecopontosIniciais } from "../data/lista.js";

export async function buscarTodos(bairro, residuo) {
  let sql = "SELECT * FROM ecopontos WHERE 1=1";
  const params = [];

  if (bairro) {
    sql += " AND LOWER(bairro) LIKE ?";
    params.push(`%${bairro.toLowerCase()}%`);
  }

  if (residuo) {
    sql += " AND JSON_CONTAINS(tipos_residuos, ?)";
    params.push(JSON.stringify(residuo.toLowerCase()));
  }

  const [linhas] = await pool.query(sql, params);
  return linhas;
}

export async function criar(dados) {
  const { nome, bairro, endereco, cidade, latitude, longitude, tiposResiduos, horario, urlMapa } = dados;

  const sql = `
    INSERT INTO ecopontos 
    (nome, bairro, endereco, cidade, latitude, longitude, tipos_residuos, horario, url_mapa) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    nome,
    bairro,
    endereco,
    cidade || "Mogi das Cruzes",
    latitude || null,
    longitude || null,
    JSON.stringify(tiposResiduos || []),
    horario,
    urlMapa || null
  ];

  const [resultado] = await pool.query(sql, valores);
  return resultado.insertId;
}

export async function popularDadosIniciais() {
  try {
    const [linhas] = await pool.query("SELECT COUNT(*) AS total FROM ecopontos");

    if (linhas[0].total === 0) {
      console.log("Banco de dados vazio. Populando com os ecopontos iniciais...");
      for (const item of ecopontosIniciais) {
        await criar(item);
      }
      console.log("Carga inicial concluída com sucesso no MySQL!");
    }
  } catch (error) {
    console.error("Erro ao verificar/popular dados iniciais:", error.message);
  }
}