function afdString(input) {
  if (/^"(.*?)"$/.test(input)) {
    return { type: "STR", value: input.slice(1, -1) };
  }
  return null;
}

console.log(afdString('"hello"'));  
console.log(afdString('hello')); 
