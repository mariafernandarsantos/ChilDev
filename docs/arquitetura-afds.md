# Estados dos AFDs

## 1. Identificadores

### Regras:
- Um identificador começa com uma letra ou o símbolo underscore (_).
- Depois da primeira letra, ele pode ter letras, dígitos ou underscores.
- O identificador não pode ser uma palavra-chave.

### Estados do AFD:
- *q0 (início)* → Verifica se é uma letra ou _ (primeiro símbolo).
  - Se sim, vai para q_id (estado de identificador).
  - Se não, vai para um estado de erro.
- *q_id (identificador)* → Verifica se o próximo símbolo é uma letra, dígito ou _ (resto do identificador).
  - Se sim, permanece em q_id.
  - Se não, verifica se é uma palavra-chave ou não:
    - Se for palavra-chave, vai para o estado q_kw (palavra-chave).
    - Se não for, vai para o estado final de identificador válido ([*]).

---

## 2. Números

### Regras:
- O número pode ser um *inteiro, **decimal* ou *científico*.
- Um número pode ter um ponto ou um expoente (e ou E).

### Estados do AFD:
- *q0 (início)* → Verifica se é um dígito ou um sinal de número.
  - Se for um dígito, vai para q_num.
  - Se for um ponto (.), vai para q_decimal.
  - Se for um expoente (e ou E), vai para q_expoente.
  - Se for inválido, vai para q_dead (erro).
- *q_num (número inteiro)* → Verifica se o próximo símbolo é um dígito.
  - Se sim, permanece em q_num.
  - Se for um ponto (.), vai para q_decimal.
  - Se for um expoente (e ou E), vai para q_expoente.
  - Se não, vai para o estado final de número válido ([*]).
- *q_decimal (número decimal)* → Verifica se o próximo símbolo é um dígito.
  - Se sim, permanece em q_decimal.
  - Se não, vai para o estado final de número decimal válido ([*]).
- *q_expoente (número científico)* → Verifica se o próximo símbolo é um dígito, podendo ter um sinal (+ ou -).
  - Se sim, vai para q_num novamente.
  - Se não, vai para o estado final de número científico válido ([*]).

---

## 3. Strings Literais

### Regras:
- Uma string é iniciada e finalizada por aspas (").
- A string pode conter caracteres normais ou sequências de escape.

### Estados do AFD:
- *q0 (início)* → Verifica se é uma aspas (").
  - Se sim, vai para q_str (estado de string).
  - Se não, vai para q_dead.
- *q_str (string)* → Verifica se o próximo caractere é normal ou uma sequência de escape.
  - Se for normal, permanece em q_str.
  - Se for uma sequência de escape, permanece em q_str.
  - Se encontrar outra aspas ("), vai para o estado final de string válida ([*]).

---

## 4. Comentários

### Regras:
- Comentário de linha: começa com // e termina com uma nova linha.
- Comentário de bloco: começa com /// e termina com ///.

### Estados do AFD:
- *q0 (início)* → Verifica se é o início de um comentário de linha (//) ou de bloco (///).
  - Se for //, vai para q_comm_line.
  - Se for ///, vai para q_comm_block.
  - Se não, vai para q_dead.
- *q_comm_line (comentário de linha)* → Verifica se o próximo caractere é qualquer coisa, exceto a nova linha.
  - Se sim, permanece em q_comm_line.
  - Se encontrar nova linha (\n), vai para o estado final de comentário de linha válido ([*]).
- *q_comm_block (comentário de bloco)* → Verifica se o próximo caractere é qualquer coisa até encontrar /// novamente.
  - Se sim, permanece em q_comm_block.
  - Se encontrar ///, vai para o estado final de comentário de bloco válido ([*]).

---

## 5. Palavras-Chave

### Regras:
- São tokens fixos, como if, else, while, etc.
- Se uma sequência de caracteres for reconhecida como palavra-chave, deve ser classificada como tal, mesmo que seja identificador.

### Estados do AFD:
- As palavras-chave são tratadas diretamente após a identificação do identificador (q_id), sendo que, caso seja uma palavra-chave, o analisador léxico vai para o estado q_kw.

---

## 6. Delimitadores

### Regras:
- Delimitadores são símbolos predefinidos como parênteses, chaves, colchetes, ponto e vírgula, vírgula, ponto, dois pontos.

### Estados do AFD:
- *q0 (início)* → Verifica se o símbolo é um delimitador.
  - Se sim, vai para o estado final de delimitador válido ([*]).
  - Se não, vai para q_dead.

---

## 7. Estado de Erro (q_dead)

### Regras:
- Se um símbolo não se encaixar em nenhuma das categorias acima, o estado de erro é acionado.

### Estados do AFD:
- Qualquer transição inválida que não se encaixe nas categorias definidas leva para o estado q_dead.

---

## Resumo do AFD:
- *q0 (início)* - Verifica o primeiro caractere de cada token.
- *q_id* - Reconhece identificadores.
- *q_kw* - Reconhece palavras-chave.
- *q_num* - Reconhece números inteiros.
- *q_decimal* - Reconhece*_*
