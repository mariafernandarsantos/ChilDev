# Análise LL(1): Conjuntos FIRST e FOLLOW

## Conjuntos FIRST

| Não-Terminal | Conjunto FIRST( ) |
| :--- | :--- |
| **Program** | `{ program }` |
| **DeclSeq** | `{ const, var, ε }` |
| **Decl** | `{ const, var }` |
| **ConstDecl** | `{ const }` |
| **Const** | `{ Number, CharConst, BoolConst }` |
| **VarDecl** | `{ var }` |
| **VarDeclTail** | `{ ,, ε }` |
| **Type** | `{ Ident }` |
| **MethodSeq** | `{ void, ε }` |
| **MethodDecl** | `{ void }` |
| **FormParsOpt** | `{ Ident, ε }` |
| **FormPars** | `{ Ident }` |
| **FormParsTail** | `{ ,, ε }` |
| **VarDeclSeq** | `{ var, ε }` |
| **Block** | `{ { }` |
| **StatementSeq**| `{ Ident, if, while, return, read, print, {, ;, ε }` |
| **Statement** | `{ Ident, if, while, return, read, print, {, ; }` |
| **ElsePart** | `{ else, ε }` |
| **ExprOpt** | `{ Ident, Number, CharConst, BoolConst, new, (, -, ε }` |
| **PrintOpt** | `{ ,, ε }` |
| **DesignatorStmt**| `{ Ident }` |
| **Designator** | `{ Ident }` |
| **DesignatorTail**| `{ ., [, ε }` |
| **ActParsOpt** | `{ Ident, Number, CharConst, BoolConst, new, (, -, ε }` |
| **ActPars** | `{ Ident, Number, CharConst, BoolConst, new, (, - }` |
| **ActParsTail** | `{ ,, ε }` |
| **Condition** | `{ Ident, Number, CharConst, BoolConst, new, (, - }` |
| **RelOp** | `{ ==, !=, >, >=, <, <= }` |
| **Expr** | `{ Ident, Number, CharConst, BoolConst, new, (, - }` |
| **ExprTail** | `{ +, -, ε }` |
| **AddOp** | `{ +, - }` |
| **Term** | `{ Ident, Number, CharConst, BoolConst, new, ( }` |
| **TermTail** | `{ *, /, %, ε }` |
| **MulOp** | `{ *, /, % }` |
| **Factor** | `{ Ident, Number, CharConst, BoolConst, new, ( }` |

---

## Conjuntos FOLLOW

| Não-Terminal | Conjunto FOLLOW( ) |
| :--- | :--- |
| **Program** | `{ $ }` |
| **DeclSeq** | `{ void, $ }` |
| **Decl** | `{ const, var, void, $ }` |
| **ConstDecl** | `{ const, var, void, $ }` |
| **Const** | `{ ; }` |
| **VarDecl** | `{ const, var, void, $, { }` |
| **VarDeclTail** | `{ ; }` |
| **Type** | `{ Ident, [ }` |
| **MethodSeq** | `{ $ }` |
| **MethodDecl** | `{ void, $ }` |
| **FormParsOpt** | `{ ) }` |
| **FormPars** | `{ ) }` |
| **FormParsTail** | `{ ) }` |
| **VarDeclSeq** | `{ { }` |
| **Block** | `{ Ident, if, while, return, read, print, {, ;, }, else, void, $ }` |
| **StatementSeq**| `{ } }` |
| **Statement** | `{ Ident, if, while, return, read, print, {, ;, }, else }` |
| **ElsePart** | `{ Ident, if, while, return, read, print, {, ;, }, else }` |
| **ExprOpt** | `{ ; }` |
| **PrintOpt** | `{ ) }` |
| **DesignatorStmt**| `{ Ident, if, while, return, read, print, {, ;, }, else }` |
| **Designator** | `{ =, (, ++, --, ), *, /, %, +, -, ;, ,, ], ==, !=, >, >=, <, <= }` |
| **DesignatorTail**| `{ =, (, ++, --, ), *, /, %, +, -, ;, ,, ], ==, !=, >, >=, <, <= }` |
| **ActParsOpt** | `{ ) }` |
| **ActPars** | `{ ) }` |
| **ActParsTail** | `{ ) }` |
| **Condition** | `{ ) }` |
| **RelOp** | `{ Ident, Number, CharConst, BoolConst, new, (, - }` |
| **Expr** | `{ ;, ,, ], ), ==, !=, >, >=, <, <= }` |
| **ExprTail** | `{ ;, ,, ], ), ==, !=, >, >=, <, <= }` |
| **AddOp** | `{ Ident, Number, CharConst, BoolConst, new, ( }` |
| **Term** | `{ +, -, ;, ,, ], ), ==, !=, >, >=, <, <= }` |
| **TermTail** | `{ +, -, ;, ,, ], ), ==, !=, >, >=, <, <= }` |
| **MulOp** | `{ Ident, Number, CharConst, BoolConst, new, ( }` |
| **Factor** | `{ *, /, %, +, -, ;, ,, ], ), ==, !=, >, >=, <, <= }` |

---

## A Gramática é LL(1)?

### Justificativa

**Não, a gramática fornecida NÃO é LL(1).**

Ela falha em múltiplos pontos, nos que exigem **fatoração à esquerda** (left-factoring) e na **ambiguidade do "dangling else"**.

#### Violação 1: Conflito FIRST/FIRST em `<DesignatorStmt>`

O não-terminal `<DesignatorStmt>` tem quatro regras:

1.  `<Designator> "=" <Expr> ";"`
2.  `<Designator> "(" <ActParsOpt> ")" ";"`
3.  `<Designator> "++" ";"`
4.  `<Designator> "--" ";"`

* $FIRST(Regra 1) = FIRST(Designator) = \{ Ident \}$
* $FIRST(Regra 2) = FIRST(Designator) = \{ Ident \}$
* $FIRST(Regra 3) = FIRST(Designator) = \{ Ident \}$
* $FIRST(Regra 4) = FIRST(Designator) = \{ Ident \}$

**Conflito:** Os conjuntos FIRST de todas as quatro regras são idênticos. Quando o analisador vê um token `Ident` (que inicia um `<Designator>`), ele não tem como saber (olhando apenas um token à frente) qual das quatro produções escolher. Isso é uma violação massiva da Condição 1. A gramática EBNF resolve isso olhando *após* o Designator (para `=`, `(`, `++`, ou `--`), mas a gramática BNF, como escrita, não é LL(1).

#### Violação 2: Conflito FIRST/FIRST em `<Factor>` (Fatal)

O não-terminal `<Factor>` tem duas regras problemáticas:

1.  `<Factor> ::= <Designator>`
2.  `<Factor> ::= <Designator> "(" <ActParsOpt> ")"`

* $FIRST(Regra 1) = FIRST(Designator) = \{ Ident \}$
* $FIRST(Regra 2) = FIRST(Designator) = \{ Ident \}$

**Conflito:** $FIRST(Regra 1) \cap FIRST(Regra 2) = \{ Ident \} \neq \emptyset$.
O analisador vê um `Ident` e não sabe se é uma simples referência a uma variável (Regra 1) ou uma chamada de função (Regra 2).

#### Violação 3: Conflito FIRST/FOLLOW em `<ElsePart>` (Dangling Else)

O não-terminal `<ElsePart>` tem duas regras:

1.  `<ElsePart> ::= "else" <Statement>`
2.  `<ElsePart> ::= ε` (sentença vazia)

Aqui, aplicamos a Condição 2:
* $FIRST(Regra 1) = \{ else \}$
* $FIRST(Regra 2) = \{ \epsilon \}$
* $FOLLOW(ElsePart) = FOLLOW(Statement) = \{ ..., \textbf{else}, ... \}$

**Conflito:** $FIRST(Regra 1) \cap FOLLOW(ElsePart) = \{ else \} \neq \emptyset$.
Isso significa que quando o analisador está em um ponto onde um `<ElsePart>` é esperado, e o próximo token é `else`:
* Ele pode escolher a Regra 1 (consumindo o `else`).
* Ele pode escolher a Regra 2 (produzindo $\epsilon$) e assumir que o `else` pertence a um `if` mais externo (que é o que está no conjunto FOLLOW).

Esta é a clássica ambiguidade do "dangling else", que torna a gramática não-LL(1).
