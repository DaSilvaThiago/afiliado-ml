/**
 * bot-whatsapp.js
 * Lê o CSV de mensagens, e envia cada uma com sua imagem no grupo definido, via WhatsApp Web.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const csv = require('csv-parser');
const clipboardy = require('clipboardy').default;
const config = require('../config/bot.config');

// Caminhos dentro do projeto
const caminhoCsv = path.join(__dirname, '../outputs/mensagens.csv');
const enviadosPath = path.join(__dirname, '../outputs/enviados.json');

// Diretório de imagens (ajustado)
const caminhoImagens = path.join(__dirname, '../outputs/images');

// Variáveis de controle
const grupo = config.grupo;
const intervaloMinutos = config.intervaloMinutos;

// --- Funções auxiliares ---

// Lê o CSV e retorna apenas as mensagens ainda não enviadas
function lerMensagensCsv() {
  return new Promise((resolve) => {
    const mensagens = [];
    const enviados = fs.existsSync(enviadosPath)
      ? JSON.parse(fs.readFileSync(enviadosPath, 'utf8'))
      : [];

    fs.createReadStream(caminhoCsv)
      .pipe(csv())
      .on('data', (row) => {
        if (!enviados.includes(row.mensagem)) {
          mensagens.push({
            mensagem: row.mensagem,
            imagem: path.resolve(row.imagem)
          });
        }
      })
      .on('end', () => resolve({ mensagens, enviados }));
  });
}

// Salva o histórico de mensagens já enviadas
function registrarEnvio(mensagem, enviados) {
  enviados.push(mensagem);
  fs.writeFileSync(enviadosPath, JSON.stringify(enviados, null, 2), 'utf8');
}

// --- Execução principal ---
(async () => {
  const { mensagens, enviados } = await lerMensagensCsv();

  if (mensagens.length === 0) {
    console.log('✅ Nenhuma nova mensagem para enviar.');
    return;
  }

  // Inicia Chrome persistente (mantém login no WhatsApp)
  const browser = await chromium.launchPersistentContext(config.chromeProfilePath, {
    headless: false,
    args: ['--start-maximized'],
    executablePath: config.chromeExecutable
  });

  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com');
  console.log('⏳ Aguardando WhatsApp carregar...');

  // Aguarda grupo aparecer e clica
  await page.waitForSelector(`text="${grupo}"`, { timeout: 0 });
  await page.click(`text="${grupo}"`);
  console.log(`✅ Grupo "${grupo}" aberto.`);
  await page.waitForTimeout(3000);

  // Loop de envio
  for (let i = 0; i < mensagens.length; i++) {
    const { mensagem, imagem } = mensagens[i];
    console.log(`📨 Enviando ${i + 1}/${mensagens.length}: ${mensagem.slice(0, 40)}...`);

    try {
      // 1️⃣ Clicar botão de anexo
      const botaoAnexar = page.locator('span[data-icon="plus-rounded"]');
      await botaoAnexar.waitFor({ timeout: 10000 });
      await botaoAnexar.click();

      // 2️⃣ Selecionar imagem
      const inputFile = page.getByRole('button', { name: 'Photos & videos' })
        .locator('input[type="file"]');
      await inputFile.setInputFiles(imagem);

      console.log(`🖼 Imagem anexada: ${path.basename(imagem)}`);

      // 3️⃣ Espera carregar preview
      await page.waitForTimeout(3000);

      // 4️⃣ Cola mensagem (Ctrl+V)
      clipboardy.writeSync(mensagem);
      await page.keyboard.down('Control');
      await page.keyboard.press('V');
      await page.keyboard.up('Control');

      console.log('✏️ Mensagem colada, enviando...');
      await page.keyboard.press('Enter');
      console.log('✅ Mensagem enviada com sucesso!');

      // 5️⃣ Registrar envio
      registrarEnvio(mensagem, enviados);

      // 6️⃣ Espera intervalo configurado antes do próximo envio
      if (i < mensagens.length - 1) {
        console.log(`⏳ Aguardando ${intervaloMinutos} minutos antes do próximo envio...`);
        await new Promise(res => setTimeout(res, intervaloMinutos * 60 * 1000));
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem ${i + 1}:`, error.message);
      continue;
    }
  }

  console.log('🏁 Todas as mensagens foram enviadas.');
  await browser.close();
})();
