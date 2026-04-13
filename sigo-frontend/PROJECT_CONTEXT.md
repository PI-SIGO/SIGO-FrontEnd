# PROJECT_CONTEXT.md

Este documento resume o SIGO com foco no frontend atual (`sigo-frontend`), usando como base:

- o código do frontend extraído no workspace
- o backend enviado em `SIGO-BackEnd.zip`
- a documentação `Documentação_ProjetoIntegrador_867 (1).docx`

Quando houver diferença entre documentação e implementação, este arquivo prioriza o que está no código e explicita o desalinhamento.

## 1. Visão geral do sistema

O SIGO é um sistema para informatização e gerenciamento de oficinas, com objetivo de centralizar:

- cadastro e gestão de clientes
- cadastro e acompanhamento de veículos
- ordens de serviço/pedidos
- catálogo de serviços
- estoque e uso de peças
- equipe/funcionários
- acompanhamento do atendimento e geração de relatórios

Pela documentação, o sistema foi pensado para atender tanto a operação interna da oficina quanto o autoatendimento do cliente, com foco em rastreabilidade, transparência e redução de processos manuais. No estado atual do código, o frontend implementa principalmente um painel operacional/administrativo da oficina, enquanto o backend já expõe uma API com autenticação JWT para cliente, funcionário e oficina.

## 2. Arquitetura geral

### Visão arquitetural

Arquitetura lógica atual:

1. O usuário acessa o frontend web em Next.js.
2. As telas chamam a camada de serviços em `src/services/*`.
3. A camada de serviços usa `fetch` para acessar a API do backend.
4. O backend ASP.NET Core recebe a requisição em controllers REST.
5. Os controllers delegam para services.
6. Os services usam repositories e `AppDbContext`.
7. O `AppDbContext` persiste dados em PostgreSQL.

### Tecnologias identificadas

Frontend:

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `undici` para suporte a chamadas HTTP/proxy no ambiente Node

Backend:

- ASP.NET Core Web API (`net8.0`)
- Entity Framework Core 9
- Npgsql / PostgreSQL
- AutoMapper
- Refit
- JWT Bearer Authentication
- Swagger / Swashbuckle

### Comunicação frontend ↔ backend

Há duas abordagens no frontend:

- abordagem principal no código atual: `src/services/*` chama diretamente a URL do backend via `NEXT_PUBLIC_BACKEND_URL`
- abordagem alternativa/legada: `src/app/api/*` tenta funcionar como proxy do Next

O backend aceita requisições via HTTP e HTTPS em desenvolvimento, conforme `launchSettings.json`:

- `http://localhost:5044`
- `https://localhost:7241`

### Organização geral do projeto

Frontend:

- interface pública (`/inicio`, `/login`)
- painel principal em rotas agrupadas por `src/app/(painel)`
- componentes por domínio em `src/components/dashboard`
- camada de integração HTTP em `src/services`
- tipos compartilhados em `src/types`

Backend:

- controllers REST em `Controllers`
- regras de negócio em `Services/Entities`
- acesso a dados em `Data/Repositories`
- mapeamento ORM e builders em `Data/Builders`
- entidades e DTOs em `Objects`
- autenticação/autorização em `Security`
- integração externa ViaCEP em `Integracao`

## 3. Domínio do sistema

### Entidades principais

| Entidade | Papel no sistema | Campos principais no código | Relacionamentos observados |
| --- | --- | --- | --- |
| Cliente | Representa o dono do veículo ou contratante do serviço | `Nome`, `Email`, `Senha`, `Cpf_Cnpj`, endereço, `Sexo`, `TipoCliente`, `Situacao` | 1 cliente possui vários telefones e vários veículos |
| Veículo | Bem atendido pela oficina | `NomeVeiculo`, `TipoVeiculo`, `PlacaVeiculo`, `ChassiVeiculo`, `AnoFab`, `Quilometragem`, `Combustivel`, `Seguro`, `Cor`, `Status`, `ClienteId` | cada veículo pertence a 1 cliente; pedido referencia 1 veículo |
| Pedido | Ordem de serviço / atendimento | ids de cliente, funcionário, oficina e veículo; descontos; valor total; observação; datas; listas de peças e serviços | liga cliente, funcionário, oficina e veículo; possui coleções `Pedido_Pecas` e `Pedido_Servicos` |
| Serviço | Catálogo de serviços executáveis | `Nome`, `Descricao`, `Valor`, `Garantia` | pode participar de vários pedidos; pode se relacionar a funcionários via `Funcionario_Servico` |
| Peça | Item de estoque/consumo em pedido | `Nome`, `Tipo`, `Descricao`, `Valor`, `Quantidade`, `Garantia`, `Unidade`, `Fornecedor`, `IdMarca` | pertence a uma marca; pode participar de vários pedidos via `Pedido_Peca` |
| Funcionário | Colaborador da oficina | `Nome`, `Cpf`, `Cargo`, `Email`, `Senha`, `Situacao` | pode estar ligado a pedidos e serviços |
| Oficina | Organização administradora do sistema | `Nome`, `CNPJ`, `Email`, endereço, `Senha`, `Situacao` | é referenciada por pedidos; possui papel administrativo no backend |
| Usuário | Conceito de autenticação da documentação | `email`, `senha` | existe na documentação, mas não há entidade `Usuario` separada no código atual |

### Entidades auxiliares e associações

- `Telefone`: telefone vinculado ao cliente
- `Marca`: catálogo textual de marcas, ligado no código principalmente a `Peca`
- `Pedido_Peca`: associação N:N entre pedido e peça, com quantidade, data de instalação, estado e observação
- `Pedido_Servico`: associação N:N entre pedido e serviço, com quantidade de execuções
- `Funcionario_Servico`: associação N:N entre funcionário e serviço

### Relacionamentos importantes

- `Cliente` -> `Veiculo`: um-para-muitos
- `Cliente` -> `Telefone`: um-para-muitos
- `Pedido` -> `Cliente`: muitos pedidos podem referenciar clientes
- `Pedido` -> `Funcionario`: muitos pedidos podem referenciar funcionários
- `Pedido` -> `Oficina`: muitos pedidos podem referenciar uma oficina
- `Pedido` -> `Veiculo`: muitos pedidos podem referenciar um veículo
- `Pedido` <-> `Servico`: muitos-para-muitos via `Pedido_Servico`
- `Pedido` <-> `Peca`: muitos-para-muitos via `Pedido_Peca`
- `Funcionario` <-> `Servico`: muitos-para-muitos via `Funcionario_Servico`

### Diferenças entre domínio documentado e domínio implementado

A documentação modela explicitamente:

- `ClienteJ` e `ClienteF`
- `Cliente_Endereço`
- `Pedido_Funcionário`
- `Usuário`

No código atual, essas ideias foram simplificadas:

- pessoa física/jurídica virou `TipoCliente` dentro de `Cliente`
- endereço foi embutido no próprio `Cliente`
- autenticação foi distribuída entre `Cliente`, `Funcionario` e `Oficina`
- não existe modelo `Pedido_Funcionario` separado

## 4. Tipos de usuário

### Cliente

Pela documentação:

- realiza login
- consulta dados próprios
- consulta veículo, pedido e serviço
- acompanha status do atendimento
- solicita relatórios

No backend atual:

- possui login em `POST /api/clientes/login`
- recebe role JWT `Cliente`
- participa da policy `SelfServiceAccess`

No frontend atual:

- não existe portal do cliente implementado
- a tela de login atual não consome JWT nem diferencia perfil

### Funcionário

Pela documentação:

- gerencia clientes e veículos
- cria e atualiza pedidos
- gerencia peças e serviços
- consulta relatórios operacionais

No backend atual:

- login em `POST /api/funcionarios/login`
- cargo `ADMIN`/`ADMINISTRADOR` vira role `Admin`; demais cargos viram `Funcionario`
- pode acessar policies `OperationalAccess` e `SelfServiceAccess` dependendo do controller

No frontend atual:

- há telas para clientes, funcionários, serviços, veículos e marcas
- não há fluxo funcional de pedidos, peças ou relatórios

### Oficina (admin)

Pela documentação:

- representa o administrador da plataforma
- possui acesso completo aos recursos

No backend atual:

- login em `POST /api/oficinas/login`
- role JWT `Oficina`
- policy `OperationalAccess`

Observação importante:

- no código, o conceito de "admin" está dividido entre a role `Oficina` e a role `Admin` derivada do cargo do funcionário
- o controller de funcionários exige `FullAccess`, ou seja, role `Admin`; só a role `Oficina` não basta para tudo

## 5. Funcionalidades principais

### Funcionalidades previstas na documentação

- login para cliente, funcionário e oficina
- cadastro, edição, exclusão, listagem e carregamento de cliente
- cadastro, edição, exclusão, listagem e carregamento de funcionário
- cadastro, edição, exclusão, listagem e carregamento de veículo
- cadastro, edição, exclusão, listagem e carregamento de pedido
- cadastro, edição, exclusão, listagem e carregamento de serviço
- cadastro, edição, exclusão, listagem e carregamento de peça
- cadastro, edição, exclusão, listagem e carregamento de marca
- geração de relatórios de pedido, veículo e serviço
- painel de acompanhamento para cliente

### Funcionalidades implementadas no frontend atual

- landing page pública em `/inicio`
- tela de login em `/login`
- tela pública de cadastro de cliente em `/cadastro`
- visão geral com indicadores resumidos
- CRUD de clientes
- CRUD de funcionários
- CRUD de serviços
- CRUD de veículos
- CRUD de marcas
- CRUD de cores no frontend

### Funcionalidades implementadas no backend atual

- autenticação JWT para cliente, funcionário e oficina
- CRUD de clientes
- CRUD de funcionários
- CRUD de oficinas
- CRUD de veículos
- CRUD de pedidos
- CRUD de serviços
- CRUD de peças
- CRUD de marcas
- busca de CEP via ViaCEP

### Funcionalidades ausentes ou incompletas no estado atual

- login real no frontend com armazenamento/envio de token
- tela funcional de pedidos
- tela funcional de peças
- relatórios
- portal do cliente
- gestão de oficina no frontend
- integração consistente de cores com backend

## 6. Fluxos importantes

### Fluxo de login

Fluxo esperado pela documentação:

1. O usuário informa credenciais válidas.
2. O sistema valida o perfil de acesso.
3. O sistema libera a visão correspondente ao ator.

Fluxo implementado no backend:

1. `ClienteController`, `FuncionarioController` e `OficinaController` expõem endpoints `/login`.
2. A senha recebida é convertida para SHA-256.
3. A API valida usuário e senha.
4. Em caso de sucesso, retorna um JWT com role do ator.

Fluxo implementado no frontend:

1. A página `/login` valida apenas se e-mail e senha foram preenchidos.
2. A tela usa um shell visual compartilhado com a página de cadastro (`AuthShell`).
3. Após um `setTimeout`, faz `router.push("/visao-geral")`.
4. Há navegação direta para `/cadastro`.
5. Nenhuma chamada ao backend é feita.
6. Nenhum token é salvo.

Conclusão:

- o fluxo de autenticação real existe no backend, mas não está conectado ao frontend atual

### Fluxo de cadastro de cliente

Na documentação:

1. cliente, funcionário ou oficina podem iniciar o cadastro
2. dados pessoais e de contato são preenchidos
3. o sistema valida os campos
4. o registro fica disponível para uso posterior

No frontend atual:

1. existe um fluxo público em `/cadastro` com layout visual alinhado à tela de login
2. o formulário reutiliza opções compartilhadas (`sexoOptions`, `tipoClienteOptions`) e envia os campos mínimos exigidos pelo backend atual
3. o frontend chama `createCliente()` em `src/services/clientes.ts`
4. em caso de sucesso, exibe mensagem de confirmação e redireciona para `/login`

Também existe o fluxo interno/operacional do módulo de clientes no painel, usado para CRUD administrativo.

No backend atual:

1. normaliza CPF/CNPJ e CEP
2. valida CPF/CNPJ
3. valida nome e e-mail únicos
4. converte senha para SHA-256
5. persiste cliente

### Fluxo de cadastro de veículo

Na documentação:

1. oficina ou funcionário inicia o cadastro
2. escolhe cliente e preenche modelo, marca, placa, cor e demais atributos
3. o sistema valida e registra o veículo

No frontend atual:

1. o usuário precisa ter pelo menos um cliente cadastrado
2. abre o modal "Novo veículo"
3. informa cliente, placa, chassi, tipo, quilometragem, combustível, seguro, cor e status
4. envia `POST` e recarrega a lista

No backend atual:

1. exige `ClienteId`, `Cor` e `Status`
2. grava o veículo ligado ao cliente
3. não expõe no DTO atual uma associação funcional de marca para o veículo

### Fluxo de criação de pedido

Na documentação:

1. funcionário autenticado solicita um novo pedido
2. sistema exibe formulário com cliente, veículo, serviços, peças e observações
3. funcionário confirma o envio
4. sistema valida e registra o pedido

No backend atual:

- existe `PedidoDTO` com cliente, funcionário, oficina, veículo, descontos, datas, serviços e peças
- existe `PedidoController` com CRUD completo

No frontend atual:

- não existe serviço HTTP de pedidos
- não existe página funcional para pedidos
- `src/components/dashboard/PedidoSection.tsx` está vazio

## 7. Estrutura do frontend

### Organização principal

```text
src/
  app/
    page.tsx                  -> redireciona "/" para "/inicio"
    inicio/                   -> landing page pública
    login/                    -> tela de login
    cadastro/                 -> cadastro público de cliente
    (painel)/                 -> rotas reais do painel
      visao-geral/
      clientes/
      funcionarios/
      servicos/
      veiculos/
      marcas/
      cores/
    dashboard/                -> rotas legadas que apenas redirecionam
    api/                      -> handlers/proxies do Next
  components/
    auth/                     -> shell visual compartilhado entre login e cadastro
    dashboard/                -> seções por módulo
    layout/                   -> shell, header, wrappers
    ui/                       -> tabela, cards, cabeçalhos
  services/                   -> consumo da API
  lib/                        -> configuração, navegação e constantes
  types/                      -> contratos TypeScript
```

### Padrões de organização

- cada módulo principal do painel é implementado como um componente em `src/components/dashboard`
- as páginas em `src/app/(painel)` só renderizam essas seções
- há um shell compartilhado com menu lateral em `AppShell`
- os serviços por entidade ficam em arquivos separados (`clientes.ts`, `veiculos.ts`, etc.)
- `api-client.ts` concentra o `fetch` e o tratamento básico de erro
- `service-utils.ts` tenta absorver respostas inconsistentes do backend com `unwrapData` e `unwrapArray`

### Principais páginas

Públicas:

- `/inicio`: landing page institucional
- `/login`: acesso ao sistema
- `/cadastro`: cadastro público de cliente

Painel:

- `/visao-geral`: indicadores gerais
- `/clientes`
- `/funcionarios`
- `/servicos`
- `/veiculos`
- `/marcas`
- `/cores`

### Como as telas se conectam

- o menu lateral usa `panel-navigation.ts`
- as definições de título/subtítulo e componente vêm de `app-sections.tsx`
- há páginas antigas em `src/app/dashboard/*` que apenas redirecionam para as rotas do grupo `(painel)`

### Convenções relevantes do frontend

- os tipos usam nomes próximos aos DTOs do backend (`Id`, `Nome`, `Situacao`, etc.)
- os services normalizam tanto PascalCase quanto camelCase
- o dashboard usa tabelas genéricas (`DataTable`) e modais inline em cada seção
- o tema visual atual é branco/azul e foi centralizado em `globals.css`
- as telas públicas de autenticação compartilham a mesma estrutura visual via `src/components/auth/AuthShell.tsx`

### Ajuste visual recente na tela de cadastro

- a rota pública `/cadastro` recebeu um refinamento exclusivamente visual no box do formulário
- o formulário passou a usar um container interno maior, com aumento aproximado de 15% na percepção de área útil por meio de `margin-top`, `space-y`, `gap` e `padding` maiores
- os campos `input` e `select` tiveram aumento proporcional de altura para melhorar conforto visual e área de interação, sem alterar validações, lógica ou integração com backend
- o impacto em UI/UX foi tornar a tela de cadastro visualmente mais confortável e equilibrada em relação ao volume de campos, preservando o mesmo padrão branco/azul e a responsividade da tela de login

## 8. Estrutura do backend

### Organização principal

```text
SIGO/
  Controllers/          -> endpoints REST
  Services/Entities/    -> regras de negócio
  Services/Interfaces/  -> contratos das services
  Data/Repositories/    -> acesso a dados
  Data/Interfaces/      -> contratos dos repositórios
  Data/Builders/        -> configuração do EF Core
  Objects/Models/       -> entidades do domínio
  Objects/Dtos/         -> DTOs e mappings
  Security/             -> roles e policies
  Integracao/           -> ViaCEP
  Migrations/           -> migrações do banco
```

### Camadas

Controllers:

- expõem a API HTTP
- aplicam autorização
- montam respostas e mensagens

Services:

- concentram regras como login, validação de CPF/CNPJ e atualização de agregados

Repositories:

- encapsulam o acesso ao banco

AppDbContext:

- registra `DbSet`s
- define chaves compostas e relações N:N

### Controllers principais encontrados

- `ClienteController`
- `FuncionarioController`
- `OficinaController`
- `VeiculoController`
- `PedidoController`
- `ServicoController`
- `PecaController`
- `MarcaController`
- `CepController`
- `TelefoneController` (presente no projeto, não consumido pelo frontend atual)

### Integração com banco

- banco PostgreSQL
- connection string padrão: `Host=localhost;Port=5432;Database=SIGO;Username=postgres;Password=123456;`
- ORM: Entity Framework Core
- `AppDbContext` registra entidades e relações

### Segurança

Roles:

- `Admin`
- `Funcionario`
- `Oficina`
- `Cliente`

Policies:

- `FullAccess`: apenas `Admin`
- `OperationalAccess`: `Admin`, `Funcionario`, `Oficina`
- `SelfServiceAccess`: `Admin`, `Funcionario`, `Oficina`, `Cliente`

## 9. Integração frontend ↔ backend

### Modo de chamada atual

O frontend usa `buildBackendUrl()` para montar URLs a partir de `NEXT_PUBLIC_BACKEND_URL`.

Exemplo esperado de variável:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5044/api
```

Default no código:

```text
https://localhost:7241/api
```

### Camada de consumo

- `apiFetch()` faz `fetch` com `cache: "no-store"`
- erros HTTP viram `ApiError`
- `unwrapData()` e `unwrapArray()` tentam extrair `data` de payloads que podem ou não vir envelopados
- cada serviço (`clientes.ts`, `veiculos.ts`, etc.) normaliza casing para tolerar DTOs em formatos diferentes

### Endpoints principais do backend

Recursos principais identificados:

- `/api/clientes`
- `/api/clientes/{id}`
- `/api/clientes/nome/{nome}`
- `/api/clientes/login`
- `/api/funcionarios`
- `/api/funcionarios/{id}`
- `/api/funcionarios/nome/{nome}`
- `/api/funcionarios/login`
- `/api/oficinas`
- `/api/oficinas/login`
- `/api/veiculos`
- `/api/veiculos/placa/{placa}`
- `/api/veiculos/tipo/{tipo}`
- `/api/pedidos`
- `/api/servicos`
- `/api/pecas`
- `/api/marcas`
- `/api/ceps/{cep}`

### Padrões de resposta

O backend não segue um único padrão de resposta:

- parte dos endpoints retorna `Response { Code, Message, Data }`
- parte retorna DTO direto
- parte retorna objetos simples como `{ Message = "..." }`

Por causa disso, o frontend já foi adaptado para aceitar payloads heterogêneos.

### Situação real da integração

Há desalinhamentos importantes:

- o README afirma que o frontend usa proxy do Next para evitar CORS
- os serviços atuais chamam o backend diretamente
- `src/services/clientes.ts` já foi alinhado para as rotas REST atuais (`/api/clientes`, `/{id}`, `/nome/{nome}`), mas outros serviços ainda podem seguir padrões antigos
- parte das rotas `src/app/api/*` ainda segue contratos antigos como `Cliente/GetCliente`

Em resumo:

- a integração desenhada existe
- a integração efetivamente implementada está parcial e inconsistente

## 10. Regras de negócio importantes

### Regras observadas no código

- cliente deve ter CPF/CNPJ válido
- funcionário deve ter CPF válido
- oficina deve ter CNPJ válido
- CPF/CNPJ é sanitizado para apenas dígitos
- CEP do cliente é sanitizado para apenas dígitos
- senha de cliente, funcionário e oficina é armazenada/validada em SHA-256
- cliente valida nome e e-mail únicos, além de CPF/CNPJ único
- funcionário valida CPF único
- oficina valida CNPJ único
- veículo precisa estar vinculado a um cliente
- atualização de cliente sincroniza telefones enviados no payload
- pedido referencia obrigatoriamente cliente, funcionário, oficina e veículo
- status de veículo/pedido operacional segue enum:
  - `0 = Pendente`
  - `1 = AguardandoPecas`
  - `2 = EmAndamento`
  - `3 = Concluido`
- `Situacao` das entidades segue:
  - `1 = Ativo`
  - `2 = Inativo`
- ViaCEP só processa CEP com 8 dígitos

### Regras vindas da documentação e ainda não materializadas por completo no frontend

- cliente deve conseguir acompanhar status do próprio veículo e serviços em tempo real
- sistema deve emitir relatórios de pedido, veículo e serviço
- funcionário deve conseguir registrar pedidos com cliente, veículo, peças e serviços
- a interface deve ser intuitiva, acessível e manter tempo de resposta baixo
- operações críticas deveriam ter auditoria/log
- backups automáticos são requisito não funcional documentado

## 11. Pontos de atenção

### Desalinhamentos entre documentação e código

- a documentação descreve um portal de cliente e relatórios; o frontend atual é essencialmente um painel operacional
- a documentação modela `Usuario`, `ClienteJ`, `ClienteF`, `Cliente_Endereço` e `Pedido_Funcionário`; essas estruturas não aparecem como entidades equivalentes no código atual
- a documentação trata marca também como conceito associado a veículo; no backend atual a relação formal configurada é entre `Marca` e `Peca`

### Desalinhamentos entre frontend e backend

- `src/services/*` usa caminhos que não batem com as rotas REST atuais do backend
- o frontend não envia token JWT nas requisições protegidas
- o login da UI não autentica de fato
- o módulo de cores existe no frontend, mas não foi encontrada entidade/controller equivalente no backend extraído

### Problemas técnicos já visíveis no frontend

- `src/app/api/proxy/[...path]/route.ts` importa `buildServerBackendUrl`, mas `src/lib/config.ts` não exporta essa função
- handlers dinâmicos em `src/app/api/*/[id]/route.ts` usam assinatura antiga de `params` para Next 16
- `src/types/entities.ts` não declara o tipo `Cor`, embora `CoresSection` e `services/cores.ts` o utilizem
- existem estruturas duplicadas de navegação: `src/app/(painel)` e `src/app/dashboard`
- `PedidoSection.tsx` existe, mas está vazio

### Cobertura funcional incompleta

- sem fluxo funcional de pedidos no frontend
- sem fluxo funcional de peças no frontend
- sem relatórios
- sem gerenciamento de oficina no frontend
- sem portal do cliente

### Testes e qualidade

- não foram encontrados testes automatizados no frontend
- no backend existe projeto de testes, mas a cobertura visível está concentrada em `PedidoController` e `PedidoService`

---

## Resumo executivo

O SIGO já tem uma base de domínio coerente para oficina, com backend relativamente completo para autenticação, clientes, funcionários, veículos, serviços, peças, marcas, pedidos e CEP. O frontend, por sua vez, está mais maduro como painel administrativo para clientes, funcionários, serviços, veículos e marcas, mas ainda não fecha o ciclo completo planejado pela documentação.

Para qualquer próxima etapa de desenvolvimento, os pontos mais críticos são:

1. alinhar a integração frontend ↔ backend
2. conectar o login real com JWT
3. implementar pedidos, peças e relatórios no frontend
4. decidir se o portal do cliente continuará no mesmo frontend ou em uma interface separada
