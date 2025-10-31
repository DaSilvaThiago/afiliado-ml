# 🤖 Scrapper Mercado Livre + WhatsApp Automation

badges:
  - name: Node.js
    color: "339933"
    logo: "node.js"
    text: "Node.js 18+"
  - name: Playwright
    color: "45ba4b"
    logo: "playwright"
    text: "Playwright Automation"
  - name: License
    color: "blue"
    text: "MIT"
  - name: Status
    color: "brightgreen"
    text: "Stable"

---

description: |
  Este projeto é uma automação completa em **Node.js** que realiza todo o processo de marketing de produtos do **Mercado Livre**, desde a coleta até o envio automatizado no WhatsApp Web.

  Ele executa:
    1. 🛒 Coleta ofertas do Mercado Livre
    2. 🔗 Gera links de afiliado automaticamente
    3. 🖼️ Baixa imagens e cria mensagens formatadas
    4. 💬 Envia tudo para um grupo do WhatsApp de forma agendada

---

estrutura_projeto: |
  src/
   ├── tasks/       → scripts principais (coleta, afiliação, mensagens, envio)
   ├── utils/       → funções auxiliares (fileHandler)
   ├── config/      → variáveis e caminhos de configuração
   └── outputs/     → resultados e arquivos gerados (json, imagens, csv)

---

requisitos:
  - Node.js 18+
  - Google Chrome instalado
  - Playwright
  - WhatsApp Web logado no perfil do Chrome configurado

---

instalacao: |
  git clone https://github.com/seu-usuario/scrapper.git
  cd scrapper
  npm install

---

execucao_por_etapas:
  - etapa: "1️⃣ Coletar produtos"
    comando: "npm run get-products"
    resultado: "Gera src/outputs/data/produtos_ofertas.json"
  - etapa: "2️⃣ Gerar links afiliados"
    comando: "npm run affiliate-links"
    resultado: "Atualiza o JSON com os links afiliados"
  - etapa: "3️⃣ Gerar mensagens e baixar imagens"
    comando: "npm run generate-messages"
    resultado: "Cria mensagens.csv e baixa imagens em src/outputs/images"
  - etapa: "4️⃣ Enviar mensagens no WhatsApp"
    comando: "npm run send-whatsapp"
    resultado: "Envia as mensagens e salva o histórico em enviados.json"

---

execucao_completa_pipeline: |
  npm run run-all

  Executa todas as etapas automaticamente:
    1. Coleta produtos
    2. Gera links afiliados
    3. Cria mensagens e imagens
    4. Envia no WhatsApp

---

configuracao:
  arquivo: "src/config/bot.config.js"
  exemplo: |
    module.exports = {
      grupo: 'ALL PRODUTOS#1',  // Nome exato do grupo no WhatsApp
      intervaloMinutos: 15,      // Intervalo entre cada envio
      chromeProfilePath: 'C:/Users/SEU_USUARIO/AppData/Local/Google/Chrome/User Data/Default',
      chromeExecutable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    }
  notas:
    - Substitua `SEU_USUARIO` pelo nome de usuário do Windows
    - Verifique que o perfil Chrome está logado no WhatsApp Web
    - Use `/` em vez de `\` nos caminhos do Windows

---

estrutura_saida: |
  src/outputs/
   ├── data/
   │   └── produtos_ofertas.json   → produtos coletados e links afiliados
   ├── images/                     → imagens baixadas de cada produto
   ├── mensagens.csv               → mensagens formatadas
   └── enviados.json               → histórico de mensagens enviadas

---

scripts_disponiveis:
  - comando: "npm run get-products"
    descricao: "Coleta produtos e gera JSON"
  - comando: "npm run affiliate-links"
    descricao: "Gera links de afiliado"
  - comando: "npm run generate-messages"
    descricao: "Gera mensagens e baixa imagens"
  - comando: "npm run send-whatsapp"
    descricao: "Envia mensagens no WhatsApp"
  - comando: "npm run run-all"
    descricao: "Executa todo o processo em sequência"

---

dependencias:
  principais:
    - axios: "Requisições HTTP (coleta de dados)"
    - cheerio: "Raspagem e parse de HTML"
    - playwright: "Automação do navegador Chrome"
    - csv-parser: "Leitura e escrita de CSV"
    - clipboardy: "Copia mensagens para área de transferência"
  desenvolvimento:
    - nodemon: "Reload automático durante o desenvolvimento"

---

gitignore: |
  # Node
  node_modules/
  npm-debug.log
  .env
  .env.local

  # Playwright profile
  playwright-profile/

  # Outputs gerados
  src/outputs/data/
  src/outputs/images/
  src/outputs/mensagens.csv
  src/outputs/enviados.json

  # Sistema
  .DS_Store
  Thumbs.db

---

estrutura_completa: |
  scrapper/
  │
  ├── playwright-profile/
  │
  ├── src/
  │   ├── config/
  │   │   └── bot.config.js
  │   │
  │   ├── outputs/
  │   │   ├── data/
  │   │   ├── images/
  │   │   ├── mensagens.csv
  │   │   └── enviados.json
  │   │
  │   ├── tasks/
  │   │   ├── getProducts.js
  │   │   ├── afiliateProductLink.js
  │   │   ├── processador.js
  │   │   └── bot-whatsapp.js
  │   │
  │   └── utils/
  │       └── fileHandler.js
  │
  ├── .gitignore
  ├── package.json
  ├── package-lock.json
  └── README.md

---

dicas_importantes:
  - Execute o terminal como **Administrador** no Windows.
  - Feche todas as janelas do Chrome antes de iniciar o bot.
  - Teste sempre em um grupo de WhatsApp de teste antes do envio real.
  - Não suba pastas de `outputs/` no GitHub (já estão no .gitignore).

---

autor:
  nome: "Thiago Thi"
  contato: "adicione seu e-mail ou LinkedIn aqui"
  ano: 2025

---

licenca:
  tipo: "MIT"
  descricao: "Este projeto está sob a licença MIT — sinta-se livre para usar, modificar e aprimorar."
  copyright: "© 2025 - Desenvolvido por Thiago Thi"
