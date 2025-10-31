/**
 * getProducts.js
 * Script responsável por extrair ofertas do Mercado Livre
 * e salvar em um arquivo JSON localizado em /src/outputs/data
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { salvarJson } = require('../utils/fileHandler');

async function extrairProdutosDasPaginas(paginas = 20) {
  const todosProdutos = [];

  for (let pagina = 1; pagina <= paginas; pagina++) {
    const url = `https://www.mercadolivre.com.br/ofertas?page=${pagina}`;
    console.log(`🔎 Coletando página ${pagina}...`);

    try {
      const { data: html } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const $ = cheerio.load(html);
      const produtos = $('.andes-card');

      produtos.each((_, el) => {
        const nome = $(el).find('a.poly-component__title').text().trim();
        const link = $(el).find('a.poly-component__title').attr('href');

        if (!nome || !link) return;

        const imgTag = $(el).find('img');
        const imagem =
          imgTag.attr('data-src') ||
          imgTag.attr('data-original') ||
          imgTag.attr('src') || '';

        const produto = {
          produto: nome,
          link,
          imagem_url: imagem,
          preco_de: $(el).find('.andes-money-amount--previous').text().trim(),
          preco_por: $(el).find('.poly-price__current .andes-money-amount').text().trim(),
          desconto: $(el).find('.andes-money-amount__discount').text().trim(),
          parcelamento: $(el).find('.poly-price__installments').text().trim(),
          frete: $(el).find('.poly-component__shipping').text().trim(),
          destaque: $(el).find('.poly-component__highlight').text().trim() || null,
          vendedor: $(el).find('.poly-component__seller').text().replace(/^Por\s+/i, '').trim(),
          cupom: $(el).find('.poly-component__coupons .poly-coupons__pill').text().trim() || null
        };

        todosProdutos.push(produto);
      });

    } catch (erro) {
      console.error(`❌ Erro na página ${pagina}: ${erro.message}`);
    }
  }

  salvarJson('produtos_ofertas', todosProdutos);
  console.log(`✅ Coleta finalizada. ${todosProdutos.length} produtos salvos.`);
}

// Executa se rodado diretamente via npm run ou node
if (require.main === module) {
  extrairProdutosDasPaginas();
}

module.exports = { extrairProdutosDasPaginas };
