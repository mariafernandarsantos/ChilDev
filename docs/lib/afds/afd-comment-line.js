function afdComentarioLinha(input) {
  if (/^\/\/.*$/.test(input)) {
    return { type: "COMMENT_LINE", value: input };
  }
  return null;
}

console.log(afdComentarioLinha("// isso é um comentário")); 
// { type: "COMMENT_LINE", value: "// isso é um comentário" }
