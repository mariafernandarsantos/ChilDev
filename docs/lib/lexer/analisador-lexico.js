// AFD UNIIFICADO
const afd = {
  estados: [
    "q0c,q0d,q0i,q0n,q0s,qStart",
    "q1s", "q1n", "q2n", "q1i", "q1d", "q1c",
    "q2c", "q4n", "q3n", "q6n", "q5n"
  ],
  inicial: "q0c,q0d,q0i,q0n,q0s,qStart",
  finais: ["q1s", "q1n", "q1i", "q1d", "q1c", "q2c", "q3n", "q6n"],
  transicoes: {
    "q0c,q0d,q0i,q0n,q0s,qStart": {
      '"': "q1s",
      "dígito": "q1n",
      ".": "q2n",
      "letra": "q1i",
      "_": "q1i",
      "delimitador": "q1d",
      "//": "q1c",
      "///": "q2c"
    },
    "q1s": { "char": "q1s", "escape": "q1s" },
    "q1n": { "dígito": "q1n", ".": "q2n", "exp": "q4n" },
    "q2n": { "dígito": "q3n", "exp": "q4n" },
    "q3n": { "dígito": "q3n" },
    "q4n": { "dígito": "q6n", "sinal": "q5n" },
    "q5n": { "dígito": "q6n" },
    "q6n": { "dígito": "q6n" },
    "q1i": { "dígito": "q1i", "letra": "q1i", "_": "q1i" },
    "q1d": { "delimitador": "q1d" },
    "q1c": { "no escape": "q1c" },
    "q2c": { "não repetiu ///": "q2c" }
  }
};


const tipoPorEstadoFinal = {
  q1s: "STRING_LITERAL",
  q1n: "NUMERO_INT",
  q3n: "NUMERO_FLOAT",
  q6n: "NUMERO_EXP",
  q1i: "IDENTIFICADOR",
  q1d: "DELIMITADOR",
  q1c: "COMMENT_LINE",
  q2c: "COMMENT_BLOCK"
};

// Reconhece o AFD
function reconhecerLexemaAFD(texto, inicio = 0) {
  let estadoAtual = afd.inicial;
  let ultimoFinal = null;
  let posUltimoFinal = inicio;

  let i = inicio;
  while (i < texto.length) {
    const simbolo = classificarSimbolo(texto, i);
    if (!simbolo) break;

    const transicoes = afd.transicoes[estadoAtual];
    if (!transicoes || !transicoes[simbolo.tipo]) break;

    estadoAtual = transicoes[simbolo.tipo];
    i += simbolo.comprimento;

    if (afd.finais.includes(estadoAtual)) {
      ultimoFinal = estadoAtual;
      posUltimoFinal = i;
    }
  }

  if (ultimoFinal) {
    const lexema = texto.slice(inicio, posUltimoFinal);
    return { lexema, estadoFinal: ultimoFinal, fim: posUltimoFinal };
  }

  return null;
}

// Classificando símbolos
function classificarSimbolo(texto, i) {
  const c = texto[i];

  if (texto.startsWith("///", i)) return { tipo: "///", comprimento: 3 };
  if (texto.startsWith("//", i)) return { tipo: "//", comprimento: 2 };

  if (c.match(/[0-9]/)) return { tipo: "dígito", comprimento: 1 };
  if (c.match(/[\p{L}]/u)) return { tipo: "letra", comprimento: 1 }; 
  if (c === "_") return { tipo: "_", comprimento: 1 };
  if (c === ".") return { tipo: ".", comprimento: 1 };
  if (c === '"') return { tipo: '"', comprimento: 1 };

  if ("+-*/=<>(){};,!".includes(c)) return { tipo: "delimitador", comprimento: 1 };

  if (c === " " || c === "\t" || c === "\n") return { tipo: "whitespace", comprimento: 1 };

  return null; // caractere desconhecido
}


function analisadorLexicoAFD(codigo) {
  const tokens = [];
  let i = 0;
  let linha = 1;
  let coluna = 1;

  while (i < codigo.length) {
    const char = codigo[i];

    // Ignora espaços e quebras de linha
    if (/\s/.test(char)) {
      if (char === "\n") {
        linha++;
        coluna = 1;
      } else {
        coluna++;
      }
      i++;
      continue;
    }

    const resultado = reconhecerLexemaAFD(codigo, i);
    if (resultado) {
      const tipo = tipoPorEstadoFinal[resultado.estadoFinal] || "UNKNOWN";

      // ignora comentários
      if (!tipo.startsWith("COMMENT")) {
        tokens.push({
          tipo: tipo,
          valor: resultado.lexema,
          linha: linha,
          coluna: coluna
        });
      }

      // atualiza posição
      const quebras = resultado.lexema.match(/\n/g);
      if (quebras) {
        linha += quebras.length;
        coluna = resultado.lexema.length - resultado.lexema.lastIndexOf("\n");
      } else {
        coluna += resultado.lexema.length;
      }

      i = resultado.fim;
    } else {
      throw new Error(`Opa! Não reconheci: '${char}' na linha ${linha}, coluna ${coluna}`);
    }
  }

  return tokens;
}


const codigoExemplo = `
var idade = 20;
escreva("Olá mundo");
/// comentário linha
/// comentário bloco ///
`;

try {
  const tokens = analisadorLexicoAFD(codigoExemplo);
  console.table(tokens);
} catch (e) {
  console.error(e.message);
}