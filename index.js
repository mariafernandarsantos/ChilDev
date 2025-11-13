import { analisadorLexico } from './docs/lib/lexer/analisador-lexico.js'; 

import { Parser } from './docs/lib/parser/descendente/parser.js';

import { Interpretador } from './docs/lib/codegen/interpretador.js';

import fs from 'fs';

function main() {
  
  const codigoFonte = `
    funcao fibonacci(inteiro n) {
      // 1. Declarações de Variáveis
      var inteiro a = 0;
      var inteiro b = 0;

      // 2. Comandos
      se (n <= 1) {
        retorna n;
      }
      
      a = fibonacci(n - 1);
      b = fibonacci(n - 2);
      
      retorna a + b;
    }

    // Código global
    var inteiro i = 8;
    var inteiro resultadoFib = fibonacci(i);
    
    escreva("O fibonacci de", i, "e:", resultadoFib);
    escreva("Outro teste:", (10 + 2) * 3);
  `;
  
  // 1. Léxico
  let tokens;
  try {
    tokens = analisadorLexico(codigoFonte);
  } catch (e) {
    console.error("Erro Léxico:", e.message);
    return;
  }
  
  // 2. Parser
  const parser = new Parser(tokens);
  const ast = parser.parsearPrograma();

  if (parser.teveErro) {
    console.error("Erros de Parsing encontrados. Abortando.");
    return;
  }
  
  // 3. Interpretador
  const interpretador = new Interpretador();
  console.log("Executando interpretador...");
  interpretador.interpretar(ast);
}

main();