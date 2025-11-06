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
Program       = "program" Ident ";" { ConstDecl | VarDecl } { MethodDecl } "}" .

ConstDecl     = "const" Type Ident "=" (Number | CharConst | BoolConst) ";" .

VarDecl       = "var" Type Ident { "," Ident } ";" .

Type          = Ident .

MethodDecl    = "void" Ident "(" [ FormPars ] ")" 
                 { VarDecl } 
                 "{" { Statement } "}" .

FormPars      = Type Ident { "," Type Ident } .

Statement     = MatchedStmt | UnmatchedStmt .

MatchedStmt   = "if" "(" Condition ")" MatchedStmt "else" MatchedStmt
              | Designator ( AssignOp Expr | "(" [ ActPars ] ")" | "++" | "--" ) ";"
              | "while" "(" Condition ")" MatchedStmt
              | "return" [ Expr ] ";"
              | "read" "(" Designator ")" ";"
              | "print" "(" Expr [ "," Number ] ")" ";"
              | "{" { Statement } "}" 
              | ";" .
              
UnmatchedStmt = "if" "(" Condition ")" Statement
              | "if" "(" Condition ")" MatchedStmt "else" UnmatchedStmt .

Designator    = Ident { "." Ident | "[" Expr "]" } .

ActPars       = Expr { "," Expr } .

Condition     = Expr RelOp Expr .

RelOp         = "==" | "!=" | ">" | ">=" | "<" | "<=" .

Expr          = [ "-" ] Term { AddOp Term } .

AddOp         = "+" | "-" .

Term          = Factor { MulOp Factor } .

MulOp         = "*" | "/" | "%" .

Factor        = Designator [ "(" [ ActPars ] ")" ] 
              | Number 
              | CharConst 
              | BoolConst 
              | "new" Type "[" Expr "]"
              | "(" Expr ")" .

AssignOp      = "=" .
```

---

## Gramática em BNF (Backus–Naur Form)

```bnf
<Program>        ::= "program" Ident ";" <DeclSeq> <MethodSeq>
<DeclSeq>        ::= <Decl> <DeclSeq> | ε
<Decl>           ::= <ConstDecl> | <VarDecl>
<ConstDecl>      ::= "const" <Type> Ident "=" <Const> ";" 
<Const>          ::= Number | CharConst | BoolConst
<VarDecl>        ::= "var" <Type> Ident <VarDeclTail> ";"
<VarDeclTail>    ::= "," Ident <VarDeclTail> | ε
<Type>           ::= Ident
<MethodSeq>      ::= <MethodDecl> <MethodSeq> | ε
<MethodDecl>     ::= "void" Ident "(" <FormParsOpt> ")" <VarDeclSeq> <Block>
<FormParsOpt>    ::= <FormPars> | ε
<FormPars>       ::= <Type> Ident <FormParsTail>
<FormParsTail>   ::= "," <Type> Ident <FormParsTail> | ε
<VarDeclSeq>     ::= <VarDecl> <VarDeclSeq> | ε
<Block>          ::= "{" <StatementSeq> "}"
<StatementSeq>   ::= <Statement> <StatementSeq> | ε

<Statement>      ::= <UnmatchedStmt>
                   | <MatchedStmt>

<OtherStmts>     ::= <DesignatorStmt>
                   | "while" "(" <Condition> ")" <Statement>
                   | "return" <ExprOpt> ";"
                   | "read" "(" <Designator> ")" ";"
                   | "print" "(" <Expr> <PrintOpt> ")" ";"
                   | <Block>
                   | ";" 

<MatchedStmt>    ::= "if" "(" <Condition> ")" <MatchedStmt> "else" <MatchedStmt>
                   | <OtherStmts>

<UnmatchedStmt>  ::= "if" "(" <Condition> ")" <Statement>
                   | "if" "(" <Condition> ")" <MatchedStmt> "else" <UnmatchedStmt>
                   
<ExprOpt>        ::= <Expr> | ε
<PrintOpt>       ::= "," Number | ε

<DesignatorStmt> ::= <Designator> <DesignatorStmtTail> ";"

<DesignatorStmtTail> ::= "=" <Expr>
                       | "(" <ActParsOpt> ")"
                       | "++"
                       | "--"

<Designator>     ::= Ident <DesignatorTail>
<DesignatorTail> ::= "." Ident <DesignatorTail>
              _    | "[" <Expr> "]" <DesignatorTail>
                   | ε
<ActParsOpt>     ::= <ActPars> | ε
<ActPars>        ::= <Expr> <ActParsTail>
<ActParsTail>    ::= "," <Expr> <ActParsTail> | ε
<Condition>      ::= <Expr> <RelOp> <Expr>
<RelOp>          ::= "==" | "!=" | ">" | ">=" | "<" | "<="
<Expr>           ::= <Term> <ExprTail> | "-" <Term> <ExprTail>
<ExprTail>       ::= <AddOp> <Term> <ExprTail> | ε
<AddOp>          ::= "+" | "-"
<Term>           ::= <Factor> <TermTail>
<TermTail>       ::= <MulOp> <Factor> <TermTail> | ε
<MulOp>          ::= "*" | "/" | "%"

<Factor>         ::= <Designator> <FactorTail>
                   | Number
                   | CharConst
                   | BoolConst
                   | "new" <Type> "[" <Expr> "]"
                   | "(" <Expr> ")"

<FactorTail>     ::= "(" <ActParsOpt> ")"
                   | ε
```

---
