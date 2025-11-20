# 📘 Manual de Utilização da Linguagem ChilDev

Bem-vindo ao ChilDev! Esta é uma linguagem de programação criada para ser simples, educativa e totalmente em português. Este manual serve como referência rápida para a sintaxe e funcionalidades da linguagem.

## 1. Estrutura Básica
Todo programa em ChilDev deve possuir uma função principal chamada `main`. É por ela que o computador começa a executar as instruções.

```javascript
funcao main(): inteiro {
    escreva("Olá, mundo!");
    retorna 0;
}
```

## 2. Variáveis e Tipos
O ChilDev é uma linguagem tipada. Você precisa definir o tipo da variável no momento da criação (declaração). Usamos a palavra-chave var.
### Tipos Suportados
Tipo Descrição Exemplo 
inteiroNúmeros inteiros (sem casa decimal)1, 10, -5
decimalNúmeros com ponto flutuante3.14, 9.5, -0.01
stringTextos (sempre entre aspas duplas)"ChilDev", "Olá"
### Declaração
``` javascript
var inteiro idade = 10;
var decimal nota = 9.5;
var string nome = "Maria";
```
Nota: O compilador suporta conversão implícita de inteiro para decimal em operações matemáticas, mas não o contrário.

## 3. Saída de Dados (Escreva)
Para exibir informações na tela (console), utilize o comando escreva. Ele aceita múltiplos argumentos separados por vírgula e adiciona um espaço automaticamente entre eles.
```javascript
var inteiro x = 5;
escreva("O valor de x é:", x);
// Saída: O valor de x é: 5
```

## 4. Operadores Matemáticos
A linguagem suporta as quatro operações básicas. A precedência matemática é respeitada (multiplicação/divisão acontecem antes de soma/subtração).
* '+' (Soma)
* '-' (Subtração)
* '*' (Multiplicar)
* '/' (Dividir)
```javascript
var decimal resultado = 10.0 + 2.5 * 4.0; 
// resultado será 20.0
```

## 5. Estruturas de Decisão (se / senao)
Utilize para controlar o fluxo do programa baseado em condições lógicas.
### Operadores de Comparação:
* == (Igual)
* != (Diferente)
* '>' (Maior que)
* < (Menor que)
* '>=' (Maior ou igual)
* <= (Menor ou igual)
```javascript
var decimal media = 5.5;

se (media >= 6.0) {
    escreva("Aprovado!");
} senao {
    escreva("Reprovado. Estude mais!");
}
```

## 6. Funções
Funções permitem reutilizar blocos de código. Elas podem receber parâmetros e retornar valores.
* Definição: Use funcao Nome(tipo param): tipoRetorno { ... }.
* Retorno: Use a palavra-chave retorna para devolver um valor.
* Vazio: Se a função não retorna nada, use o tipo void.
```javascript
// Função que soma dois números
funcao somar(decimal n1, decimal n2): decimal {
    var decimal resultado = n1 + n2;
    retorna resultado; 
}

funcao main(): inteiro {
    var decimal total = somar(10.5, 2.5);
    escreva("A soma é:", total);
    retorna 0;
}
```

## 7. Comentários
Utilize comentários para documentar seu código. O compilador ignora tudo que estiver neles.
* // : Comentário de uma linha.
* /// : Bloco de comentário (pode ocupar várias linhas).
```javascript
// Esta variável guarda a idade
var inteiro idade = 10; 

/// 
Este é um bloco de comentário
Explicando algo complexo.
///
```
