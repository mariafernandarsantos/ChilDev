/** Erro que acontece durante a execução do código. */
export class ErroRuntime extends Error {
  constructor(token, message) {
    super(message);
    this.token = token;
    this.name = "ErroRuntime";
  }
}

/** * Isso não é um "erro", mas uma exceção usada para
 * controlar o fluxo de "retorna". Ela "pula" para fora
 * da função com o valor de retorno.
 */
export class ErroRetorno extends Error {
  constructor(valor) {
    super(null);
    this.valor = valor;
    this.name = "ErroRetorno";
  }
}

export class ErroSemantico extends Error {
  constructor(mensagem, linha) {
    super(mensagem);
    this.linha = linha;
    this.name = "ErroSemantico";
  }
}