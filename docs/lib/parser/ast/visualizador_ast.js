import * as AST from './ast.js';

export class VisualizadorAST extends AST.VisitorAST {
  constructor() {
    super();
    this._indentacao = 0;
  }

  _indent() { return '  '.repeat(this._indentacao); }

  visualizar(nodo) {
    return nodo.aceitar(this);
  }

  visitarPrograma(nodo) {
    const buffer = ['Programa:'];
    this._indentacao++;
    for (const declaracao of nodo.declaracoes) {
      buffer.push(`${this._indent()}${declaracao.aceitar(this)}`);
    }
    this._indentacao--;
    return buffer.join('\n');
  }

  visitarDeclaracaoFuncao(nodo) {
    const buffer = [];
    const params = nodo.parametros.map(p => `${p.tipo.value} ${p.nome.value}`).join(', ');
    buffer.push(`Funcao ${nodo.nome.value}(${params}):`);
    
    this._indentacao++;
    buffer.push(nodo.corpo.aceitar(this));
    this._indentacao--;

    return buffer.join('\n');
  }

  visitarDeclaracaoVariavel(nodo) {
    let result = `Var ${nodo.tipo.value} ${nodo.nome.value}`;
    if (nodo.inicializador) {
      result += ` = ${nodo.inicializador.aceitar(this)}`;
    }
    return result;
  }
  
  visitarComandoBloco(nodo) {
    const buffer = [`Bloco (l. ${nodo.linha}):`];
    this._indentacao++;
    if (nodo.declaracoes.length > 0) {
        buffer.push(`${this._indent()}Declaracoes:`);
        this._indentacao++;
        for (const decl of nodo.declaracoes) {
            buffer.push(`${this._indent()}${decl.aceitar(this)}`);
        }
        this._indentacao--;
    }
    if (nodo.comandos.length > 0) {
        buffer.push(`${this._indent()}Comandos:`);
        this._indentacao++;
        for (const cmd of nodo.comandos) {
            buffer.push(`${this._indent()}${cmd.aceitar(this)}`);
        }
        this._indentacao--;
    }
    this._indentacao--;
    return buffer.join('\n');
  }

  visitarComandoSe(nodo) {
    const buffer = [`If (l. ${nodo.linha}):`];
    this._indentacao++;
    buffer.push(`${this._indent()}Cond: ${nodo.condicao.aceitar(this)}`);
    buffer.push(`${this._indent()}Entao:`);
    this._indentacao++;
    buffer.push(`${this._indent()}${nodo.blocoEntao.aceitar(this)}`);
    this._indentacao--;
    if (nodo.blocoSenao) {
      buffer.push(`${this._indent()}Senao:`);
      this._indentacao++;
      buffer.push(`${this._indent()}${nodo.blocoSenao.aceitar(this)}`);
      this._indentacao--;
    }
    this._indentacao--;
    return buffer.join('\n');
  }
  
  visitarComandoRetorna(nodo) {
    if (nodo.valor) {
      return `Return (l. ${nodo.linha}): ${nodo.valor.aceitar(this)}`;
    }
    return `Return (l. ${nodo.linha})`;
  }
  
  visitarComandoEscreva(nodo) {
    const args = nodo.argumentos.map(arg => arg.aceitar(this)).join(', ');
    return `Escreva (l. ${nodo.linha}): (${args})`;
  }

  visitarComandoExpressao(nodo) {
    return `ComandoExpr: ${nodo.expressao.aceitar(this)}`;
  }

  visitarComandoVazio(nodo) {
      return `ComandoVazio (l. ${nodo.linha})`;
  }

  visitarExpressaoLiteral(nodo) {
    if (typeof nodo.valor === 'string') {
      return `"${nodo.valor}"`;
    }
    return `${nodo.valor}`;
  }

  visitarExpressaoVariavel(nodo) {
    return `Var(${nodo.nome.value})`;
  }

  visitarExpressaoBinaria(nodo) {
    return `(${nodo.esquerda.aceitar(this)} ${nodo.operador.value} ${nodo.direita.aceitar(this)})`;
  }

  visitarExpressaoUnaria(nodo) {
    return `(${nodo.operador.value}${nodo.operando.aceitar(this)})`;
  }

  visitarExpressaoAtribuicao(nodo) {
    return `(Atrib: ${nodo.nome.value} = ${nodo.valor.aceitar(this)})`;
  }

  visitarExpressaoChamada(nodo) {
    const args = nodo.argumentos.map(arg => arg.aceitar(this)).join(', ');
    return `Chamada(${nodo.funcao.aceitar(this)}(${args}))`;
  }

  visitarExpressaoAgrupamento(nodo) {
    return `(Grupo: ${nodo.expressao.aceitar(this)})`;
  }
  
  visitarErro(nodo) {
    return '[ERRO DE PARSING]';
  }
}