const regexComentarioBloco = /^\/\/\/[\s\S]*?\/\/\//;
const regexComentarioLinha = /^\/\/.*/;

const regexString = /^"(.*?)"/;

const regexNumero = /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/;

// Apenas letras a-z, A-Z e underscore no início
// Sem a flag 'u' e sem \p{L}
const regexIdentificador = /^[a-zA-Z_][a-zA-Z0-9_]*/;
// ----------------------------------------

const regexDelimOp = /^(==|!=|>=|<=|[=+\-*/><(){};,:.])/; 

const palavrasChave = new Set([
  "var", "inteiro", "decimal", "string", "void", "se", "senao", "escreva", "retorna", "funcao"
]);

const operadores = new Set([
  "=", "+", "-", "*", "/", ">", "<", ">=", "<=", "==", "!="
]);

const reconhecedores = [
  { tipo: 'COMMENT_BLOCK', regex: regexComentarioBloco, ignora: true },
  { tipo: 'COMMENT_LINE', regex: regexComentarioLinha, ignora: true },
  { tipo: 'LITERAL_STRING', regex: regexString, processa: (val) => val.slice(1, -1) },
  { tipo: 'LITERAL_DECIMAL', regex: regexNumero },
  { tipo: 'IDENTIFIER', regex: regexIdentificador },
  { tipo: 'DELIMITER_OP', regex: regexDelimOp }
];

export function analisadorLexico(codigo) {
  let tokens = [];
  let linha = 1;
  let coluna = 1;
  let ponteiro = 0;

  while (ponteiro < codigo.length) {
    let espacos = codigo.substring(ponteiro).match(/^\s+/);
    if (espacos) {
      const espacoStr = espacos[0];
      ponteiro += espacoStr.length;
      const linhasQuebradas = espacoStr.match(/\n/g) || [];
      if (linhasQuebradas.length > 0) {
        linha += linhasQuebradas.length;
        coluna = espacoStr.length - espacoStr.lastIndexOf('\n');
      } else {
        coluna += espacoStr.length;
      }
      continue;
    }

    let matchEncontrado = false;
    const fatiaCodigo = codigo.substring(ponteiro);

    for (const rec of reconhecedores) {
      const match = fatiaCodigo.match(rec.regex);

      if (match) {
        const valorOriginal = match[0];
        let valorProcessado = valorOriginal;
        let tipoToken = rec.tipo;

        if (rec.processa) valorProcessado = rec.processa(valorOriginal);

        if (tipoToken === 'IDENTIFIER') {
          if (palavrasChave.has(valorOriginal)) {
            tipoToken = 'KEYWORD';
          }
        } 
        else if (tipoToken === 'DELIMITER_OP') {
          if (operadores.has(valorOriginal)) {
             tipoToken = 'OPERATOR';
          } else {
             tipoToken = 'DELIMITER';
          }
        }
        else if (tipoToken === 'LITERAL_DECIMAL') {
            if (!valorOriginal.includes('.') && !valorOriginal.includes('e') && !valorOriginal.includes('E')) {
                tipoToken = 'LITERAL_INTEIRO';
            }
        }

        if (!rec.ignora) {
          tokens.push({
            type: tipoToken, 
            value: valorProcessado,
            line: linha,
            column: coluna
          });
        }

        const linhasNoToken = valorOriginal.match(/\n/g) || [];
        if (linhasNoToken.length > 0) {
          linha += linhasNoToken.length;
          coluna = valorOriginal.length - valorOriginal.lastIndexOf('\n');
        } else {
          coluna += valorOriginal.length;
        }

        ponteiro += valorOriginal.length;
        matchEncontrado = true;
        break;
      }
    }

    if (!matchEncontrado) {
      throw new Error(`Erro Léxico: Caractere inválido ou não reconhecido '${fatiaCodigo[0]}' na linha ${linha}, coluna ${coluna}`);
    }
  }

  tokens.push({ type: "EOF", value: "", line: linha, column: coluna });
  return tokens;
}