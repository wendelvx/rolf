const http = require('node:http');

class ProxyReverso {
  constructor({ monitorSaude, obterServidorDestino, callbackPosRequisicao }) {
    this.monitor = monitorSaude;
    this.obterServidorDestino = obterServidorDestino;
    this.callbackPosRequisicao = callbackPosRequisicao || (() => {});
  }

  encaminhar(reqCliente, resCliente, tentativasRestantes = 2) {
    const servidoresAtivos = this.monitor.obterAtivos();

    if (servidoresAtivos.length === 0) {
      resCliente.writeHead(503, { 'Content-Type': 'application/json' });
      return resCliente.end(JSON.stringify({
        erro: '503 Service Unavailable',
        mensagem: 'Nenhum servidor ShopNow disponivel no momento.'
      }));
    }

    const destino = this.obterServidorDestino(servidoresAtivos, reqCliente);
    const inicioExecucao = Date.now();

    const opcoes = {
      host: destino.host,
      port: destino.porta,
      path: reqCliente.url,
      method: reqCliente.method,
      headers: {
        ...reqCliente.headers,
        connection: 'close',
        'x-forwarded-for': reqCliente.headers['x-forwarded-for'] || reqCliente.socket.remoteAddress,
        'x-proxy-balanceador': 'ShopNow-Core'
      }
    };

    const reqDestino = http.request(opcoes, (resDestino) => {
      const duracaoMs = Date.now() - inicioExecucao;
      this.callbackPosRequisicao(destino, duracaoMs);

      const cabecalhos = { ...resDestino.headers, connection: 'close' };
      resCliente.writeHead(resDestino.statusCode, cabecalhos);
      resDestino.pipe(resCliente);
    });

    reqDestino.on('error', (err) => {
      console.error(`\x1b[33m[RETRY] Falha ao comunicar com ${destino.nome} (${err.code}). Tentando outro nó...\x1b[0m`);
      destino.ativo = false;

      if (tentativasRestantes > 0) {
        return this.encaminhar(reqCliente, resCliente, tentativasRestantes - 1);
      }

      if (!resCliente.headersSent) {
        resCliente.writeHead(502, { 'Content-Type': 'application/json' });
        resCliente.end(JSON.stringify({ erro: '502 Bad Gateway - Instancias indisponiveis' }));
      }
    });

    reqCliente.pipe(reqDestino);
  }
}

module.exports = { ProxyReverso };