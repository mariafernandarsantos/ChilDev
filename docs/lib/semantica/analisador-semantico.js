// arquivo: analise/analisadorSemantico.js

import * as AST from '../parser/ast/ast.js';
import { ErroSemantico } from '../codegen/erros.js';
import { Simbolo, TabelaSimbolos } from './tabela-simbolos.js';
import { 
  Tipo, TipoArray, TipoPrimitivo, TipoFuncao, 
  TIPO_INTEIRO, TIPO_DECIMAL, TIPO_STRING, TIPO_VOID, TIPO_NUMERO, TIPO_BOOL, TIPO_ERRO
} from './tipos.js';

export class AnalisadorSemantico extends AST.VisitorAST {
  constructor() {
    super();
    this.tabela = new TabelaSimbolos();
    this.erros = [];
    this.funcaoAtual = null; 
  }

  analisar(programaNode) {
    // 1ª Passada: Coletar assinaturas
    for (const decl of programaNode.declaracoes) {
      if (decl instanceof AST.NodoDeclaracaoFuncao) {
        this.coletarAssinaturaFuncao(decl);
      }
    }
    // 2ª Passada: Analisar corpos
    for (const decl of programaNode.declaracoes) {
      decl.aceitar(this);
    }
    
    if (this.erros.length > 0) {
      console.error("\n=== Erros Semânticos Encontrados ===");
      for (const erro of this.erros) {
        console.error(`Erro [Linha ${erro.linha}]: ${erro.message}`);
      }
    } else {
      console.log("\n✓ Análise semântica concluída sem erros.");
    }
    return this.erros.length === 0;
  }

  erro(mensagem, linha) {
    this.erros.push(new ErroSemantico(mensagem, linha));
  }

  /** Converte Token AST -> Tipo Semântico */
  converterTipoAST(tokenTipo) {
    let nome = tokenTipo.value;
    let dimensoes = 0;
    while (nome.endsWith('[]')) {
      dimensoes++;
      nome = nome.substring(0, nome.length - 2);
    }

    let tipoBase = TIPO_ERRO;
    if (nome === 'inteiro') tipoBase = TIPO_INTEIRO;
    else if (nome === 'decimal') tipoBase = TIPO_DECIMAL;
    else if (nome === 'string') tipoBase = TIPO_STRING;
    else if (nome === 'void') tipoBase = TIPO_VOID;

    let tipoFinal = tipoBase;
    for (let i = 0; i < dimensoes; i++) {
      tipoFinal = new TipoArray(tipoFinal);
    }

    return tipoFinal;
  }

  coletarAssinaturaFuncao(nodo) {
    const tiposParams = nodo.parametros.map(p => this.converterTipoAST(p.tipo));
    const tipoRetorno = this.converterTipoAST(nodo.tipoRetorno);
    const tipoFuncao = new TipoFuncao(tiposParams, tipoRetorno);
    
    if (!this.tabela.declarar(nodo.nome, tipoFuncao, nodo.linha)) {
      this.erro(`Função '${nodo.nome.value}' já foi declarada.`, nodo.linha);
    }
  }

  // --- Visitantes ---

  visitarPrograma(nodo) {}
  visitarErro(nodo) {}

  visitarDeclaracaoVariavel(nodo) {
    const tipoDeclarado = this.converterTipoAST(nodo.tipo);
    
    let tipoInicializador = null;
    if (nodo.inicializador) {
      tipoInicializador = nodo.inicializador.aceitar(this);
    }
    
    if (tipoInicializador && !tipoDeclarado.eCompativel(tipoInicializador)) {
      this.erro(`Tipo '${tipoInicializador.mostrar()}' não pode ser atribuído ao tipo '${tipoDeclarado.mostrar()}'.`, nodo.linha);
    }
    
    if (!this.tabela.declarar(nodo.nome, tipoDeclarado, nodo.linha)) {
      this.erro(`Variável '${nodo.nome.value}' já foi declarada neste escopo.`, nodo.linha);
    }
    if (nodo.inicializador) {
      this.tabela.marcarInicializado(nodo.nome);
    }
  }

  visitarDeclaracaoFuncao(nodo) {
    const simbolo = this.tabela.buscar(nodo.nome);
    this.funcaoAtual = simbolo.tipo;
    
    this.tabela.entrarEscopo();
    
    for (let i = 0; i < nodo.parametros.length; i++) {
      const param = nodo.parametros[i];
      const tipoParam = this.funcaoAtual.tiposParams[i];
      if (!this.tabela.declarar(param.nome, tipoParam, param.nome.line)) {
        this.erro(`Parâmetro '${param.nome.value}' já foi declarado.`, param.nome.line);
      }
      this.tabela.marcarInicializado(param.nome);
    }
    
    nodo.corpo.aceitar(this);
    this.tabela.sairEscopo();
    this.funcaoAtual = null;
  }

  visitarComandoBloco(nodo) {
    this.tabela.entrarEscopo();
    for (const instr of nodo.instrucoes) instr.aceitar(this);
    this.tabela.sairEscopo();
  }

  visitarComandoSe(nodo) {
    const tipoCond = nodo.condicao.aceitar(this);
    if (tipoCond.mostrar() !== 'bool') {
      this.erro(`Condição do 'se' deve ser booleana, mas é '${tipoCond.mostrar()}'.`, nodo.linha);
    }
    nodo.blocoEntao.aceitar(this);
    if (nodo.blocoSenao) nodo.blocoSenao.aceitar(this);
  }

  visitarComandoRetorna(nodo) {
    if (this.funcaoAtual === null) {
      this.erro("'retorna' só pode ser usado dentro de uma função.", nodo.linha);
      return;
    }
    
    let tipoRetornoEncontrado = TIPO_VOID;
    if (nodo.valor) {
      tipoRetornoEncontrado = nodo.valor.aceitar(this);
    }
    
    const tipoEsperado = this.funcaoAtual.tipoRetorno;
    
    if (tipoEsperado.mostrar() === 'void') {
        if (tipoRetornoEncontrado.mostrar() !== 'void') {
            this.erro(`Função 'void' não pode retornar valor.`, nodo.linha);
        }
    }
    else if (!tipoEsperado.eCompativel(tipoRetornoEncontrado)) {
      this.erro(
        `Função declarada com retorno '${tipoEsperado.mostrar()}', mas tentou retornar '${tipoRetornoEncontrado.mostrar()}'.`, 
        nodo.linha
      );
    }
  }

  visitarComandoEscreva(nodo) {
    for (const arg of nodo.argumentos) arg.aceitar(this);
  }
  visitarComandoExpressao(nodo) { nodo.expressao.aceitar(this); }
  visitarComandoVazio(nodo) {}

  // --- Expressões ---

  visitarExpressaoLiteral(nodo) {
    if (typeof nodo.valor === 'string') return TIPO_STRING;
    if (typeof nodo.valor === 'number') return TIPO_NUMERO; // Serve para int e float
    return TIPO_ERRO;
  }

  visitarExpressaoVariavel(nodo) {
    const simbolo = this.tabela.buscar(nodo.nome);
    if (!simbolo) {
      this.erro(`Variável '${nodo.nome.value}' não declarada.`, nodo.linha);
      return TIPO_ERRO;
    }
    if (!simbolo.inicializado) this.erro(`Variável '${nodo.nome.value}' não inicializada.`, nodo.linha);
    return simbolo.tipo;
  }

  visitarExpressaoAgrupamento(nodo) { return nodo.expressao.aceitar(this); }

  visitarExpressaoAtribuicao(nodo) {
    const simbolo = this.tabela.buscar(nodo.nome);
    if (!simbolo) return TIPO_ERRO;
    const tipoValor = nodo.valor.aceitar(this);
    if (!simbolo.tipo.eCompativel(tipoValor)) {
      this.erro(`Incompatibilidade: '${tipoValor.mostrar()}' não cabe em '${simbolo.tipo.mostrar()}'.`, nodo.linha);
    }
    this.tabela.marcarInicializado(nodo.nome);
    return simbolo.tipo;
  }

  visitarExpressaoUnaria(nodo) {
      return nodo.operando.aceitar(this); 
  }

  visitarExpressaoBinaria(nodo) {
      const op = nodo.operador.value;
      
      // 1. Obtém os tipos dos operandos e guarda nas variáveis corretas
      const tipoEsq = nodo.esquerda.aceitar(this);
      const tipoDir = nodo.direita.aceitar(this);

      // Aritmética (+, -, *, /)
      if (['+', '-', '*', '/'].includes(op)) {
          if (!TIPO_NUMERO.eCompativel(tipoEsq) || !TIPO_NUMERO.eCompativel(tipoDir)) {
               this.erro(`Operador '${op}' requer números.`, nodo.linha);
               return TIPO_ERRO;
          }
          
          // Inferência: Se algum dos dois for 'decimal', o resultado é 'decimal'
          if (tipoEsq.mostrar() === 'decimal' || tipoDir.mostrar() === 'decimal') {
              return TIPO_DECIMAL;
          }
          // Se ambos forem inteiros (ou literais numéricos), retorna número genérico ou inteiro
          return TIPO_INTEIRO; 
      }
      
      // Relacionais (>, <, ==, etc)
      if (['>', '>=', '<', '<=', '==', '!='].includes(op)) {
          if (!tipoEsq.eCompativel(tipoDir)) {
            this.erro(`Tipos incompatíveis na comparação.`, nodo.linha);
          }
          return TIPO_BOOL;
      }
      
      return TIPO_ERRO;
  }

  visitarExpressaoChamada(nodo) {
      const s = this.tabela.buscar(nodo.funcao.nome);
      if(!s || !(s.tipo instanceof TipoFuncao)) return TIPO_ERRO;
      return s.tipo.tipoRetorno;
  }
}