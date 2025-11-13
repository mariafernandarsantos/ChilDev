
class AFN {
  constructor(estados, alfabeto, transicoes, inicial, finais) {
    this.estados = estados;
    this.alfabeto = alfabeto;
    this.transicoes = transicoes; // { estado: { simbolo: [destinos] } }
    this.inicial = inicial;
    this.finais = finais;
  }

  epsilonFecho(estados) {
    const pilha = [...estados];
    const fecho = new Set(estados);

    while (pilha.length > 0) {
      const estado = pilha.pop();
      const destinos = (this.transicoes[estado] && this.transicoes[estado]["ε"]) || [];

      for (const dest of destinos) {
        if (!fecho.has(dest)) {
          fecho.add(dest);
          pilha.push(dest);
        }
      }
    }
    return fecho;
  }

  mover(estados, simbolo) {
    const destinos = new Set();
    for (const estado of estados) {
      const trans = this.transicoes[estado];
      if (trans && trans[simbolo]) {
        for (const d of trans[simbolo]) destinos.add(d);
      }
    }
    return destinos;
  }

  construirAFD() {
    const afdEstados = [];
    const afdTransicoes = {};
    const fila = [];

    const inicialFecho = this.epsilonFecho([this.inicial]);
    const inicialNome = Array.from(inicialFecho).sort().join(",");
    fila.push(inicialFecho);
    afdEstados.push(inicialFecho);
    afdTransicoes[inicialNome] = {};

    const visitados = new Set([inicialNome]);

    while (fila.length > 0) {
      const atual = fila.shift();
      const nomeAtual = Array.from(atual).sort().join(",");
      afdTransicoes[nomeAtual] = {};

      for (const simbolo of this.alfabeto) {
        if (simbolo === "ε") continue;
        const destino = this.mover(atual, simbolo);
        const fechoDestino = this.epsilonFecho(destino);
        if (fechoDestino.size === 0) continue;

        const nomeDestino = Array.from(fechoDestino).sort().join(",");
        afdTransicoes[nomeAtual][simbolo] = nomeDestino;

        if (!visitados.has(nomeDestino)) {
          visitados.add(nomeDestino);
          afdEstados.push(fechoDestino);
          fila.push(fechoDestino);
        }
      }
    }

    const afdFinais = [];
    for (const conjunto of afdEstados) {
      for (const f of this.finais) {
        if (conjunto.has(f)) {
          afdFinais.push(Array.from(conjunto).sort().join(","));
          break;
        }
      }
    }

    return {
      estados: Array.from(visitados),
      alfabeto: this.alfabeto.filter(s => s !== "ε"),
      transicoes: afdTransicoes,
      inicial: inicialNome,
      finais: afdFinais
    };
  }
}

const estados = [
  "qStart",
  "q0s", "q1s",
  "q0n", "q1n", "q2n", "q3n", "q4n", "q5n", "q6n",
  "q0i", "q1i",
  "q0d", "q1d",
  "q0c", "q1c", "q2c"
];

const alfabeto = [
  'ε', '"', 'char', 'escape', 'dígito', '.', 'exp', 'sinal',
  'letra', '_', 'delimitador', '//', '///', 'no escape', 'não repetiu ///'
];

// Transições simplificadas 
const transicoes = {
  qStart: { 'ε': ['q0s', 'q0n', 'q0i', 'q0d', 'q0c'] },

  // String literal
  q0s: { '"': ['q1s'] },
  q1s: { 'char': ['q1s'], 'escape': ['q1s'], '"': [] },

  // Número
  q0n: { 'dígito': ['q1n'], '.': ['q2n'] },
  q1n: { 'dígito': ['q1n'], '.': ['q2n'], 'exp': ['q4n'] },
  q2n: { 'dígito': ['q3n'], 'exp': ['q4n'] },
  q3n: { 'dígito': ['q3n'] },
  q4n: { 'sinal': ['q5n'], 'dígito': ['q6n'] },
  q5n: { 'dígito': ['q6n'] },
  q6n: { 'dígito': ['q6n'] },

  // Identificador
  q0i: { 'letra': ['q1i'], '_': ['q1i'] },
  q1i: { 'letra': ['q1i'], 'dígito': ['q1i'], '_': ['q1i'] },

  // Delimitador
  q0d: { 'delimitador': ['q1d'] },
  q1d: { 'delimitador': ['q1d'] },

  // Comentário
  q0c: { '//': ['q1c'], '///': ['q2c'] },
  q1c: { 'no escape': ['q1c'] },
  q2c: { 'não repetiu ///': ['q2c'] }
};

// Estados finais 
const finais = [
  'q1s', 'q1n', 'q3n', 'q6n', 'q1i', 'q1d', 'q1c', 'q2c'
];

const afn = new AFN(estados, alfabeto, transicoes, "qStart", finais);


// Converte para AFD
const afd = afn.construirAFD();

console.log(" AFD GERADO A PARTIR DO AFN:");
console.log(JSON.stringify(afd, null, 2));