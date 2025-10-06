import {
  regexIdentificador,
  palavrasChave,
} from "../afds/afd-identificador.js";
import { regexNumero } from "../afds/afd-numeros.js";
import { regexString } from "../afds/afd-string.js";
import { regexComentarioBloco } from "../afds/afd-comment-block.js";
import { regexComentarioLinha } from "../afds/afd-comment-line.js";
import { regexDelimitador } from "../afds/afd-delimitadores.js";

const OPERATORS = new Set([
  "=",
  "+",
  "-",
  "*",
  "/",
  ">",
  "<",
  ">=",
  "<=",
  "==",
  "!=",
]);
const DELIMITERS = new Set(["(", ")", "{", "}", ";", ","]);

function analisadorLexico(codigo) {
  let ponteiro = 0;
  const tokens = [];
  let linha = 1;
  let coluna = 1;

  const reconhecedores = [
    { tipo: "COMMENT_BLOCK", regex: regexComentarioBloco, ignora: true },
    { tipo: "COMMENT_LINE", regex: regexComentarioLinha, ignora: true },
    {
      tipo: "LITERAL_STRING",
      regex: regexString,
      processa: (val) => val.slice(1, -1),
    },
    { tipo: "NUMBER", regex: regexNumero },
    { tipo: "IDENTIFIER_OR_KEYWORD", regex: regexIdentificador },
    { tipo: "DELIMITER_OR_OPERATOR", regex: regexDelimitador },
  ];

  while (ponteiro < codigo.length) {
    let espacos = codigo.substring(ponteiro).match(/^\s+/);
    if (espacos) {
      const espacoStr = espacos[0];
      ponteiro += espacoStr.length;
      const linhasQuebradas = espacoStr.match(/\n/g) || [];

      if (linhasQuebradas.length > 0) {
        linha += linhasQuebradas.length;
        coluna = espacoStr.length - espacoStr.lastIndexOf('\n');
      }else{
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
        let tipo = rec.tipo;

        if (tipo === "IDENTIFIER_OR_KEYWORD") {
          tipo = palavrasChave.has(valorOriginal) ? "KEYWORD" : "IDENTIFIER";
        } else if (tipo === "NUMBER") {
          tipo = valorOriginal.includes(".")
            ? "LITERAL_DECIMAL"
            : "LITERAL_INTEIRO";
        } else if (tipo === "DELIMITER_OR_OPERATOR") {
          if (OPERATORS.has(valorOriginal)) {
            tipo = "OPERATOR";
          } else if (DELIMITERS.has(valorOriginal)) {
            tipo = "DELIMITER";
          }
        }

        if (rec.processa) {
          valorProcessado = rec.processa(valorOriginal);
        }

        if (!rec.ignora) {
          tokens.push({
            type: tipo,
            value: valorProcessado,
            line: linha,
            column: coluna,
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
      throw new Error(
        `Opa! Não reconheci: '${fatiaCodigo[0]}' na linha ${linha}, coluna ${coluna}`
      );
    }
  }

  return tokens;
}

// Exemplo
const meuCodigo = `
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
  const tokensResultantes = analisadorLexico(meuCodigo);
  console.log(tokensResultantes);
} catch (e) {
  console.error(e.message);
}
