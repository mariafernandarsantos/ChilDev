# 🛠️ Guia de Instalação e Compilação - ChilDev

Este guia contém o roteiro passo a passo para configurar o ambiente, instalar as ferramentas necessárias e compilar seu primeiro programa na linguagem ChilDev.

## 📋 Pré-requisitos
Para o compilador funcionar, você precisa de duas ferramentas essenciais instaladas no seu sistema:

1.  **Node.js:** Para executar o código do compilador (que foi escrito em JavaScript).
2.  **LLVM (Clang):** Para transformar o código intermediário gerado pelo compilador em um programa executável (`.exe`).

---

## 🚀 Passo 1: Instalação das Ferramentas

### 1. Instalando o Node.js
1.  Acesse o site oficial: [https://nodejs.org/](https://nodejs.org/)
2.  Baixe a versão **LTS (Long Term Support)** recomendada.
3.  Execute o instalador e siga as instruções (clique em "Next" até finalizar).

### 2. Instalando o LLVM 
1.  Acesse o GitHub do LLVM: [https://github.com/llvm/llvm-project/releases](https://github.com/llvm/llvm-project/releases)
2.  Encontre a versão mais recente (ex: 17.x ou 18.x).
3.  Baixe o arquivo para Windows (geralmente chamado `LLVM-xx.x.x-win64.exe`).
4.  Execute o instalador.
5.  **⚠️ IMPORTANTE:** Durante a instalação, na tela "Installation Options", marque a opção:
    * 🔘 **Add LLVM to the system PATH for all users**
    * *(Se você não marcar isso, o comando `clang` não funcionará no terminal).*
6.  Reinicie o computador após a instalação.

---

## 📂 Passo 2: Baixando o Projeto
1. Em sua IDE de preferência, abra o terminal e digite:
```
git clone https://github.com/mariafernandarsantos/ChilDev.git
```

Ou então:

Vá no link [https://github.com/mariafernandarsantos/ChilDev] (https://github.com/mariafernandarsantos/ChilDev)
Selecione 'Code' e então 'Downlaod ZIP'
Após isso basta extrair o ZIP e abrir a pasta do projeto

2. Em seu terminal, acesse a pasta do projeto com
```
cd ChilDev
```

## 💻 Passo 3: Escrevendo e Compilando

### 1. Escreva seu código
Abra o arquivo index.js no VS Code ou bloco de notas. Procure a variável codigoFonte e escreva seu programa ChilDev entre as crases (``).

### 2. Gere o código intermediário
Abra o terminal na pasta do projeto e execute:

```
node index.js
```
O que deve acontecer:

O compilador analisará seu código.
Se não houver erros, ele criará um arquivo chamado saida.ll na mesma pasta.
Mensagem de sucesso: ✅ Sucesso Total! Arquivo 'saida.ll' gerado.

### 3. Gere o Executável
Ainda no terminal, use o LLVM (Clang) para transformar o saida.ll em um programa real:

```
clang saida.ll -o programa.exe
```
### 4. Execute o Programa
Agora basta rodar o programa criado:
```
.\programa.exe
```

Será exibido no terminal o resultado do código que você escreveu.
