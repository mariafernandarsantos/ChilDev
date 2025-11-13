

/** Classe base para todos os nós da AST */
export class NodoAST {
  constructor(linha) {
    this.linha = linha;
  }
  aceitar(visitor) {
    throw new Error("Método 'aceitar' deve ser implementado pela subclasse.");
  }
}

//  Programa e Declarações 

export class NodoPrograma extends NodoAST {
  constructor(declaracoes) {
    super(0); // Programa começa na linha 0 (virtual)
    this.declaracoes = declaracoes;
  }
  aceitar(visitor) { return visitor.visitarPrograma(this); }
}

export class NodoDeclaracao extends NodoAST {
  constructor(linha) { super(linha); }
}

export class NodoDeclaracaoFuncao extends NodoDeclaracao {
  constructor(nome, parametros, corpo, linha) {
    super(linha);
    this.nome = nome; // Token (Identificador)
    this.parametros = parametros; // Array de Parametro
    this.corpo = corpo; // NodoComandoBloco
  }
  aceitar(visitor) { return visitor.visitarDeclaracaoFuncao(this); }
}

export class Parametro {
  constructor(tipo, nome) {
    this.tipo = tipo; // Token (Keyword 'inteiro')
    this.nome = nome; // Token (Identificador)
  }
}

export class NodoDeclaracaoVariavel extends NodoDeclaracao {
  constructor(tipo, nome, inicializador, linha) {
    super(linha);
    this.tipo = tipo; // Token (Keyword 'inteiro')
    this.nome = nome; // Token (Identificador)
    this.inicializador = inicializador; // NodoExpressao ou null
  }
  aceitar(visitor) { return visitor.visitarDeclaracaoVariavel(this); }
}

// Comandos 

export class NodoComando extends NodoDeclaracao {
  constructor(linha) { super(linha); }
}

export class NodoComandoExpressao extends NodoComando {
  constructor(expressao, linha) {
    super(linha);
    this.expressao = expressao;
  }
  aceitar(visitor) { return visitor.visitarComandoExpressao(this); }
}

export class NodoComandoSe extends NodoComando {
  constructor(condicao, blocoEntao, blocoSenao, linha) {
    super(linha);
    this.condicao = condicao;
    this.blocoEntao = blocoEntao;
    this.blocoSenao = blocoSenao; // Pode ser null
  }
  aceitar(visitor) { return visitor.visitarComandoSe(this); }
}

export class NodoComandoRetorna extends NodoComando {
  constructor(palavraChave, valor, linha) {
    super(linha);
    this.palavraChave = palavraChave; // Token 'retorna'
    this.valor = valor; // NodoExpressao ou null
  }
  aceitar(visitor) { return visitor.visitarComandoRetorna(this); }
}

export class NodoComandoEscreva extends NodoComando {
  constructor(palavraChave, argumentos, linha) {
    super(linha);
    this.palavraChave = palavraChave; // Token 'escreva'
    this.argumentos = argumentos; // Array de NodoExpressao
  }
  aceitar(visitor) { return visitor.visitarComandoEscreva(this); }
}

export class NodoComandoBloco extends NodoComando {
  constructor(declaracoes, comandos, linha) {
    super(linha);
    this.declaracoes = declaracoes; // Array de NodoDeclaracaoVariavel
    this.comandos = comandos; // Array de NodoComando
  }
  aceitar(visitor) { return visitor.visitarComandoBloco(this); }
}

// Nó especial para representar um ';' vazio
export class NodoComandoVazio extends NodoComando {
  constructor(linha) { super(linha); }
  aceitar(visitor) { return visitor.visitarComandoVazio(this); }
}

// Expressões

export class NodoExpressao extends NodoAST {
  constructor(linha) { super(linha); }
}

export class NodoExpressaoLiteral extends NodoExpressao {
  constructor(valor, linha) {
    super(linha);
    this.valor = valor; // O valor JS (número ou string)
  }
  aceitar(visitor) { return visitor.visitarExpressaoLiteral(this); }
}

export class NodoExpressaoVariavel extends NodoExpressao {
  constructor(nome, linha) {
    super(linha);
    this.nome = nome; // Token (Identificador)
  }
  aceitar(visitor) { return visitor.visitarExpressaoVariavel(this); }
}

export class NodoExpressaoBinaria extends NodoExpressao {
  constructor(esquerda, operador, direita, linha) {
    super(linha);
    this.esquerda = esquerda;
    this.operador = operador; // Token (Operador)
    this.direita = direita;
  }
  aceitar(visitor) { return visitor.visitarExpressaoBinaria(this); }
}

export class NodoExpressaoUnaria extends NodoExpressao {
  constructor(operador, operando, linha) {
    super(linha);
    this.operador = operador; // Token (Operador)
    this.operando = operando;
  }
  aceitar(visitor) { return visitor.visitarExpressaoUnaria(this); }
}

export class NodoExpressaoAtribuicao extends NodoExpressao {
  constructor(nome, valor, linha) {
    super(linha);
    this.nome = nome; // Token (Identificador)
    this.valor = valor; // NodoExpressao
  }
  aceitar(visitor) { return visitor.visitarExpressaoAtribuicao(this); }
}

export class NodoExpressaoChamada extends NodoExpressao {
  constructor(funcao, argumentos, linha) {
    super(linha);
    this.funcao = funcao; // NodoExpressao (geralmente Variavel)
    this.argumentos = argumentos; // Array de NodoExpressao
  }
  aceitar(visitor) { return visitor.visitarExpressaoChamada(this); }
}

export class NodoExpressaoAgrupamento extends NodoExpressao {
  constructor(expressao, linha) {
    super(linha);
    this.expressao = expressao;
  }
  aceitar(visitor) { return visitor.visitarExpressaoAgrupamento(this); }
}

// Nó especial para indicar erro
export class NodoErro extends NodoDeclaracao {
  constructor() { super(0); }
  aceitar(visitor) { return visitor.visitarErro(this); }
}

// Interface Visitor 

export class VisitorAST {
  visitarPrograma(nodo) {}
  visitarDeclaracaoFuncao(nodo) {}
  visitarDeclaracaoVariavel(nodo) {}
  visitarComandoExpressao(nodo) {}
  visitarComandoSe(nodo) {}
  visitarComandoRetorna(nodo) {}
  visitarComandoEscreva(nodo) {}
  visitarComandoBloco(nodo) {}
  visitarComandoVazio(nodo) {}
  visitarExpressaoLiteral(nodo) {}
  visitarExpressaoVariavel(nodo) {}
  visitarExpressaoBinaria(nodo) {}
  visitarExpressaoUnaria(nodo) {}
  visitarExpressaoAtribuicao(nodo) {}
  visitarExpressaoChamada(nodo) {}
  visitarExpressaoAgrupamento(nodo) {}
  visitarErro(nodo) {}
}