class BalanceadorMenorTempoResposta {
  constructor() {
    
    this.estatisticasLatencia = new Map();
  }

  registrarTempoResposta(servidor, duracaoMs) {
    const chave = `${servidor.host}:${servidor.porta}`;
    const latenciaAtual = this.estatisticasLatencia.get(chave) || duracaoMs;

    const novaLatenciaMedia = (latenciaAtual * 0.7) + (duracaoMs * 0.3);
    this.estatisticasLatencia.set(chave, novaLatenciaMedia);
  }

  obterServidor(servidoresAtivos) {
    if (!servidoresAtivos || servidoresAtivos.length === 0) {
      return null;
    }

    let melhorServidor = servidoresAtivos[0];
    let menorLatencia = Infinity;

    for (const servidor of servidoresAtivos) {
      const chave = `${servidor.host}:${servidor.porta}`;
      const latencia = this.estatisticasLatencia.has(chave)
        ? this.estatisticasLatencia.get(chave)
        : 0;

      if (latencia < menorLatencia) {
        menorLatencia = latencia;
        melhorServidor = servidor;
      }
    }

    return melhorServidor;
  }
}

module.exports = { BalanceadorMenorTempoResposta };