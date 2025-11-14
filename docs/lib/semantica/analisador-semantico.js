// arquivo: analise/analisadorSemantico.js

import * as AST from '../parser/ast/ast.js';
import { ErroSemantico } from '../codegen/erros.js';
import { Simbolo, TabelaSimbolos } from './tabela-simbolos.js';
import { 
  Tipo, TipoPrimitivo, TipoFuncao, 
  TIPO_INTEIRO, TIPO_NUMERO, TIPO_STRING, TIPO_BOOL, TIPO_VOID, TIPO_ERRO 
} from './tipos.js';

export class AnalisadorSemantico extends AST.VisitorAST {
  constructor() {
    super();
    this.tabela = new TabelaSimbolos();
    this.erros = [];
    this.funcaoAtual = null; // Guarda o 'TipoFuncao' da função sendo analisada
  }

  /** Ponto de entrada */
  analisar(programaNode) {
    // 1ª Passada: Coletar assinaturas de funções globais
    for (const decl of programaNode.declaracoes) {
      if (decl instanceof AST.NodoDeclaracaoFuncao) {
        this.coletarAssinaturaFuncao(decl);
      }
    }
    
    // 2ª Passada: Analisar tudo
    for (const decl of programaNode.declaracoes) {
      decl.aceitar(this);
    }
    
    // Imprime os erros
    if (this.erros.length > 0) {
      console.error("\n=== Erros Semânticos Encontrados ===");
      for (const erro of this.erros) {
        console.error(`Erro [Linha ${erro.linha}]: ${erro.message}`);
      }
    } else {
      console.log("\n Análise semântica concluída sem erros.");
    }
    
    return this.erros.length === 0; // Retorna true se passou
  }
  
  /** Registra um erro semântico. */
  erro(mensagem, linha) {
    this.erros.push(new ErroSemantico(mensagem, linha));
  }
  
  /** 1ª Passada: Apenas registra a função no escopo global. */
  coletarAssinaturaFuncao(nodo) {
    const tiposParams = nodo.parametros.map(p => TIPO_INTEIRO); // Sua linguagem só tem 'inteiro'
    
    // Como a linguagem não tem tipo de retorno, inferimos.
    // Assumimos 'void' por padrão. O 'visitarComandoRetorna'
    // irá atualizar isso se encontrar um retorno com valor.
    const tipoFuncao = new TipoFuncao(tiposParams, TIPO_VOID); 
    
    if (!this.tabela.declarar(nodo.nome, tipoFuncao, nodo.linha)) {
      this.erro(`Função '${nodo.nome.value}' já foi declarada.`, nodo.linha);
    }
  }

  // --- Visitantes (2ª Passada) ---
  
  visitarPrograma(nodo) { /* Não faz nada, 'analisar' controla */ }
  visitarErro(nodo) { /* Não faz nada */ }

  visitarDeclaracaoVariavel(nodo) {
    const tipoDeclarado = TIPO_INTEIRO; // Único tipo em 'var'
    
    let tipoInicializador = null;
    if (nodo.inicializador) {
      tipoInicializador = nodo.inicializador.aceitar(this); // Inferir tipo
    }
    
    // Verifica compatibilidade de tipos na inicialização
    if (tipoInicializador && !tipoDeclarado.eCompativel(tipoInicializador)) {
      this.erro(
        `Tipo '${tipoInicializador.mostrar()}' não pode ser atribuído ao tipo '${tipoDeclarado.mostrar()}'.`, 
        nodo.linha
      );
    }
    
    // Declara na tabela de símbolos
    if (!this.tabela.declarar(nodo.nome, tipoDeclarado, nodo.linha)) {
      this.erro(`Variável '${nodo.nome.value}' já foi declarada neste escopo.`, nodo.linha);
    }
    
    // Marca como inicializada se tiver valor
    if (nodo.inicializador) {
      this.tabela.marcarInicializado(nodo.nome);
    }
  }

  visitarDeclaracaoFuncao(nodo) {
    // Busca o símbolo da 1ª passada
    const simbolo = this.tabela.buscar(nodo.nome);
    this.funcaoAtual = simbolo.tipo;
    
    // Entra no escopo da função
    this.tabela.entrarEscopo();
    
    // Declara os parâmetros no novo escopo
    for (let i = 0; i < nodo.parametros.length; i++) {
      const param = nodo.parametros[i];
      const tipoParam = this.funcaoAtual.tiposParams[i];
      
      if (!this.tabela.declarar(param.nome, tipoParam, param.nome.line)) {
        this.erro(`Parâmetro '${param.nome.value}' já foi declarado.`, param.nome.line);
      }
      this.tabela.marcarInicializado(param.nome); // Parâmetros estão sempre inicializados
    }
    
    // Analisa o corpo
    nodo.corpo.aceitar(this);
    
    // Sai do escopo
    this.tabela.sairEscopo();
    this.funcaoAtual = null; // Sai do "contexto de função"
  }

  visitarComandoBloco(nodo) {
    this.tabela.entrarEscopo();
    
    for (const decl of nodo.declaracoes) {
      decl.aceitar(this);
    }
    for (const cmd of nodo.comandos) {
      cmd.aceitar(this);
    }
    
    this.tabela.sairEscopo();
  }

  visitarComandoSe(nodo) {
    const tipoCond = nodo.condicao.aceitar(this);
    
    // Condições devem ser booleanas (resultado de <, ==, etc.)
    if (tipoCond.mostrar() !== 'bool') {
      this.erro(`Condição do 'se' deve ser booleana, mas é '${tipoCond.mostrar()}'.`, nodo.linha);
    }
    
    nodo.blocoEntao.aceitar(this);
    if (nodo.blocoSenao) {
      nodo.blocoSenao.aceitar(this);
    }
  }

  visitarComandoRetorna(nodo) {
    if (this.funcaoAtual === null) {
      this.erro("'retorna' só pode ser usado dentro de uma função.", nodo.linha);
      return;
    }
    
    let tipoRetorno = TIPO_VOID;
    if (nodo.valor) {
      tipoRetorno = nodo.valor.aceitar(this); // Inferir tipo do valor de retorno
    }
    
    const tipoEsperado = this.funcaoAtual.tipoRetorno;
    
    // 1. Se o tipo da função ainda é 'void' (default),
    //    este 'retorna' define o tipo da função.
    if (tipoEsperado.mostrar() === 'void' && tipoRetorno.mostrar() !== 'void') {
      this.funcaoAtual.tipoRetorno = tipoRetorno;
    }
    // 2. Se o tipo da função já foi definido (por outro 'retorna'),
    //    verifica se este 'retorna' é compatível.
    else if (!tipoEsperado.eCompativel(tipoRetorno)) {
      this.erro(
        `Tipo de retorno '${tipoRetorno.mostrar()}' é incompatível com o tipo '${tipoEsperado.mostrar()}' inferido anteriormente.`, 
        nodo.linha
      );
    }
  }

  visitarComandoEscreva(nodo) {
    // Apenas verifica se as expressões são válidas
    for (const arg of nodo.argumentos) {
      arg.aceitar(this);
    }
  }

  visitarComandoExpressao(nodo) {
    nodo.expressao.aceitar(this); // Apenas visita (ex: atribuição ou chamada)
  }

  visitarComandoVazio(nodo) { /* Não faz nada */ }

  // --- Visitantes (Expressões) ---
  // Retornam um objeto 'Tipo'

  visitarExpressaoLiteral(nodo) {
    if (typeof nodo.valor === 'string') return TIPO_STRING;
    if (typeof nodo.valor === 'number') return TIPO_NUMERO;
    return TIPO_ERRO;
  }

  visitarExpressaoVariavel(nodo) {
    const simbolo = this.tabela.buscar(nodo.nome);
    if (!simbolo) {
      this.erro(`Variável '${nodo.nome.value}' não foi declarada.`, nodo.linha);
      return TIPO_ERRO;
    }
    
    // Verifica se foi inicializada ANTES de ser usada
    if (!simbolo.inicializado) {
      this.erro(`Variável '${nodo.nome.value}' pode estar sendo usada antes de ser inicializada.`, nodo.linha);
      // Não retorna TIPO_ERRO, pois o tipo é conhecido
    }
    
    return simbolo.tipo;
  }
  
  visitarExpressaoAgrupamento(nodo) {
    return nodo.expressao.aceitar(this); // Retorna o tipo da expressão interna
  }

  visitarExpressaoAtribuicao(nodo) {
    const simbolo = this.tabela.buscar(nodo.nome);
    if (!simbolo) {
      this.erro(`Variável '${nodo.nome.value}' não foi declarada.`, nodo.linha);
      return TIPO_ERRO;
    }
    
    const tipoVariavel = simbolo.tipo;
    const tipoValor = nodo.valor.aceitar(this);
    
    if (!tipoVariavel.eCompativel(tipoValor)) {
      this.erro(
        `Tipo '${tipoValor.mostrar()}' não pode ser atribuído ao tipo '${tipoVariavel.mostrar()}'.`, 
        nodo.linha
      );
      return TIPO_ERRO;
    }
    
    this.tabela.marcarInicializado(nodo.nome);
    return tipoVariavel;
  }

  visitarExpressaoUnaria(nodo) {
    const tipoOperando = nodo.operando.aceitar(this);
    
    if (nodo.operador.value === '-') {
      if (!TIPO_NUMERO.eCompativel(tipoOperando)) {
        this.erro(`Operador unário '-' requer um tipo numérico, mas recebeu '${tipoOperando.mostrar()}'.`, nodo.linha);
        return TIPO_ERRO;
      }
      return tipoOperando; // Retorna o mesmo tipo (numero ou inteiro)
    }
    
    this.erro(`Operador unário desconhecido '${nodo.operador.value}'.`, nodo.linha);
    return TIPO_ERRO;
  }

  visitarExpressaoBinaria(nodo) {
    const op = nodo.operador.value;
    const tipoEsq = nodo.esquerda.aceitar(this);
    const tipoDir = nodo.direita.aceitar(this);

    // Operadores Aritméticos: +, -, *, /
    if (['+', '-', '*', '/'].includes(op)) {
      if (!TIPO_NUMERO.eCompativel(tipoEsq)) {
        this.erro(`Operador '${op}' requer operando esquerdo numérico, mas recebeu '${tipoEsq.mostrar()}'.`, nodo.linha);
      }
      if (!TIPO_NUMERO.eCompativel(tipoDir)) {
        this.erro(`Operador '${op}' requer operando direito numérico, mas recebeu '${tipoDir.mostrar()}'.`, nodo.linha);
      }
      return TIPO_NUMERO; // Resultado de aritmética é sempre 'numero'
    }
    
    // Operadores Relacionais: >, >=, <, <=, ==, !=
    if (['>', '>=', '<', '<=', '==', '!='].includes(op)) {
      if (!tipoEsq.eCompativel(tipoDir)) {
        this.erro(`Operador '${op}' não pode comparar tipos '${tipoEsq.mostrar()}' e '${tipoDir.mostrar()}'.`, nodo.linha);
      }
      return TIPO_BOOL; // Resultado de comparação é sempre booleano
    }
    
    this.erro(`Operador binário desconhecido '${op}'.`, nodo.linha);
    return TIPO_ERRO;
  }

  visitarExpressaoChamada(nodo) {
    // 'funcao' em NodoExpressaoChamada é um NodoExpressaoVariavel
    const nomeFuncao = nodo.funcao.nome; 
    const simbolo = this.tabela.buscar(nomeFuncao);

    if (!simbolo) {
      this.erro(`Função '${nomeFuncao.value}' não foi declarada.`, nodo.linha);
      return TIPO_ERRO;
    }
    
    if (!(simbolo.tipo instanceof TipoFuncao)) {
      this.erro(`'${nomeFuncao.value}' não é uma função, é do tipo '${simbolo.tipo.mostrar()}'.`, nodo.linha);
      return TIPO_ERRO;
    }
    
    const tipoFuncao = simbolo.tipo;
    const args = nodo.argumentos;
    const params = tipoFuncao.tiposParams;
    
    // Verificar número de argumentos
    if (args.length !== params.length) {
      this.erro(
        `Função '${nomeFuncao.value}' espera ${params.length} argumentos, mas recebeu ${args.length}.`, 
        nodo.linha
      );
      return tipoFuncao.tipoRetorno; // Tenta continuar mesmo com erro
    }
    
    // Verificar tipo de cada argumento
    for (let i = 0; i < args.length; i++) {
      const tipoArg = args[i].aceitar(this);
      const tipoParam = params[i];
      if (!tipoParam.eCompativel(tipoArg)) {
        this.erro(
          `Argumento ${i+1} da função '${nomeFuncao.value}' esperava tipo '${tipoParam.mostrar()}', mas recebeu '${tipoArg.mostrar()}'.`, 
          args[i].linha
        );
      }
    }
    
    return tipoFuncao.tipoRetorno;
  }
}