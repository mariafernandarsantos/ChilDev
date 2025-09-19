const { afdIdentificador } = require('./afdIdentificador');

describe("AFD Identificador / Palavra-chave", () => {

  test("Identificador válido simples", () => {
    expect(afdIdentificador("teste")).toEqual({ type: "ID", value: "teste" });
  });

  test("Identificador com underscore", () => {
    expect(afdIdentificador("_var")).toEqual({ type: "ID", value: "_var" });
  });

  test("Identificador com números no meio/final", () => {
    expect(afdIdentificador("var123")).toEqual({ type: "ID", value: "var123" });
    expect(afdIdentificador("var_123")).toEqual({ type: "ID", value: "var_123" });
  });

  test("Palavras-chave válidas", () => {
    expect(afdIdentificador("if")).toEqual({ type: "KW", value: "if" });
    expect(afdIdentificador("else")).toEqual({ type: "KW", value: "else" });
    expect(afdIdentificador("while")).toEqual({ type: "KW", value: "while" });
    expect(afdIdentificador("return")).toEqual({ type: "KW", value: "return" });
    expect(afdIdentificador("function")).toEqual({ type: "KW", value: "function" });
  });

  test("Entrada inválida começando com número", () => {
    expect(afdIdentificador("123abc")).toBeNull();
    expect(afdIdentificador("9var")).toBeNull();
  });

  test("Entrada com símbolo inválido", () => {
    expect(afdIdentificador("$var")).toBeNull();
    expect(afdIdentificador("var!")).toBeNull();
  });

  test("Vazio é inválido", () => {
    expect(afdIdentificador("")).toBeNull();
  });

});
