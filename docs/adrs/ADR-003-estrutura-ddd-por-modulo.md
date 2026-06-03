# ADR-003: Estrutura DDD por Módulo com Separação Rigorosa de Camadas

## Status: Accepted

## Context

O sistema é composto por 5 módulos de negócio (Produto, Cliente, Estoque, Pedido, Pagamento) que devem ser organizados seguindo os princípios de Domain-Driven Design (DDD) tático e Clean Architecture.

A decisão envolve:

- Como estruturar diretórios para refletir bounded contexts
- Como garantir a Dependency Rule (camadas internas não conhecem camadas externas)
- Como isolar o domínio de preocupações de infraestrutura
- Como posicionar use cases, value objects, aggregates e repositories

Princípios orientadores:

- **Dependency Rule (Robert C. Martin):** dependências apontam para o centro (domain)
- **DDD Tático (Eric Evans):** Aggregates protegem invariantes, Value Objects são imutáveis, Repositories abstraem persistência
- **Hexagonal Architecture (Alistair Cockburn):** Ports & Adapters para desacoplamento de I/O

## Decision

Adotamos a seguinte estrutura de diretórios para cada módulo:

```
src/modules/<modulo>/
├── domain/           # Núcleo puro — zero dependências externas
│   ├── aggregates/   # Aggregate roots com invariantes
│   ├── entities/     # Entities com identidade
│   ├── value-objects/# Value Objects imutáveis
│   └── repositories/ # Interfaces (ports) de persistência
├── application/      # Use Cases — orquestra domain via ports
│   └── use-cases/
├── infrastructure/   # Adapters — implementações concretas dos ports
│   ├── persistence/  # Repositórios TypeORM
│   └── mappers/      # Tradução entre domain entities e ORM entities
└── interface/        # Entrada HTTP — controllers, DTOs
    ├── controllers/
    └── dtos/
```

### Regras de dependência

1. **Domain:** A camada de domínio **NÃO possui dependência de nenhum framework de infraestrutura**. Aggregates, Entities e Value Objects são classes TypeScript puras (POJOs), sem decorators de ORM, sem imports de bibliotecas externas de persistência ou HTTP. Interfaces de repository definem contratos puros que a infraestrutura implementa.

2. **Application:** Use Cases dependem apenas de interfaces do domínio (repository ports). Recebem dependências via injeção de construtor. Não importam TypeORM, HTTP libraries, ou qualquer adapter concreto.

3. **Infrastructure:** Implementa os ports definidos no domínio. Aqui vivem os decorators TypeORM (`@Entity`, `@Column`), os mappers que traduzem entre ORM entities e domain entities, e os repositórios concretos.

4. **Interface:** Adapta requisições HTTP para chamadas de use cases. Controllers usam DTOs com decorators de validação (`class-validator`). Não contém regras de negócio.

### Separação Domain ↔ Infrastructure

A separação é garantida por:

- Entities de domínio são **objetos puros** sem anotações de persistência
- Existe um **mapper** em `infrastructure/mappers/` que traduz entre a entity de domínio e a entity de ORM (que possui os decorators `@Entity`, `@Column`)
- O repository concreto em `infrastructure/persistence/` usa o mapper para converter antes de persistir e depois de recuperar dados

### Encapsulamento dos Aggregates

Cada Aggregate Root:

- Expõe apenas métodos de comportamento (commands) e queries de estado
- Protege invariantes via validação interna nos métodos de mutação
- Não expõe setters públicos — estado é alterado apenas via métodos de domínio nomeados
- Publica domain events para comunicação entre aggregates

## Consequences

### Positivas

- Domain puro facilita testes unitários sem mocks de infraestrutura
- Dependency Rule garante que mudanças no ORM não afetam regras de negócio
- Mapper explícito documenta a tradução entre modelos
- Estrutura de diretórios comunica intenção arquitetural para novos desenvolvedores
- Facilita troca de ORM (TypeORM → Prisma) sem alterar domínio

### Negativas

- Mais arquivos e indireção (mapper entre domain entity e ORM entity)
- Overhead para módulos simples (CRUD sem lógica de domínio rica)
- Curva de aprendizado para alunos que não conhecem DDD/Clean Architecture
- Risco de "anemic domain" se lógica ficar apenas nos use cases

### Trade-offs

- Privilegiamos pureza arquitetural sobre produtividade imediata
- O overhead de mapeamento é aceitável em contexto pedagógico
- A estrutura serve como referência teórica do que seria a implementação correta
