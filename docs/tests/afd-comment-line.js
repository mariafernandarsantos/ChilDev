const { afdComentarioLinha } = require('./afdComentarioLinha');

describe("AFD Comentário de Linha", () => {

  test("Comentário de linha simples", () => {
    expect(afdComentarioLinha("// isso é um comentário")).toEqual({
      type: "COMMENT_LINE",
      value: "// isso é um comentário"
    });
  });

  test("Comentário de linha vazio", () => {
    expect(afdComentarioLinha("//")).toEqual({
      type: "COMMENT_LINE",
      value: "//"
    });
  });

  test("Comentário com símbolos e números", () => {
    expect(afdComentarioLinha("// 123!@# abc")).toEqual({
      type: "COMMENT_LINE",
      value: "// 123!@# abc"
    });
  });

  test("Comentário com espaços e tabulação", () => {
    expect(afdComentarioLinha("//\tcomentário com tab")).toEqual({
      type: "COMMENT_LINE",
      value: "//\tcomentário com tab"
    });
  });

  // Casos inválidos

  test("Sem barras", () => {
    expect(afdComentarioLinha("isso não é comentário")).toBeNull();
  });

  test("Apenas uma barra", () => {
    expect(afdComentarioLinha("/ apenas uma barra")).toBeNull();
  });

  test("Comentário de bloco deve ser rejeitado", () => {
    expect(afdComentarioLinha("/* bloco */")).toBeNull();
  });

  test("Texto que começa com // mas com quebra de linha (ainda válido, regex é linha única)", () => {
    expect(afdComentarioLinha("// primeira linha\nsegunda")).toBeNull();
  });

});
