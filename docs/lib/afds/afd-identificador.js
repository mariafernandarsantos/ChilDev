function afdIdentificador(input) {
  let state = "q0";
  let pos = 0;

  while (pos < input.length) {
    let c = input[pos];

    switch (state) {
      case "q0":
        if (/[a-zA-Z_]/.test(c)) state = "q_id";
        else return null; // rejeita
        break;

      case "q_id":
        if (/[a-zA-Z0-9_]/.test(c)) state = "q_id";
        else return null;
        break;
    }
    pos++;
  }

  // Palavras-chave reservadas
  let keywords = ["if", "else", "while", "return", "function"];
  if (keywords.includes(input)) return { type: "KW", value: input };

  return { type: "ID", value: input };
}

console.log(afdIdentificador("teste"));   // { type: "ID", value: "teste" }
console.log(afdIdentificador("if"));      // { type: "KW", value: "if" }
console.log(afdIdentificador("123abc"));  // null
