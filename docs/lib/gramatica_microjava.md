## Definição Formal da Gramática

$G = (V, \Sigma, P, S)$

onde:

* **V** (Variáveis / Não-terminais):
    `{Program, Decl, VarDecl, FuncaoDecl, Type, FormPars, Bloco, Statement, AssignStmt, FuncaoCallStmt, SeStmt, RetornaStmt, EscrevaStmt, Condition, RelOp, Expr, Term, Factor, AddOp, MulOp, ActPars, Ident, NumeroLiteral, StringLiteral}`

* **$\Sigma$** (Terminais):
    Palavras reservadas, símbolos e tokens do seu léxico:
    `{var, inteiro, se, senao, escreva, retorna, funcao, Ident, NumeroLiteral, StringLiteral, ;, ,, (, ), {, }, =, ==, !=, >, >=, <, <=, +, -, *, /}`

* **S** (Símbolo inicial):
    `Program`

* **P** (Regras de produção):
    O conjunto de produções segue abaixo, nos formatos EBNF e BNF.

---

## Gramática em EBNF (Extended Backus–Naur Form)

```ebnf
Program         = { VarDecl | FuncaoDecl } .

VarDecl         = "var" Type Ident { "," Ident } ";" .
Type            = "inteiro" .

FuncaoDecl      = "funcao" Ident "(" [ FormPars ] ")" Bloco .
FormPars        = Type Ident { "," Type Ident } .

Bloco           = "{" { VarDecl } { Statement } "}" .

Statement       = (Ident ( "=" Expr | "(" [ ActPars ] ")" ) ";")
                | ("se" "(" Condition ")" Statement [ "senao" Statement ])
                | ("retorna" [ Expr ] ";")
                | ("escreva" "(" [ ActPars ] ")" ";")
                | Bloco
                | ";" .

Condition       = Expr RelOp Expr .
RelOp           = "==" | "!=" | ">" | ">=" | "<" | "<=" .

Expr            = [ "-" ] Term { AddOp Term } .
AddOp           = "+" | "-" .

Term            = Factor { MulOp Factor } .
MulOp           = "*" | "/" .

Factor          = Ident [ "(" [ ActParams ] ")" ]
                | NumeroLiteral
                | StringLiteral
                | "(" Expr ")" .

ActPars         = Expr { "," Expr } .

(* Terminais definidos pelo seu léxico *)
Ident           = "Identificador (token)" .
NumeroLiteral   = "Número (token)" .
StringLiteral   = "String (token)" .
```

---

## Gramática em BNF (Backus–Naur Form)

```bnf
<Program>        ::= <DeclSeq>
<DeclSeq>        ::= <VarDecl> <DeclSeq>
                   | <FuncaoDecl> <DeclSeq>
                   | ε

<VarDecl>        ::= "var" <Type> Ident <IdentList> ";"
<IdentList>      ::= "," Ident <IdentList>
                   | ε
<Type>           ::= "inteiro"

<FuncaoDecl>     ::= "funcao" Ident "(" <FormParsOpt> ")" <Bloco>
<FormParsOpt>    ::= <FormPars>
                   | ε
<FormPars>       ::= <Type> Ident <FormParsTail>
<FormParsTail>   ::= "," <Type> Ident <FormParsTail>
                   | ε

<Bloco>          ::= "{" <VarDeclSeq> <StatementSeq> "}"
<VarDeclSeq>     ::= <VarDecl> <VarDeclSeq>
                   | ε
<StatementSeq>   ::= <Statement> <StatementSeq>
                   | ε

<Statement>      ::= <IdentStmt>
                   | <SeStmt>
                   | <RetornaStmt>
                   | <EscrevaStmt>
                   | <Bloco>
                   | ";"

(* Resolve a ambiguidade de 'Ident' (atribuição ou chamada) *)
<IdentStmt>      ::= Ident <IdentStmtTail> ";"
<IdentStmtTail>  ::= "=" <Expr>
                   | "(" <ActParsOpt> ")"

<SeStmt>         ::= "se" "(" <Condition> ")" <Statement> <SenaoPart>
<SenaoPart>      ::= "senao" <Statement>
                   | ε

<RetornaStmt>    ::= "retorna" <ExprOpt> ";"
<ExprOpt>        ::= <Expr>
                   | ε

<EscrevaStmt>    ::= "escreva" "(" <ActParsOpt> ")" ";"

<ActParsOpt>     ::= <ActPars>
                   | ε
<ActPars>        ::= <Expr> <ActParsTail>
<ActParsTail>    ::= "," <Expr> <ActParsTail>
                   | ε

<Condition>      ::= <Expr> <RelOp> <Expr>
<RelOp>          ::= "==" | "!=" | ">" | ">=" | "<" | "<="

<Expr>           ::= <Term> <ExprTail>
                   | "-" <Term> <ExprTail>
<ExprTail>       ::= <AddOp> <Term> <ExprTail>
                   | ε
<AddOp>          ::= "+" | "-"

<Term>           ::= <Factor> <TermTail>
<TermTail>       ::= <MulOp> <Factor> <TermTail>
                   | ε
<MulOp>          ::= "*" | "/"

(* Resolve a ambiguidade de 'Ident' (variável ou chamada) em expressões *)
<Factor>         ::= Ident <FactorTail>
                   | <NumeroLiteral>
                   | <StringLiteral>
                   | "(" <Expr> ")"
<FactorTail>     ::= "(" <ActParsOpt> ")"
                   | ε
```

---
