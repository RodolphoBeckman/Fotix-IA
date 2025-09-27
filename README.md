# Guia de Desenvolvimento - Fotix

## Visão Geral do Projeto

Fotix é um kit de ferramentas com IA para e-commerce de moda. O objetivo principal é otimizar o fluxo de trabalho de criação de conteúdo, permitindo que os usuários enviem imagens de produtos e recebam automaticamente imagens processadas em diferentes dimensões (para site e ERP) e conteúdo de marketing gerado por IA (títulos, descrições e tags de SEO).

## Pré-requisitos

Antes de começar, certifique-se de que você tem o seguinte software instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 20.x ou superior recomendada)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [yarn](https://yarnpkg.com/)

## Configuração do Ambiente

1.  **Clone o repositório** para sua máquina local.

2.  **Crie um arquivo de ambiente**: Na raiz do projeto, crie um arquivo chamado `.env` (ou `.env.local`).

3.  **Adicione a Chave de API**: Dentro do arquivo `.env`, adicione sua chave de API do Google AI Studio (Gemini). O arquivo deve ter o seguinte conteúdo:

    ```
    GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
    ```

    Substitua `SUA_CHAVE_DE_API_AQUI` pela sua chave real.

## Instalação

Navegue até a pasta do projeto no seu terminal e execute o seguinte comando para instalar todas as dependências necessárias:

```bash
npm install
```

## Execução

Para iniciar o servidor de desenvolvimento local, execute o comando:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002` (ou outra porta, se a 9002 estiver em uso).

O sistema Genkit (para a funcionalidade de IA) também precisa ser iniciado em um terminal separado:

```bash
npm run genkit:watch
```

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
