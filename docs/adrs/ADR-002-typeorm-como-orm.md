# ADR-002: TypeORM como ORM de Persistência

## Status: Accepted

## Context

O sistema requer um ORM para acesso ao PostgreSQL que ofereça:

- Suporte a migrations versionadas e executáveis no startup
- Mapeamento objeto-relacional com tipagem TypeScript
- Suporte ao padrão Repository para abstração de persistência
- Compatibilidade com NestJS via módulo oficial
- Capacidade de demonstrar tanto boas práticas quanto violações de separação de camadas

Alternativas consideradas:

1. **Prisma** — Schema-first, type-safe, migrations automatizadas. Gera client tipado a partir do schema. Não usa decorators, o que dificulta a demonstração de acoplamento domínio-infraestrutura.
2. **TypeORM** — Decorators para mapeamento, suporte a Active Record e Data Mapper, migrations CLI, módulo NestJS oficial.
3. **Sequelize** — ORM maduro, menos idiomático em TypeScript, tipagem mais fraca.
4. **Knex.js** — Query builder sem ORM completo. Requer mais código manual para mapeamento.

## Decision

Adotamos **TypeORM** como ORM de persistência pelos seguintes motivos:

1. **Decorators de mapeamento:** `@Entity`, `@Column`, `@PrimaryGeneratedColumn` permitem mapear entidades para tabelas de forma declarativa. Isso é pedagogicamente relevante porque torna visível o acoplamento entre domínio e infraestrutura quando decorators são usados na camada incorreta.

2. **Padrão Data Mapper:** TypeORM suporta o padrão Data Mapper onde entities são POJOs e o repository faz o mapeamento. Isso permite demonstrar a separação correta (entity pura + mapper) e a violação intencional (entity com decorators).

3. **Migrations:** O CLI de migrations do TypeORM gera e executa migrations incrementais, atendendo ao requisito de schema versionado com execução automática no startup.

4. **Integração NestJS:** O `@nestjs/typeorm` oferece `TypeOrmModule.forRoot()` e `TypeOrmModule.forFeature()` para setup declarativo por módulo.

5. **Flexibilidade pedagógica:** A dualidade Active Record / Data Mapper do TypeORM permite mostrar aos alunos como a mesma ferramenta pode ser usada de formas arquiteturalmente corretas ou incorretas.

## Consequences

### Positivas

- Decorators tornam explícito o mapeamento OR, facilitando identificação de violações de camada
- Suporte a migrations automáticas no startup via configuração
- Módulo NestJS oficial com documentação integrada
- Padrão Repository disponível nativamente para abstração de persistência
- Comunidade ativa e material de referência abundante

### Negativas

- TypeORM tem bugs conhecidos em versões recentes (query builder edge cases)
- Performance inferior ao Prisma para queries complexas
- API menos type-safe que Prisma (queries retornam `any` em cenários com relations)
- Migrations podem conflitar em desenvolvimento paralelo

### Trade-offs

- Escolhemos expressividade pedagógica (decorators visíveis) sobre type-safety máxima (Prisma)
- O risco de bugs do TypeORM é aceitável num contexto de estudo, não de produção
