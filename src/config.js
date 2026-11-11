module.exports = {
  portaBalanceador: 8000,
  intervaloHealthCheckMs: 2500,
  servidores: [
    { id: 1, nome: 'Servidor-Alpha', host: '127.0.0.1', porta: 3001, setor: 'Eletrônicos', ativo: true },
    { id: 2, nome: 'Servidor-Beta', host: '127.0.0.1', porta: 3002, setor: 'Vestuário', ativo: true },
    { id: 3, nome: 'Servidor-Gamma', host: '127.0.0.1', porta: 3003, setor: 'Brinquedos', ativo: true }
  ]
};