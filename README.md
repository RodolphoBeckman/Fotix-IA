# Guia de Desenvolvimento - Fotix

## Visão Geral do Projeto

Fotix é um kit de ferramentas com IA para e-commerce de moda. O objetivo principal é otimizar o fluxo de trabalho de criação de conteúdo, permitindo que os usuários enviem imagens de produtos e recebam automaticamente imagens processadas em diferentes dimensões (para site e ERP) e conteúdo de marketing gerado por IA (títulos, descrições e tags de SEO).

## Pré-requisitos

Antes de começar, certifique-se de que você tem o seguinte software instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 20.x ou superior recomendada)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [yarn](https://yarnpkg.com/)

## Instalação e Execução Local

1.  **Clone o repositório** para sua máquina local.

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente (Local)**:
    - Crie um arquivo chamado `.env` na raiz do projeto.
    - Adicione sua chave de API do Google AI Studio (Gemini):
      ```
      GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
      ```

4.  **Inicie os servidores de desenvolvimento**:
    - Em um terminal, inicie o aplicativo Next.js:
      ```bash
      npm run dev
      ```
    - Em outro terminal, inicie o Genkit para as funcionalidades de IA:
      ```bash
      npm run genkit:watch
      ```

O aplicativo estará disponível em `http://localhost:9002`.

## Deploy na Vercel

Para publicar seu aplicativo na Vercel, siga estes passos:

1.  **Conecte seu repositório**: No painel da Vercel, importe o projeto a partir do seu repositório Git.

2.  **Configure as Variáveis de Ambiente**: Na Vercel, vá para as configurações do seu projeto (**Settings > Environment Variables**) e adicione a seguinte variável:

    - **`GEMINI_API_KEY`**: Cole a mesma chave de API do Google AI Studio que você usa localmente.

A Vercel cuidará do resto, detectando que é um projeto Next.js e realizando o build e o deploy automaticamente.

## Estrutura de Arquivos Principal

- **`src/app/`**: Contém as páginas principais da aplicação Next.js (App Router).
  - **`image-editor/page.tsx`**: A página principal onde os usuários fazem o upload e processam as imagens.
  - **`layout.tsx`**: O layout global da aplicação.
  - **`globals.css`**: Estilos globais e configuração do tema Tailwind/ShadCN.
- **`src/components/`**: Contém os componentes React reutilizáveis.
  - **`ui/`**: Componentes da biblioteca ShadCN UI.
  - **`processed-images-display.tsx`**: Componente que exibe os resultados do processamento (imagens e conteúdo de IA).
- **`src/ai/`**: Contém toda a lógica relacionada à inteligência artificial com Genkit.
  - **`flows/generate-product-info.ts`**: O fluxo Genkit que define o prompt e a lógica para chamar a API do Gemini e gerar o conteúdo do produto.
  - **`genkit.ts`**: Arquivo de configuração principal do Genkit.
- **`src/lib/`**: Funções e utilitários de suporte.
  - **`image-processor.ts`**: Lógica principal para redimensionar, cortar e comprimir as imagens no lado do cliente.
  - **`utils.ts`**: Funções utilitárias gerais (como `cn` para classes e `formatBytes`).
- **`public/`**: Arquivos estáticos, como imagens e logos.
- **`package.json`**: Lista as dependências e scripts do projeto.
- **`vercel.json`**: Configuração específica para o deploy na Vercel.
