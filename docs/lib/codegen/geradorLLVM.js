import * as AST from '../parser/ast/ast.js';

export class GeradorLLVM extends AST.VisitorAST {
  constructor() {
    super();
    this.header = ""; 
    this.body = "";   
    
    this.regCounter = 0;
    this.labelCounter = 0;
    this.stringCounter = 0;
    
    this.tabelaVariaveis = new Map();
    this.tiposRegistradores = new Map();
    this.funcoesGlobais = new Map();
    this.stringsConstantes = new Map();
  }

  emit(codigo) { this.body += codigo + "\n"; }
  emitHeader(codigo) { this.header += codigo + "\n"; }
  
  novoReg() { return `%t${++this.regCounter}`; }
  novoLabel(p) { return `${p}${++this.labelCounter}`; }
  
  obterCodigo() { return this.header + "\n" + this.body; }

  setTipoReg(reg, tipo) { this.tiposRegistradores.set(reg, tipo); }
  getTipoReg(reg) {
    if (!reg.startsWith('%')) {
       return reg.includes('.') ? 'double' : 'i32';
    }
    return this.tiposRegistradores.get(reg) || 'i32';
  }

  traduzirTipo(tipoStr) {
    // Mapeamento de Tipos da Linguagem -> LLVM
    if (tipoStr === 'void') return 'void';
    if (tipoStr === 'decimal') return 'double';
    if (tipoStr === 'inteiro') return 'i32';
    
    // Mapeia 'string' para 'i8*'
    if (tipoStr === 'string') return 'i8*'; 

    // Mapeamento de Tipos LLVM 
    if (tipoStr === 'double') return 'double';
    if (tipoStr === 'i32') return 'i32';
    if (tipoStr === 'i8*') return 'i8*';
    
    return 'i32'; 
  }

  registrarStringGlobal(texto) {
    if (this.stringsConstantes.has(texto)) {
      return this.stringsConstantes.get(texto);
    }

    const nomeVar = `@.str.const.${++this.stringCounter}`;
    
    const tamanho = texto.length + 1; 
    
    const textoLLVM = texto.replace(/\n/g, '\\0A');
    
    this.emitHeader(`${nomeVar} = private unnamed_addr constant [${tamanho} x i8] c"${textoLLVM}\\00"`);
    
    const info = { nome: nomeVar, tamanho: tamanho };
    this.stringsConstantes.set(texto, info);
    return info;
  }

  visitarPrograma(nodo) {
    this.emitHeader(`; Módulo com suporte a Inteiros, Decimais e Strings`);
    this.emitHeader(`declare i32 @printf(i8*, ...)`);
    
    this.emitHeader(`@.fmt_int = private unnamed_addr constant [4 x i8] c"%d\\0A\\00"`);
    this.emitHeader(`@.fmt_double = private unnamed_addr constant [6 x i8] c"%.2f\\0A\\00"`);
    this.emitHeader(`@.fmt_str = private unnamed_addr constant [3 x i8] c"%s\\00"`); 

    for (const decl of nodo.declaracoes) {
      if (decl instanceof AST.NodoDeclaracaoFuncao) decl.aceitar(this);
    }
  }

  visitarDeclaracaoFuncao(nodo) {
    this.tabelaVariaveis.clear();
    this.regCounter = 0;

    const tipoRetStr = nodo.tipoRetorno ? nodo.tipoRetorno.value : 'void';
    const tipoRetLLVM = this.traduzirTipo(tipoRetStr);
    
    this.funcoesGlobais.set(nodo.nome.value, tipoRetLLVM);
    
    const params = nodo.parametros.map(p => {
        const tipoP = this.traduzirTipo(p.tipo.value);
        return `${tipoP} %arg_${p.nome.value}`;
    }).join(', ');

    this.emit(`define ${tipoRetLLVM} @${nodo.nome.value}(${params}) {`);
    this.emit(`entry:`);

    for (const param of nodo.parametros) {
      const tipoP = this.traduzirTipo(param.tipo.value);
      const regPtr = `%ptr_${param.nome.value}`;
      
      this.emit(`  ${regPtr} = alloca ${tipoP}`);
      this.emit(`  store ${tipoP} %arg_${param.nome.value}, ${tipoP}* ${regPtr}`);
      
      this.tabelaVariaveis.set(param.nome.value, { ptr: regPtr, tipo: tipoP });
    }

    nodo.corpo.aceitar(this);

    const instrucoes = nodo.corpo.instrucoes;
    const ult = instrucoes.length > 0 ? instrucoes[instrucoes.length-1] : null;
    const jaRetornou = ult && ult.constructor.name === 'NodoComandoRetorna';

    if (!jaRetornou) {
        if (tipoRetLLVM === 'void') this.emit(`  ret void`);
        else if (tipoRetLLVM === 'double') this.emit(`  ret double 0.0`);
        else this.emit(`  ret i32 0`);
    }

    this.emit(`}`);
    this.emit(``);
  }

  visitarComandoBloco(nodo) {
    for (const instr of nodo.instrucoes) instr.aceitar(this);
  }

  visitarDeclaracaoVariavel(nodo) {
    const tipoVar = this.traduzirTipo(nodo.tipo.value);
    const regPtr = `%ptr_${nodo.nome.value}`;
    
    this.emit(`  ${regPtr} = alloca ${tipoVar}`);
    this.tabelaVariaveis.set(nodo.nome.value, { ptr: regPtr, tipo: tipoVar });

    if (nodo.inicializador) {
      let regValor = nodo.inicializador.aceitar(this);
      const tipoValor = this.getTipoReg(regValor);

      if (tipoVar === 'double' && tipoValor === 'i32') {
          const regConv = this.novoReg();
          this.emit(`  ${regConv} = sitofp i32 ${regValor} to double`);
          regValor = regConv;
      }

      this.emit(`  store ${tipoVar} ${regValor}, ${tipoVar}* ${regPtr}`);
    }
  }

  visitarExpressaoLiteral(nodo) {
    if (typeof nodo.valor === 'number') {
        if (Number.isInteger(nodo.valor)) return `${nodo.valor}`;
        let s = nodo.valor.toString();
        if (!s.includes('.')) s += '.0';
        return s;
    }
    
    if (typeof nodo.valor === 'string') {
        // Passamos a string pura, o metodo resolverá os escapes
        const strInfo = this.registrarStringGlobal(nodo.valor);
        const regStr = this.novoReg();
        this.emit(`  ${regStr} = getelementptr [${strInfo.tamanho} x i8], [${strInfo.tamanho} x i8]* ${strInfo.nome}, i64 0, i64 0`);
        
        this.setTipoReg(regStr, 'string'); 
        return regStr;
    }
    
    return `${nodo.valor}`;
  }

  visitarComandoEscreva(nodo) {
    for (const arg of nodo.argumentos) {
      const regValor = arg.aceitar(this);
      const tipo = this.getTipoReg(regValor);
      
      const regFmt = this.novoReg();
      
      if (tipo === 'double') {
          this.emit(`  ${regFmt} = getelementptr [6 x i8], [6 x i8]* @.fmt_double, i64 0, i64 0`);
          this.emit(`  call i32 (i8*, ...) @printf(i8* ${regFmt}, double ${regValor})`);
      } else if (tipo === 'string' || tipo === 'i8*') {
          this.emit(`  ${regFmt} = getelementptr [3 x i8], [3 x i8]* @.fmt_str, i64 0, i64 0`);
          this.emit(`  call i32 (i8*, ...) @printf(i8* ${regFmt}, i8* ${regValor})`);
      } else {
          this.emit(`  ${regFmt} = getelementptr [4 x i8], [4 x i8]* @.fmt_int, i64 0, i64 0`);
          this.emit(`  call i32 (i8*, ...) @printf(i8* ${regFmt}, i32 ${regValor})`);
      }
    }
    
    const regNL = this.novoReg();
    const strNL = this.registrarStringGlobal("\n"); 
    this.emit(`  ${regNL} = getelementptr [${strNL.tamanho} x i8], [${strNL.tamanho} x i8]* ${strNL.nome}, i64 0, i64 0`);
    this.emit(`  call i32 (i8*, ...) @printf(i8* ${regNL})`);
  }

  visitarExpressaoVariavel(nodo) {
    const info = this.tabelaVariaveis.get(nodo.nome.value);
    if (!info) throw new Error(`Var não achada: ${nodo.nome.value}`);
    
    const regVal = this.novoReg();
    this.emit(`  ${regVal} = load ${info.tipo}, ${info.tipo}* ${info.ptr}`);
    this.setTipoReg(regVal, info.tipo);
    return regVal;
  }

  visitarExpressaoBinaria(nodo) {
    const op = nodo.operador.value;
    let regEsq = nodo.esquerda.aceitar(this);
    let regDir = nodo.direita.aceitar(this);

    let tipoEsq = this.getTipoReg(regEsq);
    let tipoDir = this.getTipoReg(regDir);
    let usarDouble = (tipoEsq === 'double' || tipoDir === 'double');
    
    if (usarDouble) {
        if (tipoEsq === 'i32') {
            const conv = this.novoReg();
            this.emit(`  ${conv} = sitofp i32 ${regEsq} to double`);
            regEsq = conv;
        }
        if (tipoDir === 'i32') {
            const conv = this.novoReg();
            this.emit(`  ${conv} = sitofp i32 ${regDir} to double`);
            regDir = conv;
        }
    }

    const regRes = this.novoReg();
    const tipoOp = usarDouble ? 'double' : 'i32';
    const prefixo = usarDouble ? 'f' : ''; 

    switch (op) {
      case '+': this.emit(`  ${regRes} = ${prefixo}add ${tipoOp} ${regEsq}, ${regDir}`); break;
      case '-': this.emit(`  ${regRes} = ${prefixo}sub ${tipoOp} ${regEsq}, ${regDir}`); break;
      case '*': this.emit(`  ${regRes} = ${prefixo}mul ${tipoOp} ${regEsq}, ${regDir}`); break;
      case '/': 
        if(usarDouble) this.emit(`  ${regRes} = fdiv double ${regEsq}, ${regDir}`);
        else this.emit(`  ${regRes} = sdiv i32 ${regEsq}, ${regDir}`);
        break;
      
      case '<': case '>': case '==': case '!=': case '<=': case '>=':
        const mapInt = { '<': 'slt', '>': 'sgt', '==': 'eq', '!=': 'ne', '<=': 'sle', '>=': 'sge' };
        const mapFlt = { '<': 'olt', '>': 'ogt', '==': 'oeq', '!=': 'one', '<=': 'ole', '>=': 'oge' };
        
        const condCode = usarDouble ? mapFlt[op] : mapInt[op];
        const instr = usarDouble ? 'fcmp' : 'icmp';
        
        const regBool = this.novoReg();
        this.emit(`  ${regBool} = ${instr} ${condCode} ${tipoOp} ${regEsq}, ${regDir}`);
        this.emit(`  ${regRes} = zext i1 ${regBool} to i32`);
        this.setTipoReg(regRes, 'i32'); 
        return regRes;
    }

    this.setTipoReg(regRes, tipoOp);
    return regRes;
  }

  visitarComandoRetorna(nodo) {
      if (nodo.valor) {
          let reg = nodo.valor.aceitar(this);
          
          // Descobre o tipo interno (pode ser 'string', 'double', 'i32')
          const tipoInterno = this.getTipoReg(reg);
          
          // Converte para tipo LLVM válido (ex: 'string' vira 'i8*')
          const tipoLLVM = this.traduzirTipo(tipoInterno);
          
          this.emit(`  ret ${tipoLLVM} ${reg}`);
      } else {
          this.emit(`  ret void`);
      }
  }
  
  visitarExpressaoChamada(nodo) {
      const args = nodo.argumentos.map(a => {
          const r = a.aceitar(this);
          return `${this.getTipoReg(r)} ${r}`;
      }).join(', ');
      
      const nomeFuncao = nodo.funcao.nome.value;
      const tipoRetorno = this.funcoesGlobais.get(nomeFuncao) || 'i32';
      
      const reg = this.novoReg();
      this.emit(`  ${reg} = call ${tipoRetorno} @${nomeFuncao}(${args})`);
      
      this.setTipoReg(reg, tipoRetorno);
      return reg;
  }

  visitarComandoSe(nodo) {
    const labelThen = this.novoLabel("then");
    const labelElse = this.novoLabel("else");
    const labelMerge = this.novoLabel("merge");

    const regCondInt = nodo.condicao.aceitar(this);
    const regCondBool = this.novoReg();
    this.emit(`  ${regCondBool} = icmp ne i32 ${regCondInt}, 0`);

    if (nodo.blocoSenao) {
      this.emit(`  br i1 ${regCondBool}, label %${labelThen}, label %${labelElse}`);
    } else {
      this.emit(`  br i1 ${regCondBool}, label %${labelThen}, label %${labelMerge}`);
    }

    const terminaComRetorno = (nodoBloco) => {
         if (!nodoBloco) return false;
         if (nodoBloco.constructor.name === 'NodoComandoRetorna') return true;
         if (nodoBloco.constructor.name === 'NodoComandoBloco') {
             if (!nodoBloco.instrucoes || nodoBloco.instrucoes.length === 0) return false;
             const ultimo = nodoBloco.instrucoes[nodoBloco.instrucoes.length - 1];
             return ultimo.constructor.name === 'NodoComandoRetorna';
         }
         return false;
    };

    this.emit(``);
    this.emit(`${labelThen}:`);
    nodo.blocoEntao.aceitar(this);
    if (!terminaComRetorno(nodo.blocoEntao)) this.emit(`  br label %${labelMerge}`);

    if (nodo.blocoSenao) {
      this.emit(``);
      this.emit(`${labelElse}:`);
      nodo.blocoSenao.aceitar(this);
      if (!terminaComRetorno(nodo.blocoSenao)) this.emit(`  br label %${labelMerge}`);
    }

    this.emit(``);
    this.emit(`${labelMerge}:`);
  }
  
  visitarExpressaoAtribuicao(nodo) {
      let regExp = nodo.valor.aceitar(this);
      const info = this.tabelaVariaveis.get(nodo.nome.value);
      let tipoValor = this.getTipoReg(regExp);
      
      if (info.tipo === 'double' && tipoValor === 'i32') {
          const conv = this.novoReg();
          this.emit(`  ${conv} = sitofp i32 ${regExp} to double`);
          regExp = conv;
          tipoValor = 'double';
      }
      
      this.emit(`  store ${tipoValor} ${regExp}, ${info.tipo}* ${info.ptr}`);
      return regExp;
  }
  
  visitarExpressaoUnaria(nodo) { return "0"; }
  visitarExpressaoAgrupamento(nodo) { return nodo.expressao.aceitar(this); }
  visitarComandoVazio(nodo) {}
  visitarErro(nodo) {}
  visitarComandoExpressao(nodo) { nodo.expressao.aceitar(this); }
}