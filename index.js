import { analisadorLexico } from './docs/lib/lexer/analisador-lexico.js'; 
import { Parser } from './docs/lib/parser/descendente/parser.js';
import { AnalisadorSemantico } from './docs/lib/semantica/analisador-semantico.js';
import { GeradorLLVM } from './docs/lib/codegen/geradorLLVM.js';
import fs from 'fs';

function main() {
  const codigoFonte = `
    // 1. Teste de Recursao e Inteiros
    funcao fatorial(inteiro n): inteiro {
      se (n <= 1) {
        retorna 1;
      }
      // Teste de subtracao e multiplicacao
      retorna n * fatorial(n - 1);
    }

    // 2. Teste de Decimais e Operacoes Matematicas
    funcao calcularMedia(decimal notaA, decimal notaB): decimal {
      // Teste de precedencia
      var decimal soma = notaA + notaB;
      
      // --- CORREÇÃO AQUI: 'return' virou 'retorna' ---
      retorna soma / 2.0;
    }

    // 3. Teste de String e Logica Booleana
    funcao obterSituacao(decimal media): string {
      se (media >= 6.0) {
        retorna "Aprovado";
      }
      retorna "Reprovado";
    }

    // --- PONTO DE ENTRADA ---
    funcao main(): inteiro {
       escreva("=== INICIANDO TESTE COMPLETO ===");

       // --- Cenario 1: Matematica Decimal ---
       var decimal n1 = 8.5;
       var decimal n2 = 4.5;
       var decimal media = calcularMedia(n1, n2);
       
       escreva("Nota 1:", n1);
       escreva("Nota 2:", n2);
       escreva("Media Final:", media);

       // --- Cenario 2: Strings e IF/ELSE ---
       var string status = obterSituacao(media);
       escreva("Situacao do Aluno:", status);

       // --- Cenario 3: Inteiros e Recursao ---
       var inteiro numero = 5;
       var inteiro resultadoFat = fatorial(numero);
       
       escreva("Fatorial de ", numero, "eh: ", resultadoFat);

       // --- Cenario 4: Conversao Implicita ---
       var decimal testeMisto = 10 + 2.5 * 2; 
       escreva("Teste de Expressao (10 + 2.5 * 2):", testeMisto);

       escreva("=== FIM DO TESTE ===");
       
       retorna 0;
    }
  `;
  
  console.log("1. [Léxico] Iniciando...");
  let tokens;
  try {
    tokens = analisadorLexico(codigoFonte);
  } catch (e) {
    console.error("❌ Erro Léxico:", e.message);
    return;
  }
  
  console.log("2. [Sintático] Iniciando...");
  const parser = new Parser(tokens);
  const ast = parser.parsearPrograma();

  if (parser.teveErro) {
    console.error("❌ Erros de Parsing encontrados. Verifique as mensagens acima.");
    return;
  }
  console.log("   -> Sintaxe OK!");
  
  console.log("3. [Semântico] Iniciando...");
  const analisador = new AnalisadorSemantico();
  if (!analisador.analisar(ast)) { 
      console.error("❌ Erros Semânticos encontrados.");
      return; 
  }
  console.log("   -> Tipos OK!");
  
  console.log("4. [Gerador LLVM] Gerando código...");
  const gerador = new GeradorLLVM();
  gerador.visitarPrograma(ast);
  
  const codigoLLVM = gerador.obterCodigo();
  fs.writeFileSync('saida.ll', codigoLLVM);
  
  console.log("\n✅ Sucesso Total! Arquivo 'saida.ll' gerado.");
  console.log("Execute: 'clang saida.ll -o programa.exe' e depois './programa.exe'");
}

main();