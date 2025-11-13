// arquivo: parser/descendente/parser.js
import * as AST from '../ast/ast.js';

// Exceção customizada para erros de parsing
class ErroParser extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "ErroParser";
  }
}

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.posicaoAtual = 0;
    this.teveErro = false;
    this.modoPanico = false;
    this.mensagensErro = [];
  }

  /** Retorna o token atual sem consumi-lo */
  peek() {
    // O léxico deve sempre fornecer um token EOF no final
    return this.tokens[this.posicaoAtual];
  }

  /** Retorna o token anterior */
  anterior() {
    return this.tokens[this.posicaoAtual - 1];
  }

  /** Avança para o próximo token e retorna o atual (anterior) */
  advance() {
    if (!this.fimDaEntrada()) {
      this.posicaoAtual++;
    }
    return this.anterior();
  }

  /** Verifica se chegamos ao fim da entrada */
  fimDaEntrada() {
    // O léxico agora fornece um 'EOF', então verificamos por ele
    return this.peek().type === 'EOF';
  }

  /** Verifica se o token atual é dos tipos especificados */
  verificar(tipo, valor = null) {
    if (this.fimDaEntrada()) return false;
    const token = this.peek();
    
    // CORREÇÃO: Usamos .type e .value
    if (token.type !== tipo) return false;
    if (valor !== null && token.value !== valor) return false;
    return true;
  }
  
  /** Verifica se o token atual é de algum dos tipos/valores da lista */
  verificarMultiplos(paresTipoValor) {
     for (const [tipo, valor] of paresTipoValor) {
        if (this.verificar(tipo, valor)) {
            return true;
        }
     }
     return false;
  }

  /** Tenta consumir o token se ele bater com tipo/valor. Retorna true/false. */
  match(tipo, valor = null) {
    if (this.verificar(tipo, valor)) {
      this.advance();
      return true;
    }
    return false;
  }

  /** Consome um token do tipo/valor esperado ou lança erro */
  consumir(tipo, valor, mensagemErro) {
    if (this.verificar(tipo, valor)) {
      return this.advance();
    }
    throw this.erroParser(this.peek(), mensagemErro);
  }

  erroParser(token, mensagem) {
    this.reportarErro(token, mensagem);
    return new ErroParser(mensagem);
  }

  reportarErro(token, mensagem) {
    if (this.modoPanico) return;
    this.teveErro = true;
    this.modoPanico = true;

    // Usamos .line, .column e .value (inglês)
    let localizacao = `Linha ${token.line}, coluna ${token.column}`;
    let mensagemCompleta = `Erro [${localizacao}]: ${mensagem}`;

    if (token.type === 'EOF') {
      mensagemCompleta += " (no fim do arquivo)";
    } else {
      mensagemCompleta += ` (próximo a '${token.value}')`;
    }

    this.mensagensErro.push(mensagemCompleta);
    console.error(mensagemCompleta);
  }

  sincronizar() {
    this.advance();
    while (!this.fimDaEntrada()) {
      // Usamos .type e .value
      if (this.anterior().type === 'DELIMITER' && this.anterior().value === ';') {
        return;
      }
      
      const token = this.peek();
      // Usamos .type e .value
      if (token.type === 'KEYWORD') {
          switch (token.value) {
            case 'funcao':
            case 'var':
            case 'se':
            case 'retorna':
            case 'escreva':
              return;
          }
      }
      this.advance();
    }
  }

  /** Parseia o programa completo: <Program> ::= <DeclSeq> */
  parsearPrograma() {
    const declaracoes = [];
    while (!this.fimDaEntrada()) {
      try {
        declaracoes.push(this.parsearDeclaracao()); // <DeclSeq>
      } catch (e) {
        if (e instanceof ErroParser) {
          this.sincronizar();
        } else {
          throw e; // Lança erros inesperados (ex: de lógica interna)
        }
      }
    }
    return new AST.NodoPrograma(declaracoes);
  }

  /** Parseia uma declaração: <Decl> ::= <VarDecl> | <FuncaoDecl> | <Statement> */
  parsearDeclaracao() {
    this.modoPanico = false;
    
    try {
        if (this.verificar('KEYWORD', 'var')) {
        return this.parsearDeclaracaoVariavel(); // <VarDecl>
        }
        if (this.verificar('KEYWORD', 'funcao')) {
        return this.parsearDeclaracaoFuncao(); // <FuncaoDecl>
        }
        
        // Se não é uma declaração, deve ser um comando
        return this.parsearComando(); // <Statement>

    } catch (e) {
        if (e instanceof ErroParser) {
            this.sincronizar();
            return new AST.NodoErro(); // Retorna um nó de erro para continuar
        } else {
            throw e; // Lança erros inesperados
        }
    }
    }

  /** <VarDecl> ::= "var" <Type> Ident [ "=" <Expr> ] ";" */
  parsearDeclaracaoVariavel() {
    const palavraChave = this.consumir('KEYWORD', 'var', "Esperado 'var'.");
    const tipo = this.parsearTipo();
    const nome = this.consumir('IDENTIFIER', null, "Esperado nome da variável.");

    let inicializador = null;
    if (this.match('OPERATOR', '=')) {
      inicializador = this.parsearExpressao();
    }

    this.consumir('DELIMITER', ';', "Esperado ';' após declaração de variável.");
    return new AST.NodoDeclaracaoVariavel(tipo, nome, inicializador, palavraChave.line);
  }

  /** <Type> ::= "inteiro" */
  parsearTipo() {
    return this.consumir('KEYWORD', 'inteiro', "Esperado tipo 'inteiro'.");
  }

  /** <FuncaoDecl> ::= "funcao" Ident "(" <FormParsOpt> ")" <Bloco> */
  parsearDeclaracaoFuncao() {
    const palavraChave = this.consumir('KEYWORD', 'funcao', "Esperado 'funcao'.");
    const nome = this.consumir('IDENTIFIER', null, "Esperado nome da função.");
    this.consumir('DELIMITER', '(', "Esperado '(' após nome da função.");
    const parametros = this.parsearParametros();
    this.consumir('DELIMITER', ')', "Esperado ')' após parâmetros.");
    const corpo = this.parsearBloco();
    
    return new AST.NodoDeclaracaoFuncao(nome, parametros, corpo, palavraChave.line);
  }

  /** <FormParsOpt> ::= <FormPars> | ε */
  parsearParametros() {
    const parametros = [];
    if (this.verificar('KEYWORD', 'inteiro')) { // Início de <FormPars>
      do {
        const tipo = this.parsearTipo();
        const nome = this.consumir('IDENTIFIER', null, "Esperado nome do parâmetro.");
        parametros.push(new AST.Parametro(tipo, nome));
      } while (this.match('DELIMITER', ',')); // <FormParsTail>
    }
    return parametros;
  }

  /** <Bloco> ::= "{" <VarDeclSeq> <StatementSeq> "}" */
  parsearBloco() {
    const chaveEsq = this.consumir('DELIMITER', '{', "Esperado '{' para iniciar bloco.");
    const declaracoes = [];
    const comandos = [];

    // <VarDeclSeq>
    while (this.verificar('KEYWORD', 'var')) {
      declaracoes.push(this.parsearDeclaracaoVariavel());
    }

    // <StatementSeq>
    while (!this.verificar('DELIMITER', '}') && !this.fimDaEntrada()) {
      comandos.push(this.parsearComando());
    }

    this.consumir('DELIMITER', '}', "Esperado '}' para fechar bloco.");
    return new AST.NodoComandoBloco(declaracoes, comandos, chaveEsq.line);
  }

  /** <Statement> ::= <IdentStmt> | <SeStmt> | <RetornaStmt> | <EscrevaStmt> | <Bloco> | ";" */
  parsearComando() {
    const linha = this.peek().line;

    // Verifica o tipo de token ANTES de consumi-lo
    if (this.verificar('KEYWORD', 'se')) {
        this.advance(); // Consome o 'se'
        return this.parsearComandoSe(linha);
    }
    if (this.verificar('KEYWORD', 'retorna')) {
        this.advance(); // Consome o 'retorna'
        return this.parsearComandoRetorna(linha);
    }
    if (this.verificar('KEYWORD', 'escreva')) {
        this.advance(); // Consome o 'escreva'
        return this.parsearComandoEscreva(linha);
    }
    if (this.verificar('DELIMITER', '{')) {
        // parsearBloco consome o '{' por si só
        return this.parsearBloco(); 
    }
    if (this.verificar('DELIMITER', ';')) {
        this.advance(); // Consome o ';'
        return new AST.NodoComandoVazio(linha);
    }
    // Só tentamos parsear um comando de identificador
    // se o token FOR um identificador.
    if (this.verificar('IDENTIFIER')) {
        return this.parsearComandoIdentificador(linha);
    }

    // Se não for nada disso, é um erro.
    throw this.erroParser(this.peek(), "Esperado início de um comando (ex: 'se', 'escreva', identificador, etc).");
    }

  /** <IdentStmt> ::= Ident <IdentStmtTail> ";" */
  parsearComandoIdentificador(linha) {
    const nome = this.consumir('IDENTIFIER', null, "Esperado identificador.");
    let comando;

    // <IdentStmtTail>
    if (this.match('OPERATOR', '=')) {
      // Atribuição: Ident "=" <Expr>
      const valor = this.parsearExpressao();
      const atribuicao = new AST.NodoExpressaoAtribuicao(nome, valor, linha);
      comando = new AST.NodoComandoExpressao(atribuicao, linha);

    } else if (this.match('DELIMITER', '(')) {
      // Chamada de função: Ident "(" <ActParsOpt> ")"
      const args = this.parsearArgumentos();
      this.consumir('DELIMITER', ')', "Esperado ')' após argumentos da chamada.");
      const chamada = new AST.NodoExpressaoChamada(
        new AST.NodoExpressaoVariavel(nome, nome.line), 
        args, 
        linha
      );
      comando = new AST.NodoComandoExpressao(chamada, linha);
    } else {
      throw this.erroParser(this.peek(), "Esperado '=' ou '(' após identificador em um comando.");
    }
    
    this.consumir('DELIMITER', ';', "Esperado ';' ao final do comando.");
    return comando;
  }

  /** <SeStmt> ::= "se" "(" <Condition> ")" <Statement> <SenaoPart> */
  parsearComandoSe(linha) {
    // 'se' já foi consumido pelo match()
    this.consumir('DELIMITER', '(', "Esperado '(' após 'se'.");
    const condicao = this.parsearCondicao();
    this.consumir('DELIMITER', ')', "Esperado ')' após condição do 'se'.");

    const blocoEntao = this.parsearComando();
    let blocoSenao = null;

    if (this.match('KEYWORD', 'senao')) {
      blocoSenao = this.parsearComando();
    }

    return new AST.NodoComandoSe(condicao, blocoEntao, blocoSenao, linha);
  }

  /** <RetornaStmt> ::= "retorna" <ExprOpt> ";" */
  parsearComandoRetorna(linha) {
    // 'retorna' já foi consumido
    const palavraChave = this.anterior();
    let valor = null;
    
    if (!this.verificar('DELIMITER', ';')) {
      valor = this.parsearExpressao();
    }

    this.consumir('DELIMITER', ';', "Esperado ';' após 'retorna'.");
    return new AST.NodoComandoRetorna(palavraChave, valor, linha);
  }

  /** <EscrevaStmt> ::= "escreva" "(" <ActParsOpt> ")" ";" */
  parsearComandoEscreva(linha) {
    // 'escreva' já foi consumido
    const palavraChave = this.anterior();
    this.consumir('DELIMITER', '(', "Esperado '(' após 'escreva'.");
    const args = this.parsearArgumentos();
    this.consumir('DELIMITER', ')', "Esperado ')' após argumentos do 'escreva'.");
    this.consumir('DELIMITER', ';', "Esperado ';' após 'escreva'.");
    return new AST.NodoComandoEscreva(palavraChave, args, linha);
  }

  /** <ActParsOpt> ::= <ActPars> | ε */
  parsearArgumentos() {
    const argumentos = [];
    if (!this.verificar('DELIMITER', ')')) {
      do {
        argumentos.push(this.parsearExpressao());
      } while (this.match('DELIMITER', ','));
    }
    return argumentos;
  }

  /** <Condition> ::= <Expr> <RelOp> <Expr> */
  parsearCondicao() {
    const esquerda = this.parsearExpressao();
    
    if (this.verificarMultiplos([
      ['OPERATOR', '=='], ['OPERATOR', '!='], ['OPERATOR', '>'],
      ['OPERATOR', '>='], ['OPERATOR', '<'], ['OPERATOR', '<=']
    ])) {
      const operador = this.advance();
      const direita = this.parsearExpressao();
      return new AST.NodoExpressaoBinaria(esquerda, operador, direita, operador.line);
    }
    
    throw this.erroParser(this.peek(), "Esperado um operador relacional (==, !=, >, etc.) na condição.");
  }

  /** Ponto de entrada das expressões */
  parsearExpressao() {
    // <Expr> ::= [ "-" ] <Term> { <AddOp> <Term> }
    return this.parsearAdicao();
  }

  /** <Expr> / <ExprTail> (Adição e Subtração) */
  parsearAdicao() {
    // Opcional [ "-"]
    let unarioInicial = null;
    if (this.match('OPERATOR', '-')) {
        unarioInicial = this.anterior();
    }

    let esquerda = this.parsearMultiplicacao();
    
    if (unarioInicial) {
        esquerda = new AST.NodoExpressaoUnaria(unarioInicial, esquerda, unarioInicial.line);
    }

    while (this.verificar('OPERATOR', '+') || this.verificar('OPERATOR', '-')) {
      const operador = this.advance();
      const direita = this.parsearMultiplicacao();
      esquerda = new AST.NodoExpressaoBinaria(esquerda, operador, direita, operador.line);
    }
    return esquerda;
  }

  /** <Term> / <TermTail> (Multiplicação e Divisão) */
  parsearMultiplicacao() {
    let esquerda = this.parsearPrimario(); // <Factor>

    while (this.verificar('OPERATOR', '*') || this.verificar('OPERATOR', '/')) {
      const operador = this.advance();
      const direita = this.parsearPrimario();
      esquerda = new AST.NodoExpressaoBinaria(esquerda, operador, direita, operador.line);
    }
    return esquerda;
  }

  /** <Factor> ::= Ident <FactorTail> | NumeroLiteral | StringLiteral | "(" <Expr> ")" */
  parsearPrimario() {
    const linha = this.peek().line;

    // NumeroLiteral
    if (this.verificar('LITERAL_INTEIRO') || this.verificar('LITERAL_DECIMAL')) {
      const valor = parseFloat(this.advance().value);
      return new AST.NodoExpressaoLiteral(valor, linha);
    }

    // StringLiteral
    if (this.match('LITERAL_STRING')) {
      const valor = this.anterior().value; // O lexer já removeu as aspas
      return new AST.NodoExpressaoLiteral(valor, linha);
    }

    // "(" <Expr> ")"
    if (this.match('DELIMITER', '(')) {
      const expressao = this.parsearExpressao();
      this.consumir('DELIMITER', ')', "Esperado ')' após expressão.");
      return new AST.NodoExpressaoAgrupamento(expressao, linha);
    }

    // Ident <FactorTail>
    if (this.verificar('IDENTIFIER')) {
      const nome = this.advance();
      
      // <FactorTail>
      if (this.match('DELIMITER', '(')) {
        // Chamada de função: Ident "(" <ActParsOpt> ")"
        const argumentos = this.parsearArgumentos();
        this.consumir('DELIMITER', ')', "Esperado ')' após argumentos.");
        return new AST.NodoExpressaoChamada(
          new AST.NodoExpressaoVariavel(nome, nome.line),
          argumentos,
          linha
        );
      } else {
        // Variável: Ident (com <FactorTail> -> ε)
        return new AST.NodoExpressaoVariavel(nome, linha);
      }
    }

    throw this.erroParser(this.peek(), "Esperado expressão (número, string, identificador ou '(').");
  }
}