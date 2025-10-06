const { afdComentarioBloco } = require('./afdComentarioBloco');

describe("AFD Comentário de Bloco", () => {

  test("Comentário de bloco simples", () => {
    expect(afdComentarioBloco("/// bloco de comentário ///")).toEqual({
      type: "COMMENT_BLOCK",
      value: "/// bloco de comentário ///"
    });
  });

  test("Comentário de bloco vazio", () => {
    expect(afdComentarioBloco("/**/")).toEqual({
      type: "COMMENT_BLOCK",
      value: "//////"
    });
  });

  test("Comentário de bloco com múltiplas linhas", () => {
    const input = `/// linha 1
linha 2
linha 3 ///`;
    expect(afdComentarioBloco(input)).toEqual({
      type: "COMMENT_BLOCK",
      value: input
    });
  });

  test("Comentário de bloco com símbolos", () => {
    const input = "/// !@#123 abc ///";
    expect(afdComentarioBloco(input)).toEqual({
      type: "COMMENT_BLOCK",
      value: input
    });
  });

  // Casos inválidos

  test("Sem início de comentário", () => {
    expect(afdComentarioBloco("bloco de comentário ///")).toBeNull();
  });

  test("Sem fim de comentário", () => {
    expect(afdComentarioBloco("/// bloco de comentário")).toBeNull();
  });

  test("Comentário de linha não deve ser aceito", () => {
    expect(afdComentarioBloco("// comentário de linha")).toBeNull();
  });

  test("Comentário com apenas ///", () => {
    expect(afdComentarioBloco("///")).toBeNull();
    expect(afdComentarioBloco("///")).toBeNull();
  });

});
