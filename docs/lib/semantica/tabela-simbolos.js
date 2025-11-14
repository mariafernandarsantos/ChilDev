export class Simbolo {
  constructor(nome, tipo, linha, inicializado = false) {
    this.nome = nome; // O token
    this.tipo = tipo; // Um objeto 'Tipo'
    this.linha = linha;
    this.inicializado = inicializado;
  }
}

/** Gerencia os escopos e símbolos. */
export class TabelaSimbolos {
  constructor() {
    // A pilha de escopos. O último item é o escopo atual.
    // Cada escopo é um Map<string, Simbolo>
    this.escopos = [new Map()];
  }
  
  /** Inicia um novo escopo (ex: ao entrar em um bloco ou função). */
  entrarEscopo() {
    this.escopos.push(new Map());
  }
  
  /** Fecha o escopo atual (ex: ao sair de um bloco ou função). */
  sairEscopo() {
    if (this.escopos.length > 1) {
      this.escopos.pop();
    }
  }
  
  /** Escopo atual (o último mapa na pilha). */
  get escopoAtual() {
    return this.escopos[this.escopos.length - 1];
  }

  /** Declara um novo símbolo no escopo ATUAL. */
  declarar(nomeToken, tipo, linha) {
    const nome = nomeToken.value;
    if (this.escopoAtual.has(nome)) {
      // Erro: Símbolo já declarado *neste* escopo
      return false;
    }
    const simbolo = new Simbolo(nomeToken, tipo, linha);
    this.escopoAtual.set(nome, simbolo);
    return true;
  }
  
  /** Busca por um símbolo, começando do escopo atual e subindo. */
  buscar(nomeToken) {
    const nome = nomeToken.value;
    // Itera de trás para frente (do escopo mais interno para o mais externo)
    for (let i = this.escopos.length - 1; i >= 0; i--) {
      if (this.escopos[i].has(nome)) {
        return this.escopos[i].get(nome);
      }
    }
    // Não encontrou
    return null;
  }
  
  /** Marca um símbolo como inicializado. */
  marcarInicializado(nomeToken) {
    const nome = nomeToken.value;
    for (let i = this.escopos.length - 1; i >= 0; i--) {
      if (this.escopos[i].has(nome)) {
        this.escopos[i].get(nome).inicializado = true;
        return;
      }
    }
  }
}