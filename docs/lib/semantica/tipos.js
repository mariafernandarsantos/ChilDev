/** Classe base para todos os tipos. */
export class Tipo {
  mostrar() {
    return "desconhecido";
  }
  
  /** Verifica se este tipo é compatível com outro. */
  eCompativel(outroTipo) {
    return this.mostrar() === outroTipo.mostrar();
  }
}

/** Tipos primitivos: inteiro, decimal, numero, string, bool, void, erro. */
export class TipoPrimitivo extends Tipo {
  constructor(nome) {
    super();
    this.nome = nome;
  }
  
  mostrar() {
    return this.nome;
  }
  
  eCompativel(outro) {
    const t1 = this.nome;
    const t2 = outro.mostrar();

    // 1. Tipos iguais são sempre compatíveis
    if (t1 === t2) return true;
    
    // 2. Regra de Promoção: Decimal aceita Inteiro
    if (t1 === 'decimal' && t2 === 'inteiro') return true;
    
    // 3. Regra de Validação Genérica (CRUCIAL PARA O SEU ERRO):
    // O tipo 'numero' (usado pelo analisador para checar operadores *, /, +, -)
    // deve aceitar tanto 'inteiro' quanto 'decimal'.
    if (t1 === 'numero' && (t2 === 'inteiro' || t2 === 'decimal')) return true;

    // 4. Regra de Literais:
    // Variáveis 'inteiro' ou 'decimal' aceitam literais genéricos ('numero')
    if ((t1 === 'inteiro' || t1 === 'decimal') && t2 === 'numero') return true;

    return false;
  }
}

/** Representa Arrays (ex: inteiro[]) */
export class TipoArray extends Tipo {
  constructor(tipoElemento) {
    super();
    this.tipoElemento = tipoElemento; 
  }
  
  mostrar() {
    return `${this.tipoElemento.mostrar()}[]`;
  }

  eCompativel(outro) {
    if (outro instanceof TipoArray) {
      return this.tipoElemento.eCompativel(outro.tipoElemento);
    }
    return false;
  }
}

/** Representa a assinatura de uma função. */
export class TipoFuncao extends Tipo {
  constructor(tiposParams, tipoRetorno) {
    super();
    this.tiposParams = tiposParams;
    this.tipoRetorno = tipoRetorno;
  }
  
  mostrar() {
    const params = this.tiposParams.map(p => p.mostrar()).join(', ');
    return `(${params}) -> ${this.tipoRetorno.mostrar()}`;
  }
}

export const TIPO_INTEIRO = new TipoPrimitivo('inteiro');
export const TIPO_DECIMAL = new TipoPrimitivo('decimal'); 
export const TIPO_STRING  = new TipoPrimitivo('string');
export const TIPO_VOID    = new TipoPrimitivo('void');
export const TIPO_NUMERO  = new TipoPrimitivo('numero');
export const TIPO_BOOL    = new TipoPrimitivo('bool');
export const TIPO_ERRO    = new TipoPrimitivo('erro');