/**
 * fileHandler.js
 * Centraliza todas as operações de leitura e escrita de arquivos (JSON, CSV, etc)
 */

const fs = require('fs');
const path = require('path');

/**
 * Garante que o diretório existe (cria recursivamente se necessário)
 * @param {string} dirPath - Caminho do diretório
 */
function criarPastaSeNaoExistir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Salva um arquivo JSON formatado em /src/outputs/data
 * @param {string} nomeArquivo - nome sem extensão
 * @param {object|array} dados - conteúdo a salvar
 */
function salvarJson(nomeArquivo, dados) {
  const pastaSaida = path.join(__dirname, '../outputs/data');
  criarPastaSeNaoExistir(pastaSaida);

  const caminhoArquivo = path.join(pastaSaida, `${nomeArquivo}.json`);
  fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2), 'utf-8');
  console.log(`💾 JSON salvo: ${caminhoArquivo}`);
}

/**
 * Lê um arquivo JSON da pasta /src/outputs/data
 * @param {string} nomeArquivo - nome sem extensão
 * @returns {object|array|null}
 */
function lerJson(nomeArquivo) {
  const caminhoArquivo = path.join(__dirname, '../outputs/data', `${nomeArquivo}.json`);
  if (!fs.existsSync(caminhoArquivo)) {
    console.warn(`⚠️ Arquivo JSON não encontrado: ${caminhoArquivo}`);
    return null;
  }
  const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
  return JSON.parse(conteudo);
}

/**
 * Salva um arquivo CSV em /src/outputs/
 * @param {string} nomeArquivo - nome sem extensão
 * @param {string[]} linhas - array de linhas CSV (ex: ["col1,col2", "\"valor1\",\"valor2\""])
 */
function salvarCsv(nomeArquivo, linhas) {
  const pastaSaida = path.join(__dirname, '../outputs');
  criarPastaSeNaoExistir(pastaSaida);

  const caminhoArquivo = path.join(pastaSaida, `${nomeArquivo}.csv`);
  fs.writeFileSync(caminhoArquivo, linhas.join('\n'), 'utf-8');
  console.log(`📄 CSV salvo: ${caminhoArquivo}`);
}

/**
 * Lê um arquivo CSV simples (sem aspas complexas)
 * Retorna um array de objetos com base no cabeçalho
 * @param {string} nomeArquivo - nome sem extensão
 * @returns {Array<object>}
 */
function lerCsv(nomeArquivo) {
  const caminhoArquivo = path.join(__dirname, '../outputs', `${nomeArquivo}.csv`);
  if (!fs.existsSync(caminhoArquivo)) {
    console.warn(`⚠️ CSV não encontrado: ${caminhoArquivo}`);
    return [];
  }

  const linhas = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');
  const cabecalho = linhas.shift().split(',');
  return linhas.map(linha => {
    const valores = linha.split(',');
    return cabecalho.reduce((obj, key, i) => {
      obj[key.trim()] = valores[i]?.replace(/^"|"$/g, '').trim() || '';
      return obj;
    }, {});
  });
}

module.exports = {
  salvarJson,
  lerJson,
  salvarCsv,
  lerCsv,
  criarPastaSeNaoExistir
};
