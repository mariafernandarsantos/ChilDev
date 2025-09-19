function afdNumero(input) {
  let regex = /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/;
  if (regex.test(input)) {
    return { type: "NUM", value: input };
  }
  return null;
}

console.log(afdNumero("123"));      
console.log(afdNumero("10.5e2"));  
console.log(afdNumero("abc"));      
