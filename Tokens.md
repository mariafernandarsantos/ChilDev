## Identificadores

### Conjunto de símbolos válidos
* `letra = {a, b, ..., z, A, B, ..., Z}`
* `dígito = {0, 1, 2, ..., 9}`
* `underscore = {_}`

### Regras de formação usando operações com linguagens
* `primeiro = letra U underscore`
* `resto = letra U dígito U underscore`
* `identificador = primeiro(resto)*`

### Casos especiais e exceções
* **Tokens fixos distintos:** (`if`, `else`, `while`, `for`, `class`, `public`, `private`, `int`, `string`, `bool`, etc.). O analisador léxico deve verificar se a cadeia de caracteres reconhecida como identificador não pertence a este conjunto de palavras reservadas.
* Letras maiúsculas e minúsculas são símbolos distintos.

## Números

### Conjunto de símbolos válidos
* `dígito = {0, 1, 2, ..., 9}`
* `sinal = {+, -}`
* `expoente = {e, E}`

### Regras de formação usando operações com linguagens
* `inteiro = dígito+`
* `decimal = dígito+.dígito+`
* `científico = (inteiro ∪ decimal)expoente(sinal)?inteiro`
* `número = inteiro ∪ decimal ∪ científico`

### Casos especiais e exceções
* Notação decimal flexível, ou seja, `(dígito*).dígito+ | dígito+.(dígito*)`
* Não é necessário sinal no início do número.
* Apenas base decimal.
* Não cobre caso de ponto flutuante.

## Strings Literais

### Conjunto de símbolos válidos
* `aspas = {"}`
* `normal = Σ - {", \, nova_linha}`
* `escape = {\", \\, \n, \t, \r}`

### Regras de formação usando operações com linguagens
* `conteúdo = (normal U escape)*`
* `string = aspas conteúdo aspas`

### Casos especiais e exceções
* A quebra de linha (`\n`) é explicitamente excluída do conjunto de caracteres `normal`, mas é incluída como uma sequência de escape.
* Não contempla a possibilidade de string multi-linha.

## Comentários

### Conjunto de símbolos válidos
* `//`: Símbolo de início do comentário de linha.
* `///`: Símbolo de início e fim do comentário de bloco.
* `qualquer_caractere = Σ`

### Regras de formação usando operações com linguagens
* `comentário_linha = // (qualquer_caractere ∖ nova_linha)* nova_linha`
* `comentário_bloco = /// (qualquer_caractere ∖ ///)* ///`

### Casos especiais e exceções
* Não permite aninhamento no comentário do bloco.
* Não pode haver fechamento do bloco sem abertura.

## Palavras-Chave

### Conjunto de símbolos válidos
* `{as, break, case, catch, class, const, continue, default, delete, do, else, extends, false, finally, for, function, if, import, in, let, new, null, return, switch, this, throw, true, try, var, void, while, with}`

### Regras de formação usando operações com linguagens
* Não são construídas dinamicamente a partir de regras de formação, mas são tokens predefinidos.

### Casos especiais e exceções
* Se uma cadeia de caracteres puder ser reconhecida tanto como palavra-chave quanto como identificador, ela deve ser classificada como palavra-chave.
* As palavras-chave devem ser case-sensitive.
* Nenhum identificador pode ter o mesmo nome de uma palavra-chave.

## Delimitadores

### Conjunto de símbolos válidos
* `Delimitador = { ( , ) , { , } , [ , ] , ; , , , . , : }`

### Regras de formação usando operações com linguagens
* Não são construídas dinamicamente a partir de regras de formação, mas são tokens predefinidos.

### Casos especiais e exceções
* Não precisam de espaços em branco ao redor para serem reconhecidos.
* A análise léxica apenas reconhece os delimitadores como tokens.
