import * as ecopontoModel from "../models/popular.js";

export async function listarEcopontos(req, res) {
  const { bairro, residuo } = req.query;

  try {
    const linhas = await ecopontoModel.buscarTodos(bairro, residuo);

    const ecopontosFormatados = linhas.map(item => ({
      ...item,
      tipos_residuos: typeof item.tipos_residuos === "string"
        ? JSON.parse(item.tipos_residuos)
        : item.tipos_residuos
    }));

    return res.json({
      municipio: "Mogi das Cruzes",
      total: ecopontosFormatados.length,
      ecopontos: ecopontosFormatados
    });
  } catch (error) {
    console.error("Erro ao consultar ecopontos:", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao consultar ecopontos." });
  }
}

export async function cadastrarEcoponto(req, res) {
  const { nome, bairro, endereco, horario } = req.body;

  if (!nome || !bairro || !endereco || !horario) {
    return res.status(400).json({ erro: "Campos obrigatórios: nome, bairro, endereco, horario." });
  }

  try {
    const novoId = await ecopontoModel.criar(req.body);

    return res.status(201).json({
      mensagem: "Ecoponto cadastrado com sucesso!",
      id: novoId
    });
  } catch (error) {
    console.error("Erro ao cadastrar ecoponto:", error);
    return res.status(500).json({ erro: "Erro ao salvar no banco de dados." });
  }
}