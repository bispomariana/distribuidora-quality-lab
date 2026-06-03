# ADR-001: Escolha do NestJS como Framework Backend

## Status: Accepted

## Context

O sistema Distribuidora Quality Lab necessita de um framework backend TypeScript que ofereça:

- Suporte nativo a injeção de dependência (DI) para inversão de controle
- Sistema de módulos para organização em bounded contexts
- Decorators para metaprogramação declarativa (controllers, DTOs, validação)
- Boa integração com ORMs (TypeORM, Prisma, Sequelize)
- Ecossistema maduro de plugins (Swagger, health checks, rate limiting)
- Documentação extensa e comunidade ativa, facilitando onboarding de alunos

Alternativas consideradas:

1. **Express.js puro** — Minimalista, sem opinião sobre estrutura. Requer setup manual de DI, validação, documentação de API. Curva de aprendizado baixa mas exige mais decisões arquiteturais.
2. **Fastify** — Performance superior (2-3x Express em benchmarks), schema-based validation. Ecossistema menor, menos material pedagógico disponível.
3. **NestJS** — Opinado, modular, DI nativa, decorators, integração out-of-the-box com Swagger e TypeORM.

## Decision

Adotamos **NestJS** como framework backend principal pelos seguintes motivos:

1. **Injeção de dependência nativa:** O container IoC do NestJS permite implementar Dependency Inversion Principle de forma idiomática, facilitando a demonstração de DIP correto e violações intencionais.

2. **Sistema de módulos:** Cada bounded context (Produto, Cliente, Estoque, Pedido, Pagamento) é encapsulado em um Module do NestJS, promovendo coesão e isolamento.

3. **Decorators declarativos:** `@Controller`, `@Injectable`, `@Module` tornam a intenção arquitetural visível na estrutura do código, facilitando a análise pelos alunos.

4. **Integração com Swagger:** O `@nestjs/swagger` gera documentação OpenAPI automaticamente a partir de decorators nos DTOs e controllers, atendendo ao requisito de documentação acessível em `/api/docs`.

5. **Material pedagógico:** NestJS possui documentação oficial extensa, cursos, e exemplos de aplicação de DDD/Clean Architecture, o que facilita a contextualização para alunos.

6. **Testing utilities:** O `@nestjs/testing` oferece TestingModule para testes de integração com DI mockada, alinhado à estratégia de testes do projeto.

## Consequences

### Positivas

- Estrutura opinada reduz decisões de baixo nível, permitindo foco nos conceitos de qualidade
- DI nativa facilita mock/stub em testes e demonstração de inversão de dependência
- Ecossistema de plugins cobre requisitos não-funcionais (Swagger, health, metrics) sem código custom
- Familiaridade com padrões Angular (decorators, módulos) para alunos com experiência frontend

### Negativas

- Overhead de abstração para um sistema simples (CRUD) — mais código boilerplate que Express puro
- Decorators podem ofuscar o fluxo de execução para quem não conhece metaprogramação
- Acoplamento ao framework NestJS em toda a camada de interface e infraestrutura
- Performance inferior ao Fastify para workloads intensivos (irrelevante neste contexto pedagógico)

### Riscos

- Alunos podem confundir patterns do NestJS (Providers, Guards, Interceptors) com patterns de domínio (Repositories, Services, Aggregates)
- A facilitade do NestJS pode mascarar a complexidade real de implementar DI sem framework
