/**
 * afiliateProductLink.js
 * Gera links de afiliado do Mercado Livre com base no JSON de produtos.
 * Usa o Chrome via Playwright com perfil persistente.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Caminho do arquivo JSON gerado pelo getProducts.js
const jsonPath = path.join(__dirname, '../outputs/data/produtos_ofertas.json');
const cookiesPath = path.join(__dirname, '../config/cookies.json');

// Lê os produtos salvos
const produtos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`🔎 Total de produtos carregados: ${produtos.length}`);

// Divide os produtos em lotes de 30
const TAMANHO_LOTE = 30;
const LOTES = [];
for (let i = 0; i < produtos.length; i += TAMANHO_LOTE) {
  LOTES.push(produtos.slice(i, i + TAMANHO_LOTE));
}
console.log(`📦 Total de lotes: ${LOTES.length}`);

(async () => {
  // Caminho do perfil persistente do navegador
  const profilePath = path.join(process.cwd(), 'playwright-profile');

  // Abre o Chrome com contexto persistente (mantém login)
  const browserContext = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    viewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browserContext.newPage();

  // Carrega cookies se existirem
  if (fs.existsSync(cookiesPath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
    
    // Converte cookies para formato Playwright
    const playwrightCookies = cookies.map(cookie => {
      const converted = {
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expirationDate || -1,
        httpOnly: cookie.httpOnly || false,
        secure: cookie.secure || false,
        sameSite: cookie.sameSite === 'no_restriction' ? 'None' : (cookie.sameSite || 'Lax')
      };
      return converted;
    });
    
    await browserContext.addCookies(playwrightCookies);
    console.log('🍪 Cookies carregados com sucesso!');
  }

  console.log('🌐 Acessando o gerador de links de afiliado...');
  await page.goto('https://www.mercadolivre.com.br/afiliados/linkbuilder#hub', {
    waitUntil: 'load'
  });

  try {
    console.log('⏳ Aguardando campo de links...');
    await page.waitForSelector('#url-0', { timeout: 600000 });
    console.log('✅ Campo de links localizado!');
  } catch (e) {
    console.error('❌ Campo não encontrado. Faça login manualmente e rode novamente.');
    await browserContext.close();
    process.exit(1);
  }

  let globalIndex = 0;

  for (let loteIndex = 0; loteIndex < LOTES.length; loteIndex++) {
    const lote = LOTES[loteIndex];
    const links = lote.map(p => p.link);

    console.log(`✏️ Lote ${loteIndex + 1}: ${links.length} links...`);

    await page.fill('#url-0', links.join('\n'));

    // Espera botão "Gerar links" habilitar
    await page.waitForSelector('.form__actions .button_generate-links.andes-button--loud:not([disabled])', { timeout: 10000 });
    await page.click('.form__actions .button_generate-links.andes-button--loud:not([disabled])');

    try {
      // Aguarda o campo de saída com os links afiliados
      await page.waitForSelector('#textfield-copyLink-1', { timeout: 60000 });
      const field = await page.$('#textfield-copyLink-1');
      const textoAfiliado = await field.inputValue();
      const linksAfiliados = textoAfiliado.trim().split('\n');

      if (linksAfiliados.length !== links.length) {
        console.warn(`⚠️ Diferença de quantidade — Esperado: ${links.length}, Recebido: ${linksAfiliados.length}`);
      }

      // Atualiza o JSON com os links afiliados
      for (let i = 0; i < links.length; i++) {
        produtos[globalIndex].link_afiliado = linksAfiliados[i] || null;
        globalIndex++;
      }

      console.log(`✅ Lote ${loteIndex + 1} processado com sucesso.`);
      await page.waitForTimeout(1500);
    } catch (e) {
      console.error(`❌ Erro no lote ${loteIndex + 1}: ${e.message}`);
      break;
    }
  }

  // Salva o JSON atualizado
  const { salvarJson } = require('../utils/fileHandler');
salvarJson('produtos_ofertas', produtos);
  console.log('💾 JSON atualizado com os links de afiliado.');

  await browserContext.close();
  console.log('✅ Navegador fechado. Processo concluído.');
})();
