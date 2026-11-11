const http = require('node:http');

function criarInstancia({ nome, porta, setor }) {
  const servidor = http.createServer((requisicao, resposta) => {
    const url = requisicao.url;
    const metodo = requisicao.method;

    
    if (metodo === 'GET' && url === '/saude') {
      resposta.writeHead(200, { 'Content-Type': 'application/json' });
      return resposta.end(JSON.stringify({ status: 'ativo', instancia: nome, porta }));
    }

    if (metodo === 'POST' && url === '/panico') {
      console.error(`\x1b[31m[PÂNICO] Servidor ${nome} (${porta}) recebeu ordem de encerramento!\x1b[0m`);
      resposta.writeHead(500, { 'Content-Type': 'application/json' });
      resposta.end(JSON.stringify({ mensagem: `Servidor ${nome} desligando...` }));
      
      setTimeout(() => {
        process.exit(1);
      }, 100);
      return;
    }

    if (metodo === 'GET' && (url === '/' || url === '/produtos')) {
      // Delay aleatório entre 10ms e 80ms para simular carga de banco/rede
      const tempoProcessamento = Math.floor(Math.random() * 70) + 10;

      setTimeout(() => {
        resposta.writeHead(200, { 'Content-Type': 'application/json' });
        resposta.end(JSON.stringify({
          mensagem: 'ShopNow - Pedido processado com sucesso!',
          servidor: nome,
          setor: setor,
          porta: porta,
          tempoProcessamentoMs: tempoProcessamento
        }));
      }, tempoProcessamento);
      return;
    }

    resposta.writeHead(404, { 'Content-Type': 'application/json' });
    resposta.end(JSON.stringify({ erro: 'Rota não encontrada na loja' }));
  });

  servidor.listen(porta, () => {
    console.log(`\x1b[32m✔ [INICIADO] ${nome} [Setor: ${setor}] escutando na porta ${porta}\x1b[0m`);
  });

  return servidor;
}

module.exports = { criarInstancia };