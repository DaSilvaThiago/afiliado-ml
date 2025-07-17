const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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
        const produto = {};

        const nome = $(el).find('a.poly-component__title').text().trim();
        const link = $(el).find('a.poly-component__title').attr('href');

        const imgTag = $(el).find('img');
        const imagem =
          imgTag.attr('data-src') ||
          imgTag.attr('data-original') ||
          imgTag.attr('src') || '';

        const precoAntigo = $(el).find('.andes-money-amount--previous').text().trim();
        const precoAtual = $(el).find('.poly-price__current .andes-money-amount').text().trim();
        const desconto = $(el).find('.andes-money-amount__discount').text().trim();
        const parcelamento = $(el).find('.poly-price__installments').text().trim();
        const frete = $(el).find('.poly-component__shipping').text().trim();
        const destaque = $(el).find('.poly-component__highlight').text().trim();

        if (nome && link) {
          produto.produto = nome;
          produto.link = link;
          produto.imagem_url = imagem;
          produto.preco_de = precoAntigo;
          produto.preco_por = precoAtual;
          produto.desconto = desconto;
          produto.parcelamento = parcelamento;
          produto.frete = frete;
          produto.destaque = destaque || null;

          todosProdutos.push(produto);
        }
      });

    } catch (erro) {
      console.error(`❌ Erro na página ${pagina}: ${erro.message}`);
    }
  }

  fs.writeFileSync('produtos_ofertas.json', JSON.stringify(todosProdutos, null, 2), 'utf-8');
  console.log(`✅ Coleta finalizada. ${todosProdutos.length} produtos salvos em produtos_ofertas.json`);
}

extrairProdutosDasPaginas();
