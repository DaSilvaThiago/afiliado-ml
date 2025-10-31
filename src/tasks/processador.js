/**
 * processador.js
 * Lê o JSON de produtos, baixa as imagens e gera um CSV com mensagens personalizadas.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { salvarJson } = require('../utils/fileHandler');

// Caminhos importantes
const jsonPath = path.join(__dirname, '../outputs/data/produtos_ofertas.json');
const pastaImagens = path.join(__dirname, '../outputs/images');
const saidaCsv = path.join(__dirname, '../outputs/mensagens.csv');

// Cria pasta de imagens se não existir
if (!fs.existsSync(pastaImagens)) {
  fs.mkdirSync(pastaImagens, { recursive: true });
}

// Lê produtos do JSON
const produtos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`🔎 Total de produtos carregados: ${produtos.length}`);

// Utilitário: normaliza nomes de arquivo
const limparNome = (texto) => {
  return texto
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
};

// Função: baixa imagem e salva localmente
const baixarImagem = async (url, nomeArquivo) => {
  const caminhoCompleto = path.join(pastaImagens, nomeArquivo);

  if (fs.existsSync(caminhoCompleto)) {
    console.log(`✔️ Imagem já existe: ${nomeArquivo}`);
    return caminhoCompleto;
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(caminhoCompleto, response.data);
    console.log(`⬇️ Imagem baixada: ${nomeArquivo}`);
    return caminhoCompleto;
  } catch (err) {
    console.error(`❌ Erro ao baixar imagem (${url}): ${err.message}`);
    return null;
  }
};

// Função: gera a mensagem para cada produto
const montarMensagem = (item) => {
  let mensagem = `🔥 ${item.destaque || 'OFERTA'}!\n`;
  mensagem += `📦 ${item.produto}\n\n`;

  if (item.preco_de) mensagem += `💰 De: ${item.preco_de}\n`;
  if (item.preco_por) mensagem += `🔻 Por: ${item.preco_por}\n`;
  if (item.desconto) mensagem += `💸 ${item.desconto}\n`;
  if (item.parcelamento) mensagem += `💳 ${item.parcelamento}\n`;
  if (item.frete) mensagem += `📦 ${item.frete}\n`;

  mensagem += `\n👉 ${item.link_afiliado}`;
  return mensagem;
};

// Execução principal
(async () => {
  const linhasCsv = ['mensagem,imagem'];

  for (const item of produtos) {
    // Ignora produtos com links inválidos
    if (
      !item.link_afiliado ||
      item.link_afiliado.includes('⚠️ Este URL não é permitido')
    ) {
      console.log(`⏭️ Produto ignorado (link inválido): ${item.produto}`);
      continue;
    }

    const nomeImagem = limparNome(item.produto) + '.png';
    const caminhoLocal = await baixarImagem(item.imagem_url, nomeImagem);

    if (caminhoLocal) {
      const mensagem = montarMensagem(item);
      linhasCsv.push(`"${mensagem.replace(/"/g, '""')}","${caminhoLocal}"`);
    }
  }

  const { salvarCsv } = require('../utils/fileHandler');
salvarCsv('mensagens', linhasCsv);
  console.log(`✅ CSV gerado com sucesso: ${salvarCsv}`);
})();
