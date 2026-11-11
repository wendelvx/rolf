const http = require('node:http');
const config = require('../config');
const { MonitorSaude } = require('./monitor-saude');
const { ProxyReverso } = require('./proxy');
const { obterServidorPorIpHash } = require('./algoritmos/ip-hash');
const { BalanceadorMenorTempoResposta } = require('./algoritmos/least-response-time');

// 1. Inicializa o monitoramento de saúde dos nós
const monitor = new MonitorSaude(config.servidores, config.intervaloHealthCheckMs);
monitor.iniciar();

const algoritmoSelecionado = (process.env.ALGORITMO || 'least-response-time').toLowerCase();
let obterServidorDestino;
let callbackPosRequisicao = () => {};

if (algoritmoSelecionado === 'ip-hash') {
  obterServidorDestino = (servidoresAtivos, reqCliente) => {
    return obterServidorPorIpHash(servidoresAtivos, reqCliente);
  };
} else {
  const balanceadorLrt = new BalanceadorMenorTempoResposta();
  
  obterServidorDestino = (servidoresAtivos) => {
    return balanceadorLrt.obterServidor(servidoresAtivos);
  };

  callbackPosRequisicao = (servidor, duracaoMs) => {
    balanceadorLrt.registrarTempoResposta(servidor, duracaoMs);
  };
}

const proxy = new ProxyReverso({
  monitorSaude: monitor,
  obterServidorDestino,
  callbackPosRequisicao
});

// 4. Cria o servidor HTTP principal do balanceador
const servidorBalanceador = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/status-cluster') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      algoritmoAtivo: algoritmoSelecionado,
      servidores: config.servidores.map(s => ({
        nome: s.nome,
        porta: s.porta,
        setor: s.setor,
        ativo: s.ativo
      }))
    }, null, 2));
  }

  proxy.encaminhar(req, res);
});

servidorBalanceador.listen(config.portaBalanceador, () => {
  console.log(`\n\x1b[35m====================================================\x1b[0m`);
  console.log(`\x1b[35m  SHOPNOW LOAD BALANCER OPERACIONAL NA PORTA ${config.portaBalanceador} \x1b[0m`);
  console.log(`\x1b[35m  Algoritmo ativo: \x1b[1m${algoritmoSelecionado.toUpperCase()}\x1b[0m`);
  console.log(`\x1b[35m  Painel do Cluster: http://localhost:${config.portaBalanceador}/status-cluster\x1b[0m`);
  console.log(`\x1b[35m====================================================\x1b[0m\n`);
});