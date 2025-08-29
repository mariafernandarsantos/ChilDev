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
