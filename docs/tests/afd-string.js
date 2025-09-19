const { afdString } = require('./afdString');

describe("AFD String", () => {

  test('String simples entre aspas', () => {
    expect(afdString('"hello"')).toEqual({ type: "STR", value: "hello" });
  });

  test('String vazia entre aspas', () => {
    expect(afdString('""')).toEqual({ type: "STR", value: "" });
  });

  test('String com espaços', () => {
    expect(afdString('"Hello world"')).toEqual({ type: "STR", value: "Hello world" });
  });

  test('String com números e símbolos', () => {
    expect(afdString('"123!@#"')).toEqual({ type: "STR", value: "123!@#" });
  });

  // Casos inválidos

  test('Sem aspas', () => {
    expect(afdString('hello')).toBeNull();
  });

  test('Apenas aspas de abertura', () => {
    expect(afdString('"unclosed')).toBeNull();
  });

  test('Apenas aspas de fechamento', () => {
    expect(afdString('unopened"')).toBeNull();
  });

  test('Aspas internas não escapadas (ainda deve aceitar, pois o regex não valida isso)', () => {
    expect(afdString('"hello"world"')).toBeNull(); // aspas extras invalidam
  });

  test('Aspas no meio da string (válidas se encapsuladas corretamente)', () => {
    expect(afdString('"he said \\"hi\\""')).toEqual({ type: "STR", value: 'he said \\"hi\\"' });
  });

  test('String com quebra de linha (deve ser inválida)', () => {
    expect(afdString('"line1\nline2"')).toBeNull();
  });

});
