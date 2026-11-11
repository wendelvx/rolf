const http = require('node:http');

class MonitorSaude {
  constructor(servidores, intervaloMs = 2500) {
    this.servidores = servidores;
    this.intervaloMs = intervaloMs;
    this.timer = null;
  }

  iniciar() {
    console.log(`\x1b[36m[MONITOR] Iniciando verificação de integridade a cada ${this.intervaloMs / 1000}s...\x1b[0m`);
    this.verificarTodos();
    this.timer = setInterval(() => this.verificarTodos(), this.intervaloMs);
  }

  parar() {
    if (this.timer) clearInterval(this.timer);
  }

  verificarTodos() {
    this.servidores.forEach((servidor) => this.verificarServidor(servidor));
  }

  verificarServidor(servidor) {
    const opcoes = {
      host: servidor.host,
      port: servidor.porta,
      path: '/saude',
      method: 'GET',
      timeout: 1500
    };

    const req = http.request(opcoes, (res) => {
      const estavaAtivo = servidor.ativo;
      if (res.statusCode === 200) {
        servidor.ativo = true;
        if (!estavaAtivo) {
          console.log(`\x1b[32m✔ [RECUPERADO] ${servidor.nome} (${servidor.porta}) voltou a ficar operacional!\x1b[0m`);
        }
      } else {
        servidor.ativo = false;
        if (estavaAtivo) {
          console.error(`\x1b[31m✖ [FALHA] ${servidor.nome} (${servidor.porta}) retornou status ${res.statusCode}.\x1b[0m`);
        }
      }
      res.resume(); // Consome o payload para liberar socket
    });

    req.on('timeout', () => {
      req.destroy();
      this.marcarComoInativo(servidor, 'Timeout');
    });

    req.on('error', (err) => {
      this.marcarComoInativo(servidor, err.code || err.message);
    });

    req.end();
  }

  marcarComoInativo(servidor, motivo) {
    if (servidor.ativo) {
      servidor.ativo = false;
      console.error(`\x1b[31m✖ [FORA DO AR] ${servidor.nome} (${servidor.porta}) desconectou! Motivo: ${motivo}\x1b[0m`);
    }
  }

  obterAtivos() {
    return this.servidores.filter((s) => s.ativo);
  }
}

module.exports = { MonitorSaude };