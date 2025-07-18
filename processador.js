const fs = require('fs');
const path = require('path');
const axios = require('axios');

const produtos = JSON.parse(fs.readFileSync('./produtos_ofertas.json', 'utf-8'));
const pastaImagens = './imagens';
const saidaCsv = './mensagens.csv';

if (!fs.existsSync(pastaImagens)) {
  fs.mkdirSync(pastaImagens);
}

const limparNome = (texto) => {
  return texto
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
};

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
    console.error(`❌ Erro ao baixar ${url}: ${err.message}`);
    return null;
  }
};

const montarMensagem = (item) => {
  return (
    `🔥 ${item.destaque || 'OFERTA'}!\n` +
    `📦 ${item.produto}\n\n` +
    `💰 De: ${item.preco_de}\n` +
    `🔻 Por: ${item.preco_por}\n` +
    `💸 ${item.desconto}\n` +
    `💳 ${item.parcelamento}\n` +
    `📦 ${item.frete}\n\n` +
    `👉 ${item.link_afiliado}`
  ).replace(/\n/g, ' ');
};

(async () => {
  const linhasCsv = ['mensagem,imagem'];

  for (const item of produtos) {
    const nomeImagem = limparNome(item.produto) + '.jpg';
    const caminhoLocal = await baixarImagem(item.imagem_url, nomeImagem);

    if (caminhoLocal) {
      const mensagem = montarMensagem(item);
      linhasCsv.push(`"${mensagem}","${caminhoLocal}"`);
    }
  }

  fs.writeFileSync(saidaCsv, linhasCsv.join('\n'), 'utf-8');
  console.log('✅ CSV gerado com sucesso: mensagens.csv');
})();
