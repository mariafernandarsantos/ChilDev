/** Classe base para todos os tipos. */
export class Tipo {
  mostrar() {
    return "desconhecido";
  }
  
  /** Verifica se este tipo é compatível com outro. */
  eCompativel(outroTipo) {
    // Regra padrão: tipos devem ser exatamente iguais
    return this.mostrar() === outroTipo.mostrar();
  }
}

/** Tipos primitivos: inteiro, numero, string, bool, void, erro. */
export class TipoPrimitivo extends Tipo {
  constructor(nome) {
    super();
    this.nome = nome;
  }
  
  mostrar() {
    return this.nome;
  }
  
  eCompativel(outroTipo) {
    // Regra especial: 'inteiro' (declarado) é compatível com 'numero' (literal)
    if (this.nome === 'inteiro' && outroTipo.mostrar() === 'numero') {
      return true;
    }
    if (this.nome === 'numero' && outroTipo.mostrar() === 'inteiro') {
      return true;
    }
    // Regra padrão
    return this.mostrar() === outroTipo.mostrar();
  }
}

/** Representa a assinatura de uma função. */
export class TipoFuncao extends Tipo {
  constructor(tiposParams, tipoRetorno) {
    super();
    this.tiposParams = tiposParams; // Array de Tipos
    this.tipoRetorno = tipoRetorno; // Um Tipo
  }
  
  mostrar() {
    const params = this.tiposParams.map(p => p.mostrar()).join(', ');
    return `(${params}) -> ${this.tipoRetorno.mostrar()}`;
  }
}

// Tipos pré-definidos para conveniência 
export const TIPO_INTEIRO = new TipoPrimitivo('inteiro');
export const TIPO_NUMERO = new TipoPrimitivo('numero'); // Para literais numéricos
export const TIPO_STRING = new TipoPrimitivo('string');
export const TIPO_BOOL = new TipoPrimitivo('bool'); // Para condições
export const TIPO_VOID = new TipoPrimitivo('void');
export const TIPO_ERRO = new TipoPrimitivo('erro'); // Para evitar erros em cascata