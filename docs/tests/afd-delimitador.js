const { afdDelimitador } = require('./afdDelimitador');

describe("AFD Delimitador", () => {

  // Casos válidos
  test("Delimitador: parênteses", () => {
    expect(afdDelimitador("(")).toEqual({ type: "DELIM", value: "(" });
    expect(afdDelimitador(")")).toEqual({ type: "DELIM", value: ")" });
  });

  test("Delimitador: chaves", () => {
    expect(afdDelimitador("{")).toEqual({ type: "DELIM", value: "{" });
    expect(afdDelimitador("}")).toEqual({ type: "DELIM", value: "}" });
  });

  test("Delimitador: ponto e vírgula e vírgula", () => {
    expect(afdDelimitador(";")).toEqual({ type: "DELIM", value: ";" });
    expect(afdDelimitador(",")).toEqual({ type: "DELIM", value: "," });
  });

  test("Delimitador: operadores aritméticos", () => {
    expect(afdDelimitador("+")).toEqual({ type: "DELIM", value: "+" });
    expect(afdDelimitador("-")).toEqual({ type: "DELIM", value: "-" });
    expect(afdDelimitador("")).toEqual({ type: "DELIM", value: "" });
    expect(afdDelimitador("/")).toEqual({ type: "DELIM", value: "/" });
  });

  test("Delimitador: operador de atribuição", () => {
    expect(afdDelimitador("=")).toEqual({ type: "DELIM", value: "=" });
  });

  // Casos inválidos
  test("Caractere não delimitador: letra", () => {
    expect(afdDelimitador("x")).toBeNull();
  });

  test("Caractere não delimitador: número", () => {
    expect(afdDelimitador("1")).toBeNull();
  });

  test("String com múltiplos caracteres", () => {
    expect(afdDelimitador("()")).toBeNull();
    expect(afdDelimitador("++")).toBeNull();
    expect(afdDelimitador("==")).toBeNull();
  });

  test("Entrada vazia", () => {
    expect(afdDelimitador("")).toBeNull();
  });

});
