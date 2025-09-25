// Exporta a expressão regular para identificar a forma de um identificador
export const regexIdentificador = /^[a-zA-Z_][a-zA-Z0-9_]*/;

// Exporta o conjunto de palavras-chave da sua linguagem
export const palavrasChave = new Set([
    'var', 'escreva', 'se', 'senao', 'enquanto', 'para', 'de', 'ate',
    'inteiro', 'decimal', 'texto', 'booleano', 'verdadeiro', 'falso',
    'e', 'ou', 'nao'
]);