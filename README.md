# Pré-requisitos

Antes de começar, você precisa ter o **Node.js** instalado no seu computador, pois o script é executado com ele.

- **Node.js**: Se você ainda não o tem, [clique aqui para baixar e instalar](https://nodejs.org/).

# Como Executar

1.  Abra seu terminal.

2.  A partir da pasta principal do projeto (`ChilDev-main`), navegue até o diretório onde o analisador está localizado com o seguinte comando:
    ```bash
    cd docs\lib\lexer
    ```

3.  Uma vez dentro da pasta `lexer`, execute o analisador léxico com o comando:
    ```bash
    node analisador-lexico.js
    ```

## Exemplo de Saída

Após executar o comando, você deverá ver no terminal a lista de tokens identificados no código de exemplo, formatada da seguinte maneira:

```js
[
  { type: 'KEYWORD', value: 'var', line: 2 },
  { type: 'IDENTIFIER', value: 'idade', line: 2 },
  { type: 'OPERATOR', value: '=', line: 2 },
  { type: 'LITERAL_INTEIRO', value: '10', line: 2 },
  { type: 'DELIMITER', value: ';', line: 2 },
  { type: 'EOF', value: 'EndOfFile', line: 3 }
]
```
