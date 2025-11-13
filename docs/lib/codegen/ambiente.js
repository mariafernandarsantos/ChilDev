import { ErroRuntime } from './erros.js';

export class Ambiente {
  constructor(enclosing = null) {
    this.valores = new Map();
    this.enclosing = enclosing; // Referência ao escopo "pai"
  }

  /** Define uma *nova* variável no escopo atual. */
  definir(nomeToken, valor) {
    this.valores.set(nomeToken.value, valor);
  }

  /** Obtém o valor de uma variável. */
  obter(nomeToken) {
    // 1. Procura no escopo atual
    if (this.valores.has(nomeToken.value)) {
      return this.valores.get(nomeToken.value);
    }
    
    // 2. Se não achar, procura no escopo pai (recursivamente)
    if (this.enclosing !== null) {
      return this.enclosing.obter(nomeToken);
    }

    // 3. Se não achar em lugar nenhum, lança um erro.
    throw new ErroRuntime(nomeToken, `Variável indefinida '${nomeToken.value}'.`);
  }

  /** Atribui um *novo* valor a uma variável *existente*. */
  atribuir(nomeToken, valor) {
    // 1. Procura no escopo atual
    if (this.valores.has(nomeToken.value)) {
      this.valores.set(nomeToken.value, valor);
      return;
    }

    // 2. Se não achar, procura no escopo pai (recursivamente)
    if (this.enclosing !== null) {
      this.enclosing.atribuir(nomeToken, valor);
      return;
    }

    // 3. Se não achar, não pode atribuir.
    throw new ErroRuntime(nomeToken, `Variável indefinida '${nomeToken.value}'.`);
  }
}