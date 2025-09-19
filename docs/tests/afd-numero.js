const { afdNumero } = require('./afdNumero');

describe("AFD Número", () => {

  // Números inteiros
  test("Número inteiro simples", () => {
    expect(afdNumero("123")).toEqual({ type: "NUM", value: "123" });
  });

  test("Número inteiro zero", () => {
    expect(afdNumero("0")).toEqual({ type: "NUM", value: "0" });
  });

  // Números decimais
  test("Número decimal simples", () => {
    expect(afdNumero("10.5")).toEqual({ type: "NUM", value: "10.5" });
  });

  test("Decimal com zeros", () => {
    expect(afdNumero("0.01")).toEqual({ type: "NUM", value: "0.01" });
  });

  // Números com notação científica
  test("Notação científica positiva", () => {
    expect(afdNumero("1e10")).toEqual({ type: "NUM", value: "1e10" });
    expect(afdNumero("2.5e3")).toEqual({ type: "NUM", value: "2.5e3" });
  });

  test("Notação científica negativa", () => {
    expect(afdNumero("3.14e-2")).toEqual({ type: "NUM", value: "3.14e-2" });
    expect(afdNumero("5e-10")).toEqual({ type: "NUM", value: "5e-10" });
  });

  test("Notação científica com +", () => {
    expect(afdNumero("6e+2")).toEqual({ type: "NUM", value: "6e+2" });
  });

  // Entradas inválidas
  test("Letra ao invés de número", () => {
    expect(afdNumero("abc")).toBeNull();
  });

  test("Mistura inválida de letras e números", () => {
    expect(afdNumero("123abc")).toBeNull();
  });

  test("Número mal formatado - ponto no final", () => {
    expect(afdNumero("3.")).toBeNull();
  });

  test("Número mal formatado - sem parte inteira", () => {
    expect(afdNumero(".5")).toBeNull();
  });

  test("Número mal formatado - notação científica incompleta", () => {
    expect(afdNumero("5e")).toBeNull();
    expect(afdNumero("2.1e+")).toBeNull();
  });

  test("Número vazio", () => {
    expect(afdNumero("")).toBeNull();
  });

});
