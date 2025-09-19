function afdComentarioBloco(input) {
  if (/^\/\[\s\S]\*\/$/.test(input)) {
    return { type: "COMMENT_BLOCK", value: input };
  }
  return null;
}

console.log(afdComentarioBloco("/* bloco de comentário */")); 
