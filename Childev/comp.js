/**
 * Tokenizer para a linguagem Childev
 *
 * @param {string} input O código-fonte a ser tokenizado.
 * @returns {Array<Object>} Uma lista de tokens.
 */
function tokenizer(input) {
    // Lista de todas as palavras-chave da linguagem para consulta rápida.
    const KEYWORDS = new Set([
      'var', 'escreva', 'se', 'senao', 'enquanto', 'para', 'de', 'ate',
      'inteiro', 'decimal', 'texto', 'booleano', 'verdadeiro', 'falso',
      'e', 'ou', 'nao', 'funcao', 'retorne'
    ]);
  
    let current = 0;
    let line = 1;
    let column = 1;
    const tokens = [];
  
    while (current < input.length) {
      let char = input[current];
      
      // 1. Ignorar espaços em branco, tabulações e quebras de linha
      if (/\s/.test(char)) {
        if (char === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
        current++;
        continue;
      }
  
      // 2. Comentários (devem vir antes dos operadores para tratar '//' e '///')
      if (char === '/') {
        // Comentário de bloco: /// ... ///
        if (input.substring(current, current + 3) === '///') {
          let value = '///';
          current += 3;
          column += 3;
          while (input.substring(current, current + 3) !== '///' && current < input.length) {
            if(input[current] === '\n') {
              line++;
              column = 1;
            } else {
              column++;
            }
            value += input[current];
            current++;
          }
          if (input.substring(current, current + 3) === '///') {
            value += '///';
            current += 3;
            column += 3;
          }
          tokens.push({ type: 'COMMENT_BLOCK', value, line, column });
          continue;
        }
        // Comentário de linha: // ...
        if (input.substring(current, current + 2) === '//') {
          let value = '//';
          current += 2;
          column += 2;
          while (input[current] !== '\n' && current < input.length) {
            value += input[current];
            current++;
            column++;
          }
          tokens.push({ type: 'COMMENT_LINE', value, line, column });
          continue;
        }
      }
  
      // 3. Delimitadores e Operadores (de múltiplos caracteres primeiro)
      const OPERATORS = ['==', '!=', '>=', '<=', '=>', ':=', '/=', '<>', '**', '=', '+', '-', '*', '/', '>', '<', '&'];
      for (const op of OPERATORS) {
        if (input.startsWith(op, current)) {
          tokens.push({ type: 'OPERATOR', value: op, line, column });
          current += op.length;
          column += op.length;
          char = null; // Marca que já processamos
          break;
        }
      }
      if (char === null) continue;
  
      const DELIMITERS = ['(', ')', '{', '}', ';', ':', ',', '.'];
      if (DELIMITERS.includes(char)) {
        tokens.push({ type: 'DELIMITER', value: char, line, column });
        current++;
        column++;
        continue;
      }
  
      // 4. Strings Literais: "qualquer coisa aqui"
      if (char === '"') {
        let value = '';
        current++; // Pula a aspa inicial
        column++;
        
        while (input[current] !== '"' && current < input.length) {
          value += input[current];
          if (input[current] === '\n') { // Strings não podem ter quebra de linha
              throw new SyntaxError(`String não terminada na linha ${line}`);
          }
          current++;
          column++;
        }
        
        if (input[current] === '"') {
          current++; // Pula a aspa final
          column++;
          tokens.push({ type: 'LITERAL_STRING', value, line, column });
        } else {
            throw new SyntaxError(`String não terminada na linha ${line}`);
        }
        continue;
      }
  
      // 5. Números (Inteiros e Decimais)
      const NUMBERS = /[0-9]/;
      if (NUMBERS.test(char)) {
        let value = '';
        // Regex para validar número inteiro ou decimal
        const numberRegex = /^\d+(\.\d+)?/;
        const match = input.substring(current).match(numberRegex);
        if (match) {
          value = match[0];
          const type = value.includes('.') ? 'LITERAL_DECIMAL' : 'LITERAL_INTEIRO';
          tokens.push({ type: type, value, line, column });
          current += value.length;
          column += value.length;
          continue;
        }
      }
  
      // 6. Identificadores e Palavras-chave
      const LETTERS = /[a-zA-Z_]/;
      if (LETTERS.test(char)) {
        let value = '';
        // Regex para identificador
        const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*/;
        const match = input.substring(current).match(identifierRegex);
        if (match) {
            value = match[0];
            // Verifica se é uma palavra-chave ou um identificador comum
            const type = KEYWORDS.has(value) ? 'KEYWORD' : 'IDENTIFIER';
            tokens.push({ type, value, line, column });
            current += value.length;
            column += value.length;
            continue;
        }
      }
  
      // 7. Se nada foi reconhecido, é um erro.
      throw new TypeError(`Caractere desconhecido: '${char}' na linha ${line}, coluna ${column}`);
    }
  
    // Adiciona um token de Fim de Arquivo (EOF) para facilitar o parsing
    tokens.push({ type: 'EOF', value: 'EndOfFile', line, column });
    return tokens;
  }
  
  // --- Exemplo de Uso ---
  const codigoExemplo = `
  var inteiro idade = 20; // declaração
  se (idade >= 18) {
      escreva("Maior de idade");
  } senao {
      escreva("Menor de idade");
  }
  ///
  Este é um bloco de
  comentário ignorado.
  ///
  `;
  
  try {
    const tokensGerados = tokenizer(codigoExemplo);
    console.log(tokensGerados);
  } catch (error) {
    console.error(error.message);
  }