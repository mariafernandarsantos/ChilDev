// Importa a lógica de cada módulo de token
import { regexIdentificador, palavrasChave } from './afd-identificador.js';
import { regexNumero } from './afd-numeros.js';
import { regexString } from './afd-string.js';
import { regexComentarioBloco } from './afd-comment-block.js';
import { regexComentarioLinha } from './afd-comment-line.js';
import { regexDelimitador } from './afd-delimitadores.js';


function analisadorLexico(codigo) {
    let ponteiro = 0;
    const tokens = [];
    let linha = 1;

    const reconhecedores = [
        { tipo: 'COMMENT_BLOCK', regex: regexComentarioBloco, ignora: true },
        { tipo: 'COMMENT_LINE', regex: regexComentarioLinha, ignora: true },
        { tipo: 'LITERAL_STRING', regex: regexString, processa: (val) => val.slice(1, -1) },
        { tipo: 'NUMBER', regex: regexNumero },
        { tipo: 'IDENTIFIER_OR_KEYWORD', regex: regexIdentificador },
        { tipo: 'DELIMITER_OR_OPERATOR', regex: regexDelimitador },
    ];

    while (ponteiro < codigo.length) {
        let espacos = codigo.substring(ponteiro).match(/^\s+/);
        if (espacos) {
            const espacoStr = espacos[0];
            ponteiro += espacoStr.length;
            const linhasQuebradas = espacoStr.split('\n').length - 1;
            if (linhasQuebradas > 0) {
                linha += linhasQuebradas;
            } 
            continue;
        }

        let matchEncontrado = false;
        const fatiaCodigo = codigo.substring(ponteiro);

        for (const rec of reconhecedores) {
            const match = fatiaCodigo.match(rec.regex);
            
            if (match) {
                let valor = match[0];
                let tipo = rec.tipo;

                if (tipo === 'IDENTIFIER_OR_KEYWORD') {
                    tipo = palavrasChave.has(valor) ? 'KEYWORD' : 'IDENTIFIER';
                }
                
                if (rec.processa) {
                    valor = rec.processa(valor);
                }

                if (!rec.ignora) {
                    tokens.push({ type: tipo, value: valor, line: linha});
                }

                ponteiro += match[0].length;
                matchEncontrado = true;
                break;
            }
        }
        
        if (!matchEncontrado) {
            throw new Error(`Erro Léxico: Caractere inesperado '${fatiaCodigo[0]}' na linha ${linha}`);
        }
    }
    return tokens;
}


// --- Exemplo de Uso ---
const meuCodigo = `var idade = 10;`;

try {
    const tokensResultantes = analisadorLexico(meuCodigo);
    console.log(JSON.stringify(tokensResultantes, null, 2));
} catch (e) {
    console.error(e.message);
}