# Distribuidora Quality Lab

Sistema de gestão para distribuidora de produtos, desenvolvido como projeto de estudo para a disciplina **MATB02 — Qualidade de Software** (UFBA).

## Sobre o Projeto

O **Distribuidora Quality Lab** é um sistema completo de backend que implementa o fluxo operacional de uma distribuidora: cadastro de produtos, clientes, controle de estoque, pedidos e tipos de pagamento. O sistema foi construído seguindo práticas modernas de engenharia de software, incluindo:

- **Domain-Driven Design (DDD)** para modelagem do domínio
- **Clean Architecture** para separação de responsabilidades
- **Property-Based Testing** para verificação de invariantes
- **DevSecOps** com pipeline CI/CD automatizado
- **Observabilidade** com logs estruturados, métricas e health checks
- **Containerização** com Docker para reprodutibilidade

### Objetivo Pedagógico

Este sistema serve como artefato de investigação. Os alunos devem analisar o código-fonte, a pipeline, os testes e a documentação para avaliar a **qualidade real** do software em múltiplas dimensões. O objetivo é desenvolver a capacidade de análise crítica — identificar não apenas o que o sistema **alega** fazer, mas o que ele **realmente** faz.

## Arquitetura

O sistema alega seguir **DDD com Dependency Rule estrita** (Clean Architecture), onde a camada de domínio permanece isolada de dependências externas. A comunicação com infraestrutura ocorre através de interfaces (ports) definidas no domínio e implementadas na camada de infraestrutura.

### Princípios Arquiteturais Declarados

- **Dependency Rule**: dependências apontam para o centro (domain)
- **Bounded Contexts isolados**: cada módulo é um bounded context
- **Separation of Concerns**: regras de negócio residem na camada de domínio
- **CQRS leve**: leituras e escritas separadas em use cases distintos

### Diagrama de Componentes

```mermaid
graph TD
    Client[Cliente HTTP] --> Gateway[API Gateway / Rate Limiter]
    Gateway --> API[NestJS Application]

    subgraph "Módulos de Negócio"
        API --> PM[Módulo Produto]
        API --> CM[Módulo Cliente]
        API --> IM[Módulo Estoque]
        API --> OM[Módulo Pedido]
        API --> PTM[Módulo Pagamento]
    end

    subgraph "Comunicação entre Módulos"
        PM --> EB[Event Bus]
        CM --> EB
        IM --> EB
        OM --> EB
        PTM --> EB
        EB --> |"Domain Events"| PM
        EB --> |"Domain Events"| IM
    end

    subgraph "Infraestrutura"
        PM --> Cache[Cache Layer - Redis]
        CM --> Cache
        OM --> Cache
        PM --> DB[(PostgreSQL 15)]
        CM --> DB
        IM --> DB
        OM --> DB
        PTM --> DB
    end

    subgraph "Observabilidade"
        API --> LOG[Logger Estruturado JSON]
        API --> METRICS[/metrics - Prometheus]
        API --> TRACES[OpenTelemetry Collector]
        API --> HEALTH[/health - Liveness + Readiness]
    end

    subgraph "CI/CD Pipeline"
        GH[GitHub Actions] --> LINT[ESLint + Prettier]
        LINT --> TEST[Jest - Unit + Property + Integration]
        TEST --> SAST[Security Scan - SAST/SCA]
        SAST --> SBOM[SBOM Generation]
        SBOM --> DEPLOY[Deploy - Docker Build]
    end
```

### Estrutura de Diretórios

```
src/
├── modules/
│   ├── product/
│   │   ├── domain/          # Aggregates, Entities, Value Objects, Ports
│   │   ├── application/     # Use Cases (orquestração)
│   │   ├── infrastructure/  # Repositories concretos, Mappers
│   │   └── interface/       # Controllers, DTOs
│   ├── customer/
│   ├── inventory/
│   ├── order/
│   └── payment-type/
├── shared/
│   ├── domain/              # Building blocks (AggregateRoot, Entity, ValueObject)
│   ├── infrastructure/      # Database, Logging, Health, Filters
│   └── observability/       # Tracing, Metrics
├── app.module.ts
└── main.ts
```

## Pré-requisitos

- **Node.js** 20 LTS ou superior
- **Docker** e **Docker Compose** v2
- **Git**

## Setup

### Ambiente local (recomendado)

```bash
# 1. Clonar o repositório
git clone https://github.com/GilbertoSLeite/distribuidora-quality-lab.git
cd distribuidora-quality-lab

# 2. Subir todos os serviços com um único comando
docker-compose up

# 3. A aplicação estará disponível em:
#    - API:      http://localhost:3000
#    - Swagger:  http://localhost:3000/api/docs
#    - Health:   http://localhost:3000/health
#    - Metrics:  http://localhost:3000/metrics
```

### Desenvolvimento local (sem Docker para a app)

```bash
# 1. Instalar dependências
npm install

# 2. Subir apenas o banco de dados
docker-compose up db -d

# 3. Executar migrations
npm run typeorm:run-migrations

# 4. Iniciar em modo desenvolvimento
npm run start:dev
```

## Comandos de Teste

```bash
# Testes unitários
npm run test:unit

# Testes de propriedade (Property-Based Testing com fast-check)
npm run test:property

# Testes de integração (requer banco de dados)
npm run test:integration

# Todos os testes
npm test

# Cobertura de código
npm run test:coverage

# Lint
npm run lint
```

## API

A documentação completa da API está disponível via Swagger/OpenAPI 3.0:

**[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Endpoints principais

| Módulo | Endpoints | Descrição |
|--------|-----------|-----------|
| Produto | `POST/GET/PATCH/DELETE /products` | CRUD de produtos |
| Cliente | `POST/GET/PATCH/DELETE /customers` | CRUD de clientes com validação CPF/CNPJ |
| Estoque | `POST /inventory/entries`, `POST /inventory/withdrawals`, `GET /inventory/:id/balance` | Controle de movimentações e saldo |
| Pedido | `POST /orders`, `POST /orders/:id/items`, `PATCH /orders/:id/confirm`, `PATCH /orders/:id/cancel` | Ciclo de vida completo do pedido |
| Pagamento | `POST/GET /payment-types`, `POST /payment-types/:id/rules` | Tipos de pagamento e regras de aceitação |

## Módulos Funcionais

### Produto
CRUD completo com validação de nome (1-150 chars), preço (0.01-999999.99) e categoria (1-100 chars). Produtos podem ficar indisponíveis quando estoque zera.

### Cliente
Cadastro com validação de CPF/CNPJ (algoritmo de dígitos verificadores), email (unicidade), telefone (10-11 dígitos). Conflito de email retorna HTTP 409.

### Estoque
Controle de movimentações (entradas e baixas) por produto. Mantém histórico completo e saldo em tempo real. Baixa com estoque insuficiente retorna HTTP 422.

### Pedido
Máquina de estados: rascunho → confirmado → em_separação → enviado → entregue, com cancelamento possível até em_separação. Confirmação valida estoque e decrementa. Cancelamento reverte estoque.

### Pagamento
Tipos de pagamento com regras de aceitação (min/max). Validação na confirmação do pedido verifica se tipo está ativo e valor está dentro do intervalo aceito.

## Métricas DORA

O projeto adota as 4 métricas DORA (Accelerate — Forsgren, Humble, Kim) como indicadores de performance de entrega:

| Métrica | Target | Nível Alvo |
|---------|--------|------------|
| **Deployment Frequency** | ≥ 1x/semana | High |
| **Lead Time for Changes** | < 1 dia (commit → deploy) | High |
| **Change Failure Rate** | < 10% | High |
| **Mean Time to Restore (MTTR)** | < 1 hora | Elite |

As métricas são revisadas na retrospectiva de cada sprint e servem como input para planejamento de melhorias de processo.

## Qualidade e Testes

### Estratégia de testes

- **Testes unitários**: validam lógica de domínio isoladamente (3+ arquivos por módulo)
- **Testes de propriedade**: verificam invariantes com 100+ iterações usando fast-check
- **Testes de integração**: validam fluxos end-to-end com infraestrutura
- **Cobertura**: > 70% de linha (threshold no CI)

### Pipeline CI/CD

O pipeline GitHub Actions executa na ordem:

1. **Lint** — ESLint + Prettier
2. **Test** — Unit + Property + Coverage
3. **Security Scan** — Auditoria de dependências
4. **SBOM Generate** — Software Bill of Materials
5. **Deploy** — Build da imagem Docker

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| Runtime | Node.js | 20 LTS |
| Linguagem | TypeScript | 5.x |
| Framework | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| Banco de dados | PostgreSQL | 15+ |
| Testes | Jest + fast-check | — |
| Container | Docker + Docker Compose | — |
| CI/CD | GitHub Actions | — |
| Documentação | Swagger/OpenAPI 3.0 | — |
| Observabilidade | OpenTelemetry + JSON Logs | — |

## Documentação Adicional

- **[ADRs](./docs/adrs/)** — Architecture Decision Records (decisões de design)
- **[CONTRIBUTING](./CONTRIBUTING.md)** — Guia de contribuição e processos
- **[API Docs](http://localhost:3000/api/docs)** — Swagger interativo

## Temas de Seminário

O sistema cobre 5 dimensões de qualidade de software que serão avaliadas:

1. **Arquitetura, Design e Dívida Técnica** — DDD, Clean Architecture, SOLID, acoplamento
2. **DevSecOps, InfoSec e Software Supply Chain** — Pipeline, dependências, SAST, SBOM
3. **Observabilidade Profunda em Sistemas Distribuídos** — Logs, métricas, traces, health checks
4. **Estratégias Modernas de Teste como Evidência de Qualidade** — PBT, cobertura, pirâmide de testes
5. **Qualidade de Software como Sistema Sociotécnico** — Governança, métricas DORA, code review

Cada tema deve ser investigado com olhar crítico: o sistema realmente implementa o que declara?

## Licença

Projeto acadêmico — MATB02 Qualidade de Software (UFBA).
