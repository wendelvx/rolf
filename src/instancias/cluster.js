const { criarInstancia } = require('./app');

const configuracaoServidores = [
  { nome: 'Servidor-Alpha', porta: 3001, setor: 'Eletrônicos' },
  { nome: 'Servidor-Beta', porta: 3002, setor: 'Vestuário' },
  { nome: 'Servidor-Gamma', porta: 3003, setor: 'Brinquedos' }
];

console.log('\x1b[33m--- Iniciando instâncias da ShopNow ---\x1b[0m');

configuracaoServidores.forEach(config => {
  criarInstancia(config);
});