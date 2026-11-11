
function obterServidorPorIpHash(servidoresAtivos, requisicaoCliente) {
  if (!servidoresAtivos || servidoresAtivos.length === 0) {
    return null;
  }

  const ipCliente = requisicaoCliente.headers['x-forwarded-for'] ||
                    requisicaoCliente.socket.remoteAddress ||
                    '127.0.0.1';

  let valorHash = 0;
  for (let i = 0; i < ipCliente.length; i++) {
    valorHash = (valorHash << 5) - valorHash + ipCliente.charCodeAt(i);
    valorHash |= 0; 
  }

  const indice = Math.abs(valorHash) % servidoresAtivos.length;
  return servidoresAtivos[indice];
}

module.exports = { obterServidorPorIpHash };