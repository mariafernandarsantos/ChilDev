# Especificação completa usando expressões regulares
# 1. Identificadores
Nomes dados a sinais, variáveis, entidades, etc.

## 1.1. Identificadores Básicos

Nomes padrão compostos por letras, números e sublinhados.

**Regex:** `[a-zA-Z]([a-zA-Z0-9]|_[a-zA-Z0-9])*`

## 1.2. Identificadores Estendidos

Nomes que permitem caracteres especiais, delimitados por `\`.

**Regex:** `\\([^\\]|\\\\)*\\`

# 2. Literais
Valores constantes escritos diretamente no código.

## 2.1. Literais de String

Sequências de caracteres delimitadas por aspas duplas.

**Regex:** `"([^"]|"")*"`

## 2.2. Literais Numéricos Inteiros

Números inteiros em base decimal.

**Regex:** `\d(_?\d)*`

## 2.3. Literais Numéricos Reais

Números de ponto flutuante.

**Regex:** `\d(_?\d)*\.\d(_?\d)*([Ee][+-]?\d(_?\d)*)?`

## 2.4. Literais Numéricos Baseados

Números em bases de 2 a 16 (binário, octal, hexadecimal).

**Regex:** `(1[0-6]|[2-9])#[0-9a-fA-F](_?[0-9a-fA-F])*(\.[0-9a-fA-F](_?[0-9a-fA-F])*)?#([Ee][+-]?\d(_?\d)*)?`

# 3. Operadores
Símbolos que executam operações (aritméticas, lógicas, etc.).

**Regex:** `=>|:=|/=|<=|>=|\*\*|<>|<|>|=|\+|-|&|\*|/`

# 4. Delimitadores
Caracteres usados para agrupar e separar elementos da sintaxe.

**Regex:** `[();:.,']`

# 5. Comentários
Texto ignorado pelo compilador.

**Regex:** `[//, ///]`

# Resolução Sistemática de Conflitos na ChilDev

## 1. Identificador vs Palavra-chave  

*O problema:* Ambiguidade entre nomes de variáveis e palavras reservadas da linguagem (ex: se, var, enquanto).  

*Alternativas:*  
- Permitir que palavras-chave sejam usadas como identificadores (com escape, ex: \se).  
- Proibir completamente o uso de palavras-chave como identificadores.  

*Decisão:* Palavras-chave são reservadas e não podem ser usadas como identificadores.  

*Exemplos:*  
```
var se = 5   // erro: se é palavra-chave
var idade = 5 // válido
```

 *Consequências:*  
- Simplifica o parser e evita ambiguidade na análise léxica.  
- Pode limitar nomes criativos, mas favorece clareza e previsibilidade.  

## 2. Operadores  

*O problema:* Ambiguidade na precedência e associatividade de operadores (+, *, ==, &&, etc.).  

*Alternativas:*  
- Definir precedência e associatividade manualmente.  
- Usar parênteses obrigatórios para expressões complexas.  

*Decisão:* ChilDev define precedência fixa e associatividade *à esquerda* para operadores.  

*Exemplos:*  
```
2 + 3 * 4           // interpretado como 2 + (3 * 4) = 14
a == b && c == d    // interpretado como (a == b) && (c == d)
```

*Consequências:*  
- Evita interpretações ambíguas.  
- Permite expressões mais naturais sem excesso de parênteses.  

## 3. Ambiguidade Numérica  

*O problema:* Ambiguidade entre tipos numéricos (inteiro vs decimal) e coerção implícita.  

*Alternativas:*  
- Permitir conversão automática entre tipos.  
- Exigir conversão explícita com funções como toDecimal().  

*Decisão:* ChilDev permite *coerção implícita, mas emite **aviso* quando há risco de perda de precisão.  

*Exemplos:*  
```
var x: inteiro = 3.5 // coerção para 3, com aviso
var y: decimal = 2   // coerção segura
```

*Consequências:*  
- Flexibilidade para iniciantes.  
- Necessidade de validação semântica robusta para evitar erros silenciosos.  

## 4. Validação Sistemática de Especificações  

*O problema:* Como garantir que a linguagem funcione conforme especificado em todos os casos.  

*Alternativas:*  
- Testes manuais com exemplos variados.  
- Validação incremental com fases de desenvolvimento.  

 *Decisão:* ChilDev adota implementação incremental em *4 fases*:  
1. Tokens básicos  
2. Árvore sintática abstrata  
3. Análise semântica  
4. Geração de código  

*Exemplos:*  
- *Fase 1:* reconhecer var, se, +, ==.  
- *Fase 2:* construir árvore para se (x > 0) { ... }.  
- *Fase 3:* verificar se x foi declarado.  

*Consequências:*  
- Permite detectar erros cedo.  
- Facilita manutenção e evolução da linguagem.
  
# Implementação Incremental e Validação 

## Fase 1: Tokens Básicos e Arquitetura Fundamental

**Objetivo:** Construir o coração do nosso leitor de código. Ele vai aprender a reconhecer nomes de variáveis, números inteiros e as contas mais simples.

#### 1.1. O que o leitor vai aprender a reconhecer:

* **Nomes (Identificadores):** Os nomes que vamos dar para nossas variáveis.
    * **Regra:** Começa com uma letra, depois pode ter letras e números.
    * **Regex:** `[a-zA-Z][a-zA-Z0-9_]*`
* **Números Inteiros:**
    * **Regra:** Qualquer sequência de dígitos.
    * **Regex:** `\d+`
* **Operador "Recebe":** O símbolo para guardar um valor em uma caixinha.
    * **Símbolo:** `<-`
* **Operadores de Contas:** Para somar, subtrair e multiplicar.
    * **Símbolos:** `+`, `-`, `*`
* **Delimitadores:** Para organizar nosso código.
    * **Símbolos:** `(`, `)`

#### 1.2. Testando o aprendizado:

* **Código de teste:** `variável X <- 10;`
    * **Leitura esperada:** `NOME(variável)`, `NOME(X)`, `OPERADOR_RECEBE(<-)`, `NUMERO(10)`, `DELIMITADOR(;)`
* **Código de teste:** `Y <- (A + B) * C;`
    * **Leitura esperada:** `NOME(Y)`, `OPERADOR_RECEBE(<-)`, `DELIMITADOR(()`, `NOME(A)`, `OPERADOR(+)`, `NOME(B)`, `DELIMITADOR())`, `OPERADOR(*)`, `NOME(C)`, `DELIMITADOR(;)`
* **Teste de erro:** `123nome`
    * **Leitura esperada:** O leitor deve ser esperto e ver um `NUMERO(123)` e um `NOME(nome)`.

---

## Fase 2:  Literais Avançados e Comentários

**Objetivo:** Nosso leitor ficará mais inteligente, aprendendo a ler textos, números "quebrados" (com vírgula) e a ignorar nossas anotações (comentários).

#### 2.1. O que o leitor vai aprender a reconhecer:

* **Números Quebrados (Decimais):** Para coisas que não são inteiras, como 3.14.
    * **Regra:** Um número, um ponto, e outro número.
    * **Regex:** `\d+\.\d+`
* **Textos (Strings):** Qualquer coisa que estiver entre aspas duplas.
    * **Regra:** Começa com `"` e termina com `"`, e pode ter qualquer coisa no meio.
    * **Regex:** `"[^"]*"`
* **Anotações (Comentários):** Nossas notas que o computador vai pular.
    * **Regra:** Tudo que vier depois de `//` na mesma linha.
    * **Regex:** `//.*`
* **Melhoria:** Ensinar o leitor a entender números grandes com `_` para facilitar a leitura (ex: `1_000_000`).
    * **Regex para Números:** `\d(_?\d)*`

#### 2.2. Testando o aprendizado:

* **Código de teste:** `pi <- 3.14; // uma anotação `
    * **Leitura esperada:** `NOME(pi)`, `OPERADOR_RECEBE(<-)`, `NUMERO_QUEBRADO(3.14)`, `DELIMITADOR(;)` (a anotação é ignorada).
* **Código de teste:** `mensagem <- "Ola, amigo!";`
    * **Leitura esperada:** `NOME(mensagem)`, `OPERADOR_RECEBE(<-)`, `TEXTO("Ola, amigo!")`, `DELIMITADOR(;)`
* **Teste de erro:** `recado <- "esqueci de fechar`
    * **Leitura esperada:** O leitor deve avisar: "Opa, você esqueceu de fechar o texto com aspas!".

---

## Fase 3: Recursos Completos da Linguagem

**Objetivo:** Completar o vocabulário do nosso leitor com todas as palavras-chave e operadores de comparação da linguagem childev.

#### 3.1. O que o leitor vai aprender a reconhecer:

* **Palavras-Chave:** As palavras que dizem ao computador o que fazer.
    * **Palavras:** `programa`, `variavel`, `inicio`, `fim`, `se`, `entao`, `senao`, `repita`, `enquanto`, `para`, `leia`, `escreva`.
* **Operadores de Comparação:** Para ver se algo é igual, diferente, maior ou menor.
    * **Símbolos:** `==` (é igual?), `!=` (é diferente?), `>`, `<`, `>=`, `<=`
* **Textos com Truques:** Permitir que um texto tenha aspas dentro dele.
    * **Regra:** Para colocar aspas dentro de um texto, é só colocar duas seguidas: `""`
    * **Regex:** `"([^"]|"")*"`

#### 3.2. Testando o aprendizado:

* **Código de teste:** `se idade > 10 entao`
    * **Leitura esperada:** `PALAVRA_CHAVE(se)`, `NOME(idade)`, `OPERADOR_COMPARACAO(>)`, `NUMERO(10)`, `PALAVRA_CHAVE(entao)`.
* **Código de teste:** `escreva("Ele disse ""oi""!");`
    * **Leitura esperada:** `PALAVRA_CHAVE(escreva)`, `DELIMITADOR(()`, `TEXTO("Ele disse ""oi""!")`, `DELIMITADOR())`, `DELIMITADOR(;)`

---

## Fase 4: Polimento, Tratamento de Erros e Otimização

**Objetivo:** Fazer o "polimento final". Nosso leitor vai aprender a dar mensagens de erro superamigáveis e a funcionar bem rápido.

#### 4.1. O que vamos implementar:

* **Mensagens de Erro Amigáveis:**
    * O leitor deve saber exatamente a linha e a coluna onde encontrou algo que não entendeu.
    * Em vez de "Erro Léxico", ele dirá: "Opa! Não reconheci o símbolo '@' na linha 5, coluna 10. Que tal tentar outra coisa?"
* **Velocidade:**
    * Vamos revisar o código do leitor para ter certeza de que ele é super-rápido, mesmo lendo programas gigantes feitos pela turma toda!
* **Caçador de Erros:**
    * Testar o leitor com códigos que têm vários erros de propósito, para garantir que ele não trave e consiga apontar todos os problemas.

#### 4.2. Testando o aprendizado:

* Criar um código com um símbolo inválido, como `valor <- 100 $;`.
    * **Teste:** Verificar se o leitor aponta o erro exatamente no `$` e informa a linha e a coluna corretas.
* Usar todos os testes das fases anteriores para garantir que não quebramos nada que já funcionava.
* Criar um programa de teste bem grande para ver se o leitor continua rápido.


# Estratégias de Teste para o Leitor de Código da "childev"

## 1. Estratégias de Teste Abrangentes

### a) Testes por Categoria

Vamos criar uma bateria de testes para cada tipo de "palavrinha" (token) que a `childev` conhece.

* **Nomes (Identificadores):**
    * **Válidos:** `x`, `nomeLongo`, `caixinha_azul`, `personagem1`
    * **Inválidos (devem ser rejeitados):** `_nome`, `1personagem`, `nome-com-hifen`, `@coisa`

* **Números:**
    * **Inteiros Válidos:** `0`, `123`, `5_000`
    * **Quebrados Válidos:** `0.5`, `3.14`
    * **Casos Limítrofes (devem ser rejeitados em childev):** `.5`, `1.` (Nossa regra será: sempre precisa ter número antes E depois do ponto).
    * **Inválidos:** `1.2.3`, `5_`, `_5`, `1.a`

* **Textos (Strings):**
    * **Válidos:** `""` (texto vazio), `"Olá, mundo!"`, `"Ele disse ""oi"" para mim."`
    * **Inválidos:** `"texto que esqueceu de fechar` (deve gerar um erro de "texto não terminado").

* **Operadores e Delimitadores:**
    * **Teste de Reconhecimento:** Garantir que todos os símbolos como `<-`, `+`, `*`, `==`, `!=`, `<`, `>=`, `(`, `)`, `;` são reconhecidos corretamente.

### b) Testes de Integração

Depois de testar as peças separadamente, vamos testar como elas funcionam juntas em um trecho de código real da `childev`.

**Código de Exemplo:**
```
variavel clima <- "sol";
se clima == "sol" entao
escreva("Vamos ao parque!"); // Que legal
fim
```

**Teste:** Verificar se a sequência de tokens gerada está perfeitamente correta, ignorando os comentários e reconhecendo cada palavra-chave, nome, operador e texto na ordem certa.

### c) Testes de Ambiguidade

Aqui, tentamos "confundir" o leitor para garantir que ele sempre tome a decisão certa.

* **Regra do "Maior Pedaço":** O leitor deve sempre tentar formar o maior token possível.
    * **Entrada:** `valor>=10`
    * **Saída Correta:** `NOME(valor)`, `OPERADOR(>=)`, `NUMERO(10)`
    * **Saída Incorreta:** `NOME(valor)`, `OPERADOR(>)`, `OPERADOR(=)`, `NUMERO(10)`

* **Conflito entre Tipos:**
    * **Entrada:** `123comeca`
    * **Saída Correta:** `NUMERO(123)`, `NOME(comeca)`
    * **Entrada:** `se123`
    * **Saída Correta:** `NOME(se123)` (pois não é exatamente a palavra-chave `se`).

### d) Testes de Casos Extremos (ou "Testes de Stress")

Vamos levar nosso leitor ao limite para descobrir se ele aguenta o tranco.

* **Entradas Gigantes:** Um texto (string) com 10.000 caracteres; um número com 500 dígitos. O leitor não pode travar ou estourar a memória.
* **Repetições Malucas:** Um arquivo contendo `;;;;;;;;;;;;;;;;;;;;;;`.
* **Caracteres Estranhos:** Um arquivo com emojis (😀), acentos de outras línguas (ñ, ü) ou caracteres de controle. O leitor deve ou ignorá-los ou reportar um erro amigável, mas nunca quebrar.
* **Arquivo Vazio:** O que acontece se dermos um arquivo em branco para o leitor? Ele deve terminar silenciosamente, sem gerar tokens nem erros.

---

## 2. Framework de Testes Recomendado

Para fazer todos esses testes de forma organizada e automática, vamos criar um "Robô de Testes".

### a) Estrutura Sistemática

Nosso Robô organizará os testes em quatro missões:

* **Casos de Conformidade (Testes "Isso Funciona?"):**
    * *Missão:* Verificar se códigos válidos são lidos corretamente.
    * *Exemplo:* Dar ao leitor `variavel x <- 5;` e verificar se ele devolve a lista exata de tokens esperada.

* **Casos de Rejeição (Testes "Isso Avisa o Erro?"):**
    * *Missão:* Verificar se códigos com erros são corretamente identificados.
    * *Exemplo:* Dar ao leitor `x <- 1.2.3;` e verificar se ele devolve a mensagem de erro "Número quebrado malformado".

* **Casos de Ambiguidade (Testes "Ele Não Fica Confuso?"):**
    * *Missão:* Testar as situações de conflito que vimos acima.
    * *Exemplo:* Dar ao leitor `valor>=10` e checar se o token `OPERADOR(>=)` foi gerado.

* **Casos de Stress (Testes "Ele Aguenta Pressão?"):**
    * *Missão:* Rodar os testes de casos extremos.
    * *Exemplo:* Dar ao leitor um arquivo gigante e medir o tempo de execução e o uso de memória.

### b) Automação

Ninguém quer rodar centenas de testes na mão! O Robô de Testes fará isso por nós.

**Como Funciona:**
1.  Criamos uma pasta `testes/` com dezenas de pequenos arquivos `.childev`.
2.  Cada arquivo terá um "gabarito" associado, que diz qual é a saída correta (a lista de tokens ou a mensagem de erro).
3.  Criamos um script principal (o Robô) que, ao ser executado, passa por todos os arquivos de teste, roda nosso Leitor de Código e compara o resultado com o gabarito.
4.  No final, ele imprime um relatório: `Teste 'numero_simples' passou!` `Teste 'texto_com_aspas' passou!` `Teste 'numero_malformado' FALHOU!`.

# Métricas de Qualidade

## Indicadores de Sucesso  

Como saber se a especificação léxica e a gramática da linguagem *Childev* estão funcionando bem?  
As métricas a seguir orientam o desenvolvimento, validam a proposta pedagógica e fornecem feedback objetivo sobre o progresso da linguagem.  

---

### Métricas de Correção  

- *Taxa de Reconhecimento Correto:*  
  100% dos tokens válidos da linguagem (identificadores, números, strings, palavras-chave e delimitadores) são reconhecidos corretamente de acordo com as regras definidas.  

- *Taxa de Rejeição Correta:*  
  100% das cadeias inválidas são rejeitadas (ex.: variáveis não declaradas, tipos incompatíveis, strings sem fechamento, comentários malformados).  

- *Precisão de Localização:*  
  Mensagens de erro devem indicar a posição exata do token ou estrutura inválida, com feedback claro e amigável para o público infantil.  

---

### Métricas de Qualidade  

- *Completude:*  
  Todas as construções previstas (declarações de variáveis, atribuições, condicionais, laços, funções, classes, escrita na tela) possuem tokens e regras formais correspondentes.  

- *Não-ambiguidade:*  
  A gramática é livre de contexto, com regras claras de precedência e associação (ex.: senão sempre vinculado ao se mais próximo; operadores aritméticos associativos à esquerda). Conflitos são resolvidos de forma sistemática.  

- *Legibilidade:*  
  A sintaxe é simplificada e em português, com comandos como escreva, se, para, o que torna os programas compreensíveis, manuteníveis e acessíveis a crianças entre 7 e 12 anos.

# Mensagens de Erro 

## Erro na Escrita
> "Eita, não consegui entender essa palavra {palavra x}, confira se escreveu certo."

## Erro Variável sem conteúdo
> "Opa, está faltando algo, sua variável {variavel x} está vazia!"

## Erro Variável Inexistente
> "Opa, parece que essa variável {variavel x} não existe, vamos criar uma?"

## Erro Nome Repetido
> "Ei, parece que já existe alguém com esse nome {nome X}, coloque outro."

## Erro Falta de Parênteses ou Chaves
> "HMM... Parece que faltou algo, confira se não esqueceu de abrir ou fechar nada."


