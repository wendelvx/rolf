const { fork } = require('node:child_process');
const path = require('node:path');

const configuracaoServidores = [
  { nome: 'Servidor-Alpha', porta: 3001, setor: 'Eletrônicos' },
  { nome: 'Servidor-Beta', porta: 3002, setor: 'Vestuário' },
  { nome: 'Servidor-Gamma', porta: 3003, setor: 'Brinquedos' }
];

console.log('\x1b[33m--- Iniciando instâncias isoladas da ShopNow ---\x1b[0m');

configuracaoServidores.forEach(config => {
  const caminhoApp = path.join(__dirname, 'app.js');
  
  fork(caminhoApp, [], {
    env: {
      ...process.env,
      NOME_INSTANCIA: config.nome,
      PORTA_INSTANCIA: config.porta.toString(),
      SETOR_INSTANCIA: config.setor
    }
  });
});