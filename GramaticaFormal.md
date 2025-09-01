# Conjunto de Variáveis e Regras de Produção

## Conjunto de variáveis (V):
V = { Programa, BlocoComandos, ListaComandos, Comando, DeclaracaoVariavel, ComandoAtribuicao, ComandoCondicional, ComandoLoop, ComandoEscrita, Expressao, ExpressaoLogica, ExpressaoRelacional, ExpressaoAritmetica, Termo, Fator, Tipo }

## Conjunto de terminais (T):
T = { var, escreva, se, senao, enquanto, para, de, ate, inteiro, decimal, texto, booleano, verdadeiro, falso, e, ou, nao, ==, !=, >, <, >=, <=, +, -, *, /, =, (, ), {, }, ;, identificador, literal_inteiro, literal_decimal, literal_string }

## Símbolo Inicial (S):
S = { Programa }

## Principais Regras de Produção Implementadas

* **Programa** → BlocoComandos
* **BlocoComandos** → { ListaComandos }
* **ListaComandos** → Comando ListaComandos | ε
* **Comando** → DeclaracaoVariavel ; | ComandoAtribuicao ; | ComandoCondicional | ComandoLoop | ComandoEscrita ;
* **DeclaracaoVariavel** → var Tipo identificador | var Tipo identificador = Expressao
* **ComandoAtribuicao** → identificador = Expressao
* **ComandoCondicional** → se ( Expressao ) BlocoComandos | se ( Expressao ) BlocoComandos senao BlocoComandos
* **ComandoLoop** → enquanto ( Expressao ) BlocoComandos | para identificador de Expressao ate Expressao BlocoComandos
* **ComandoEscrita** → escreva ( Expressao )
* **Tipo** → inteiro | decimal | texto | booleano
* **Expressao** → ExpressaoLogica
* **ExpressaoLogica** → ExpressaoRelacional | ExpressaoLogica e ExpressaoRelacional | ExpressaoLogica ou ExpressaoRelacional | nao ExpressaoRelacional
* **ExpressaoRelacional** → ExpressaoAritmetica | ExpressaoAritmetica == ExpressaoAritmetica | ExpressaoAritmetica != ExpressaoAritmetica | ExpressaoAritmetica > ExpressaoAritmetica | ExpressaoAritmetica < ExpressaoAritmetica | ExpressaoAritmetica >= ExpressaoAritmetica | ExpressaoAritmetica <= ExpressaoAritmetica
* **ExpressaoAritmetica** → Termo | ExpressaoAritmetica + Termo | ExpressaoAritmetica - Termo
* **Termo** → Fator | Termo * Fator | Termo / Fator
* **Fator** → identificador | literal_inteiro | literal_decimal | literal_string | verdadeiro | falso | ( Expressao )

## Classificação na Hierarquia de Chomsky

### Justificativa:

* **Simplicidade e Previsibilidade:** O objetivo da Childev é ter uma sintaxe intuitiva para crianças. Uma regra de produção, como ComandoAtribuicao → identificador = Expressao, será válida independentemente de onde essa atribuição apareça, seja no corpo principal do programa, dentro de um laço repetir ou em um bloco se.
* **Estrutura Hierárquica e Recursiva:** A Childev, mesmo sendo simples, possui uma estrutura hierárquica. Por exemplo, um laço repetir contém um BlocoComandos, que por sua vez contém uma ListaComandos.
* **Facilidade de Implementação (Análise Sintática):** Gramáticas Livres de Contexto podem ser processadas por analisadores sintáticos.

### Verificação

* **Não precisa ser Tipo 0 (Irrestrita):** A gramática da Childev é bem definida e estruturada, não havendo necessidade do poder computacional irrestrito de uma gramática de Tipo 0.
* **Não precisa ser Tipo 1 (Sensível ao Contexto):** A Childev não necessita do poder de uma Gramática Sensível ao Contexto. As regras de Tipo 1 têm o formato αAβ → αγβ.
* **É uma Gramática Livre de Contexto (Tipo 2):** Todas as suas regras de produção seguem o formato A → α.


## Limitações da Gramática e Análise Semântica

* Identificadores devem começar com uma letra (A–Z, a–z) ou sublinhado (`_`).
* Identificadores podem conter letras, números (0–9) e sublinhados após o primeiro caractere.
* Identificadores são sensíveis a maiúsculas e minúsculas (ex: `nome` ≠ `Nome`).
* Identificadores não podem usar palavras-reservadas da linguagem, como `se`, `funcao`, `inteiro`, etc.
* Comentários de bloco não podem ser aninhados.
* Não pode haver `///` de fechamento sem um `///` de abertura.
* Sensível a maiúsculas/minúsculas (`se` ≠ `Se`).

## Resolução de Ambiguidades

### Exemplo com Loop e Condicional
```
var inteiro x
x = 5

enquanto (x > 0) faca
se (x % 2 == 0) entao
escreva("Par")
senao
escreva("Ímpar")
fim
x = x - 1
fim

yaml
```

### Solução
Regra de associação – senao sempre se associa ao se mais próximo não pareado.  

---

### Precedência de Operadores
Exemplo:
```
condicao = 3 + 2 * 4 > 10 e nao falso
```

Hierarquia:
1. ( ) – Parênteses  
2. nao – Negação lógica  
3. * / – Multiplicação e divisão  
4. + - – Adição e subtração  
5. == != > < >= <= – Comparações  
6. e – AND lógico  
7. ou – OR lógico  

Aplicação passo a passo:
- 2 * 4 = 8  
- 3 + 8 = 11  
- 11 > 10 = verdadeiro  
- nao falso = verdadeiro  
- verdadeiro e verdadeiro = verdadeiro

## Exemplos de Derivação

* Programa:
```
var inteiro idade = 20;
se (idade >= 18) {
    escrever("Maior de idade");
}
senao {
    escrever("Menor de idade");
}
```

* Derivação
```
⇒ BlocoComandos
⇒ { ListaComandos }
⇒ { Comando ListaComandos }
⇒ { DeclaraçãoVariavel ; ListaComandos }
⇒ { var Tipo identificador = Expressão ; ListaComandos }
⇒ { var inteiro identificador = Expressão ; ListaComandos }
⇒ { var inteiro idade = Expressão ; ListaComandos }
⇒ { var inteiro idade = literal_inteiro ; ListaComandos }
⇒ { var inteiro idade = 20 ; ListaComandos }
⇒ { var inteiro idade = 20 ; Comando ListaComandos }
⇒ { var inteiro idade = 20 ; ComandoCondicional ListaComandos }
⇒ { var inteiro idade = 20 ; se ( Expressão ) BlocoComandos senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( ExpressãoRelacional ) BlocoComandos senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( ExpressãoAritmética >= ExpressãoAritmética ) BlocoComandos senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( identificador >= literal_inteiro ) BlocoComandos senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) BlocoComandos senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { ListaComandos } senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { Comando ListaComandos } senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { ComandoEscrita ; ListaComandos } senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever ( Expressão ) ; ListaComandos } senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever ( literal_string ) ; ListaComandos } senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao BlocoComandos ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao { ListaComandos } ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao { Comando ListaComandos } ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao { ComandoEscrita ; ListaComandos } ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao { escrever ( Expressão ) ; ListaComandos } ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao { escrever("Menor de idade"); } ListaComandos }
⇒ { var inteiro idade = 20 ; se ( idade >= 18 ) { escrever("Maior de idade"); } senao { escrever("Menor de idade"); } ε }
```

## Programa com função
```
Funcao Inteiro calcularMedia(Inteiro x, Inteiro y) 
	retorne (x + y) / 2 
	Fim 

Guarde Inteiro calcularMedia(10, 6) como resultadoFinal 

Escreva "A média é:", resultadoFinal
```

*  Árvore de Derivação
```
Programa 

├── BlocoDeclaracoes 

│   └── DeclaracaoFuncao 

│       └── Funcao Inteiro calcularMedia(...) Fim 

├── BlocoDeclaracoes 

│   └── DeclaracaoVariável 

│       └── Guarde Inteiro calcularMedia(10, 6) como resultadoFinal 

│           └── BlocoDeclaracoes 

│               └── (A declaração de variável será o último BlocoDeclaracoes) 

└── BlocoComandosPrincipal 

    └── ComandoEscreva 

        └── Escreva "A média é:", resultadoFinal
```

## Características Específicas da Didágica

### Associatividade
- Operadores aritméticos: associativos à esquerda  
- Operadores lógicos: associativos à esquerda  
- Comparações: não associativas (erros se encadeadas

### Observação sobre a Gramática
A gramática formal continua sendo gerada pelas produções:
Programa → BlocoComandos → ListaComandos ...
Mas o dialeto educacional em português substitui a sintaxe tradicional (int, if, while) por comandos mais legíveis e pedagógicos (Guarde Inteiro, Se, Enquanto, Escreva), mantendo a semântica definida nas regras.

## Validação e Testes

### PROGRAMAS DE TESTE CRIADOS

* Teste 1 - Programa Básico
* Status: Funcional
```
nome_linguagem: caractere
escreval("Olá, mundo!")
nome_linguagem <- "VisualG"
escreval("Linguagem: ", nome_linguagem)
```


* Teste 2 - Estruturas de Controle
* Status: Funcional
```
limite, i: inteiro
limite <- 5
para i de 1 ate limite faca {
    se i = (limite div 2) entao {
        escreval("Meio do caminho")
    } senao {
        escreval("Número: ", i)
    }
}
```

* Teste 3 - Função com Parâmetros
* Status: Funcional
```
funcao calcular_media(a: real, b: real) {
    retorne (a + b) / 2
}
media: real
media <- calcular_media(9.5, 5.5)
escreval("Média: ", media)
```


* Teste 4 - Classe com Herança
* Status: Funcional
```
classe Pessoa {
    nome: caractere
    idade: inteiro
}
classe Aluno herda Pessoa {
    curso: caractere
    metodo mostrar_info() {
        escreval("Aluno: ", nome, " Idade: ", idade, " Curso: ", curso)
    }
}
aluno1: Aluno
aluno1.nome <- "Carlos"
aluno1.idade <- 22
aluno1.curso <- "Computação"
aluno1.mostrar_info()
```

## ANÁLISE DE ERROS SINTÁTICOS

* Erro 1 – Convenção de Nomenclatura
* Resultado: Rejeitado
``` 
idadeAluno: inteiro   // Erro: deveria ser idade_aluno
```


* Erro 2 – Estrutura Incompleta
* Resultado: Rejeitado
```
se idade > 18 entao {
    escreval("Maior")
    // Falta fechar com }
```
// Resultado: Rejeitado

* Erro 3 – Variável Não Declarada
* Resultado: Rejeitado
```
escreval(valor)   // Erro: 'valor' não foi declarado antes do uso
```

* Erro 4 – Tipo Incompatível
* Resultado: Rejeitado
```
idade: inteiro
idade <- "vinte"   // Erro: atribuição inválida
```

* Erro 5 – Método Inexistente
* Resultado: Rejeitado
```
aluno1: Aluno
aluno1.nome <- "Carlos"
aluno1.mostrar_curso()   // Erro: método não existe
// Resultado: Rejeitado
```



