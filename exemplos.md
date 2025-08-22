# Exemplos concretos de programas válidos na linguagem


## Exemplo 1: Programa de Soma de Dois Números
js
let a = 10;
let b = 20;
let resultado = a + b;
print(resultado);


*Tokens envolvidos:*
- *Palavras-chave:* let, print  
- *Identificadores:* a, b, resultado  
- *Literais numéricos:* 10, 20  
- *Operador:* +  
- *Pontuação:* ;, =  

---


## Exemplo 2: Laço de Repetição com Condicional

js
let contador = 0;

while (contador < 5) {
    print("Contador está em: " + contador);
    contador = contador + 1;
}


*Tokens envolvidos:*
- *Palavras-chave:* let, while, print  
- *Literais string:* "Contador está em: "  
- *Operadores:* <, +, =  
- *Identificadores:* contador  
- *Literais numéricos:* 0, 5, 1  

---


## Exemplo 3: Definição de Função

js
function saudacao(nome) {
    return "Olá, " + nome + "!";
}

print(saudacao("Murilo"));


*Tokens envolvidos:*
- *Palavras-chave:* function, return, print  
- *Identificadores:* saudacao, nome  
- *Literais string:* "Olá, ", "Murilo"  
- *Operadores:* +  
- *Pontuação:* (, ), {, }, ;  

---


## Exemplo 4: Comentários e Strings Multilinha

python

// Este é um comentário de linha única

///
Este é um comentário
ou string multilinha usando
fechamento de Kleene
///

let texto = "Exemplo de string com caracteres especiais:
@/%&*";


*Tokens envolvidos:*
- *Comentários:* #, """..."""  
- *Literais string:* "...", """..."""  
- *Identificadores:* texto  
- *Caracteres especiais permitidos:* @, #, %, &, *
