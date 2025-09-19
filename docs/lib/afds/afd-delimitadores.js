function afdDelimitador(input) {
  let delimitadores = ["(", ")", "{", "}", ";", ",", "+" , "-", "*", "/", "="];
  if (delimitadores.includes(input)) {
    return { type: "DELIM", value: input };
  }
  return null;
}

console.log(afdDelimitador("{")); 
console.log(afdDelimitador("x"));
