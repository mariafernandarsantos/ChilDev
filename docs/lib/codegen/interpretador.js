import * as AST from '../parser/ast/ast.js';
import { Ambiente } from './ambiente.js';
import { ErroRuntime, ErroRetorno } from './erros.js';

// Representação de uma função em tempo de execução
class FuncaoInterpretada {
  constructor(declaracao, closure) {
    this.declaracao = declaracao; // O nó da AST da função
    this.closure = closure;     // O ambiente onde a função foi *definida*
  }
}

export class Interpretador extends AST.VisitorAST {
  constructor() {
    super();
    // O ambiente global
    this.ambiente = new Ambiente();
  }

  /** Ponto de entrada principal */
  interpretar(programa) {
    try {
      programa.aceitar(this);
    } catch (e) {
      if (e instanceof ErroRuntime) {
        console.error(`Erro de Runtime [Linha ${e.token.line}]: ${e.message}`);
      } else {
        throw e; // Re-lança erros inesperados
      }
    }
  }

  // Helpers 

  /** Executa um bloco de código em um novo escopo */
  executarBloco(declaracoes, comandos, ambiente) {
    const ambienteAnterior = this.ambiente;
    try {
      this.ambiente = ambiente; // Entra no novo escopo
      
      // 1. Executa todas as declarações de 'var'
      for (const decl of declaracoes) {
        decl.aceitar(this);
      }
      // 2. Executa todos os comandos
      for (const cmd of comandos) {
        cmd.aceitar(this);
      }
    } finally {
      this.ambiente = ambienteAnterior; // Sai do escopo, aconteça o que acontecer
    }
  }

  /** Verifica se um valor é "verdadeiro" (para 'se') */
  isVerdadeiro(valor) {
    if (valor === null) return false;
    if (typeof valor === 'boolean') return valor;
    if (typeof valor === 'number') return valor !== 0;
    if (typeof valor === 'string') return valor.length > 0;
    return true; // Funções e outros objetos são "verdadeiros"
  }

  // Visitantes (Declarações e Comandos)

  visitarPrograma(nodo) {
    // Simplesmente executa todas as declarações no escopo global
    for (const declaracao of nodo.declaracoes) {
      declaracao.aceitar(this);
    }
  }
  
  visitarDeclaracaoFuncao(nodo) {
    // Cria a "cápsula" da função (código + escopo)
    const funcao = new FuncaoInterpretada(nodo, this.ambiente);
    // Define a função no ambiente atual
    this.ambiente.definir(nodo.nome, funcao);
  }

  visitarDeclaracaoVariavel(nodo) {
    let valor = null;
    if (nodo.inicializador) {
      valor = nodo.inicializador.aceitar(this); // Avalia a expressão
    }
    this.ambiente.definir(nodo.nome, valor); // Define a variável
  }

  visitarComandoBloco(nodo) {
    // Cria um *novo* escopo (ambiente) filho do atual
    this.executarBloco(nodo.declaracoes, nodo.comandos, new Ambiente(this.ambiente));
  }

  visitarComandoSe(nodo) {
    const condicao = nodo.condicao.aceitar(this);
    if (this.isVerdadeiro(condicao)) {
      nodo.blocoEntao.aceitar(this);
    } else if (nodo.blocoSenao) {
      nodo.blocoSenao.aceitar(this);
    }
  }

  visitarComandoRetorna(nodo) {
    let valor = null;
    if (nodo.valor) {
      valor = nodo.valor.aceitar(this);
    }
    // Lança a exceção de controle de fluxo
    throw new ErroRetorno(valor);
  }

  visitarComandoEscreva(nodo) {
    // Avalia todos os argumentos e imprime no console
    const valores = nodo.argumentos.map(arg => arg.aceitar(this));
    console.log(valores.map(String).join(' ')); // Converte para string e junta
  }

  visitarComandoExpressao(nodo) {
    // Apenas avalia a expressão (ex: atribuição ou chamada de função)
    nodo.expressao.aceitar(this);
  }
  
  visitarComandoVazio(nodo) {
    // ; - Não faz nada
    return null;
  }

  // Visitantes (Expressões)

  visitarExpressaoLiteral(nodo) {
    return nodo.valor; // Retorna o valor literal (ex: 5, "ola")
  }

  visitarExpressaoVariavel(nodo) {
    // Busca a variável no ambiente
    return this.ambiente.obter(nodo.nome);
  }

  visitarExpressaoAtribuicao(nodo) {
    // 1. Avalia o valor da direita
    const valor = nodo.valor.aceitar(this);
    // 2. Atribui no ambiente
    this.ambiente.atribuir(nodo.nome, valor);
    // 3. Atribuição retorna o próprio valor
    return valor;
  }
  
  visitarExpressaoAgrupamento(nodo) {
    // Apenas avalia a expressão interna
    return nodo.expressao.aceitar(this);
  }

  visitarExpressaoBinaria(nodo) {
    const esquerda = nodo.esquerda.aceitar(this);
    const direita = nodo.direita.aceitar(this);

    // TODO: Adicionar checagem de tipos (ex: ambos são números)
    
    switch (nodo.operador.value) {
      case '+': return esquerda + direita;
      case '-': return esquerda - direita;
      case '*': return esquerda * direita;
      case '/': return esquerda / direita;
      // Relacionais
      case '==': return esquerda === direita;
      case '!=': return esquerda !== direita;
      case '>':  return esquerda > direita;
      case '>=': return esquerda >= direita;
      case '<':  return esquerda < direita;
      case '<=': return esquerda <= direita;
    }
    
    throw new ErroRuntime(nodo.operador, "Operador binário desconhecido.");
  }
  
  visitarExpressaoUnaria(nodo) {
    const operando = nodo.operando.aceitar(this);
    if (nodo.operador.value === '-') {
      return -operando; // Negação numérica
    }
    // TODO: Adicionar '!' (negação lógica) se sua linguagem tiver
    throw new ErroRuntime(nodo.operador, "Operador unário desconhecido.");
  }

  visitarExpressaoChamada(nodo) {
    // 1. Descobre o que está sendo chamado (deve ser uma função)
    const callee = nodo.funcao.aceitar(this);

    if (!(callee instanceof FuncaoInterpretada)) {
      throw new ErroRuntime(nodo.linha, "Só é possível chamar funções.");
    }
    
    // 2. Avalia os argumentos
    const argumentos = nodo.argumentos.map(arg => arg.aceitar(this));
    
    // 3. Verifica o número de argumentos
    const params = callee.declaracao.parametros;
    if (argumentos.length !== params.length) {
      throw new ErroRuntime(nodo.linha, 
        `Esperado ${params.length} argumentos, mas recebeu ${argumentos.length}.`);
    }

    // 4. Cria o ambiente (escopo) da função
    // O pai é o 'closure' (onde a função foi definida), não onde foi chamada!
    const ambienteFuncao = new Ambiente(callee.closure);

    // 5. "Preenche" o escopo com os argumentos
    for (let i = 0; i < params.length; i++) {
      ambienteFuncao.definir(params[i].nome, argumentos[i]);
    }

    // 6. Executa a função
    try {
      // Usamos o 'executarBloco' para rodar o corpo da função
      // Note que passamos 'corpo.declaracoes' e 'corpo.comandos'
      this.executarBloco(
        callee.declaracao.corpo.declaracoes,
        callee.declaracao.corpo.comandos, 
        ambienteFuncao
      );
    } catch (e) {
      if (e instanceof ErroRetorno) {
        // Se pegarmos um 'retorna', paramos a execução e retornamos o valor
        return e.valor;
      } else {
        throw e; // Lança outros erros
      }
    }
    
    // Se a função não tiver 'retorna', ela retorna 'null' (implícito)
    return null;
  }

  visitarErro(nodo) {
    // Não faz nada com um nó de erro
    return null;
  }
}