const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Caminho do JSON
const jsonPath = path.join(__dirname, 'produtos_ofertas.json');
const produtos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`🔎 Total de produtos carregados: ${produtos.length}`);

// Lotes
const LOTES = [];
const TAMANHO = 30;
for (let i = 0; i < produtos.length; i += TAMANHO) {
  LOTES.push(produtos.slice(i, i + TAMANHO));
}
console.log(`📦 Total de lotes: ${LOTES.length}`);

(async () => {
  // Caminho para o perfil persistente do Playwright (será salvo aqui)
  const profilePath = path.join(__dirname, 'playwright-profile');

  // Abre o Chrome do sistema com perfil persistente
  const browserContext = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    channel: 'chrome', // usa o Chrome instalado
    viewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browserContext.newPage();

  console.log('🌐 Acessando o gerador de links...');
  await page.goto('https://www.mercadolivre.com.br/afiliados/linkbuilder#hub', {
    waitUntil: 'load'
  });

  try {
    console.log('⏳ Aguardando campo...');
    await page.waitForSelector('#url-0', { timeout: 60000 });
    console.log('✅ Campo de links localizado!');
  } catch (e) {
    console.error('❌ Não encontrou o campo. Faça login, atualize a página e rode de novo.');
    return;
  }

  let globalIndex = 0;

  for (let loteIndex = 0; loteIndex < LOTES.length; loteIndex++) {
    const lote = LOTES[loteIndex];
    const links = lote.map(p => p.link);

    console.log(`✏️ Lote ${loteIndex + 1}: ${links.length} links...`);

    await page.fill('#url-0', links.join('\n'));

    await page.waitForSelector('.form__actions .button_generate-links.andes-button--loud:not([disabled])', { timeout: 10000 });
    await page.click('.form__actions .button_generate-links.andes-button--loud:not([disabled])');


    try {
      await page.waitForSelector('#textfield-copyLink-1', { timeout: 60000 });
      const field = await page.$('#textfield-copyLink-1');
      const textoAfiliado = await field.inputValue();
      const linksAfiliados = textoAfiliado.trim().split('\n');

      if (linksAfiliados.length !== links.length) {
        console.warn(`⚠️ Mismatch! Esperado: ${links.length}, Recebido: ${linksAfiliados.length}`);
      }

      for (let i = 0; i < links.length; i++) {
        produtos[globalIndex].link_afiliado = linksAfiliados[i] || null;
        globalIndex++;
      }

      console.log(`✅ Lote ${loteIndex + 1} processado.`);
      await page.waitForTimeout(1500);
    } catch (e) {
      console.error(`❌ Falha no lote ${loteIndex + 1}: ${e.message}`);
      break;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(produtos, null, 2), 'utf-8');
  console.log('💾 JSON atualizado com os links de afiliado.');

  await browserContext.close();
  console.log('✅ Navegador fechado. Processo concluído!');
  process.exit(0);
})();
