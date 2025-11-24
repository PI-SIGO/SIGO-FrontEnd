<div align="center">

# SIGO Frontend

Painel administrativo construído em Next.js + Tailwind para acompanhar o fluxo da oficina SIGO: clientes, equipe, serviços, veículos, marcas e cores.

</div>

## ⚙️ Pré-requisitos

- Node.js 18+
- Backend SIGO rodando localmente (API ASP.NET em `http://localhost:5044` por padrão)

Crie um arquivo `.env.local` na raiz do projeto para apontar para a API (ajuste a porta se necessário):

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5044/api
```

## 🚀 Rodando o projeto

Instale as dependências e suba o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

## 🧭 Estrutura principal

- `src/app/login` – tela de acesso com visual inspirado nas referências do projeto
- `src/app/dashboard` – painel responsivo com navegação por módulos
- `src/app/api/*` – rotas do Next que fazem proxy para a API em C#, evitando problemas de CORS
- `src/services` – camada de consumo da API com tratamento de respostas e erros
- `src/components` – componentes reutilizáveis (layout, tabelas, cartões, seções)

## 📦 Funcionalidades

- Visão geral com indicadores de clientes, equipe, serviços e veículos em andamento
- CRUD completo de clientes, funcionários, serviços, veículos, marcas e cores
- Tabelas responsivas com busca, badges de status e ações rápidas
- Formulários com validação básica, estados de carregamento e feedback visual
- Layout inspirado no material enviado, mantendo coerência visual com SIGO

## ✅ Próximos passos sugeridos

- Configurar autenticação real utilizando a API (.NET) ou Identity Provider
- Publicar a API com CORS habilitado ou manter o proxy via rotas do Next
- Acrescentar testes automatizados (unitários e e2e)
- Integrar gráficos analíticos (por exemplo, usando Recharts ou Chart.js) para aprofundar relatórios

---

Feito com Next.js 16, React 19 e Tailwind CSS 4.
