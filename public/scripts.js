
/* ==========================================================================
   Ecopontos - Mogi das Cruzes
   ========================================================================== */
 
// >>> AJUSTE AQUI: URL da sua API (ou de um arquivo .json local, ex: "ecopontos.json")
const API_URL = "https://ecopoint-2.onrender.com/api/v1/mogi/ecopontos";;
 
// Elementos da página (o script usa "defer", então o HTML já existe)
const container     = document.getElementById("listaEcopontos");
const inputBairro   = document.getElementById("filtroBairro");
const selectResiduo = document.getElementById("filtroResiduo");
const btnBuscar     = document.getElementById("btnBuscar");
 
// Todos os ecopontos carregados da API
let todosEcopontos = [];
 
/* ---------- Utilitários ---------- */
 
// Remove acentos, converte para minúsculas e tira espaços das pontas
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
 
// Evita que dados da API sejam interpretados como HTML
const escapeHTML = (texto) =>
  String(texto ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
 
// Só aceita links http(s) para o mapa
const urlSegura = (url) => (/^https?:\/\//i.test(url || "") ? url : "");
 
// Suporta array, string JSON ou texto simples; aceita snake_case e camelCase
function obterResiduos(item) {
  const bruto = item.tipos_residuos ?? item.tiposResiduos ?? [];
 
  if (Array.isArray(bruto)) return bruto;
 
  if (typeof bruto === "string") {
    try {
      const convertido = JSON.parse(bruto);
      return Array.isArray(convertido) ? convertido : [bruto];
    } catch {
      return bruto.split(",").map((r) => r.trim()).filter(Boolean);
    }
  }
 
  return [];
}
 
// Atraso para não filtrar a cada tecla digitada
function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
 
function mostrarMensagem(texto) {
  container.innerHTML = `<p class="carregando">${escapeHTML(texto)}</p>`;
}
 
/* ---------- 1. Carregar dados ---------- */
 
async function inicializarEcopontos() {
  if (!container) {
    console.error('Elemento #listaEcopontos não encontrado no HTML.');
    return;
  }
 
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
 
    const dados = await resposta.json();
 
    // Aceita [ ... ] ou { dados: [ ... ] } / { data: [ ... ] } / { ecopontos: [ ... ] }
    todosEcopontos = Array.isArray(dados)
      ? dados
      : dados.dados ?? dados.data ?? dados.ecopontos ?? [];
 
    console.log(`${todosEcopontos.length} ecopontos carregados`, todosEcopontos[0]);
    filtrarEcopontos();
  } catch (erro) {
    console.error("Erro ao carregar ecopontos:", erro);
    mostrarMensagem("Não foi possível carregar os ecopontos. Tente novamente mais tarde.");
  }
}
 
/* ---------- 2. Filtrar ---------- */
 
function filtrarEcopontos() {
  const termoBairro  = normalizar(inputBairro?.value);
  const termoResiduo = normalizar(selectResiduo?.value);
 
  const resultados = todosEcopontos.filter((item) => {
    const bateTexto =
      !termoBairro ||
      normalizar(item.bairro).includes(termoBairro) ||
      normalizar(item.nome).includes(termoBairro) ||
      normalizar(item.endereco).includes(termoBairro);
 
    const bateResiduo =
      !termoResiduo ||
      obterResiduos(item).some((r) => normalizar(r).includes(termoResiduo));
 
    return bateTexto && bateResiduo;
  });
 
  renderizarCards(resultados);
}
 
/* ---------- 3. Desenhar cards ---------- */
 
function criarCard(item) {
  const residuos = obterResiduos(item);
  const urlMapa  = urlSegura(item.url_mapa ?? item.urlMapa);
 
  const tags = residuos
    .map((r) => `<span class="tag">${escapeHTML(r)}</span>`)
    .join("");
 
  const link = urlMapa
    ? `<a href="${escapeHTML(urlMapa)}" target="_blank" rel="noopener noreferrer" class="link-mapa">Ver no Google Maps ➔</a>`
    : "";
 
  return `
    <article class="card">
      <div>
        <h3>${escapeHTML(item.nome || "Ecoponto")}</h3>
        <p><strong>Bairro:</strong> ${escapeHTML(item.bairro || "N/A")}</p>
        <p><strong>Endereço:</strong> ${escapeHTML(item.endereco || "N/A")}</p>
        <p><strong>Horário:</strong> ${escapeHTML(item.horario || "N/A")}</p>
        <div class="tags">${tags}</div>
      </div>
      ${link}
    </article>
  `;
}
 
function renderizarCards(lista) {
  if (!lista.length) {
    mostrarMensagem("Nenhum ecoponto encontrado para essa busca.");
    return;
  }
 
  container.innerHTML = lista.map(criarCard).join("");
}
 
/* ---------- Eventos ---------- */
 
inputBairro?.addEventListener("input", debounce(filtrarEcopontos));
selectResiduo?.addEventListener("change", filtrarEcopontos);
btnBuscar?.addEventListener("click", filtrarEcopontos);
 
// Permite buscar apertando Enter no campo de texto
inputBairro?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") filtrarEcopontos();
});
 
/* ---------- Início ---------- */
 
inicializarEcopontos();