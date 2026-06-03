# Guia de Contribuição — Distribuidora Quality Lab

Obrigado pelo interesse em contribuir com o projeto! Este documento descreve as práticas e processos que seguimos para manter a qualidade do código e a colaboração efetiva entre os membros da equipe.

## 1. Fluxo de Branches

Adotamos o modelo de branching baseado em feature branches com as seguintes convenções de nomenclatura:

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Nova funcionalidade | `feature/<descricao>` | `feature/add-payment-validation` |
| Correção de bug | `bugfix/<descricao>` | `bugfix/fix-stock-calculation` |
| Correção urgente (prod) | `hotfix/<descricao>` | `hotfix/fix-order-status-null` |
| Refatoração | `refactor/<descricao>` | `refactor/extract-inventory-service` |
| Documentação | `docs/<descricao>` | `docs/update-api-swagger` |

### Regras de branching

- A branch `main` é protegida e representa o estado estável do projeto.
- Toda modificação deve ser feita em uma branch derivada de `main`.
- Branches devem ter vida curta (máximo 3 dias) para facilitar integração.
- Antes de abrir PR, fazer rebase com `main` para resolver conflitos localmente.
- Branches de hotfix devem ser priorizadas e mergeadas o mais rápido possível.

## 2. Convenções de Commit

Seguimos o padrão **Conventional Commits** para manter um histórico legível e possibilitar geração automática de changelogs.

### Formato

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações na documentação |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Adição ou modificação de testes |
| `chore` | Manutenção, dependências, CI/CD |
| `perf` | Melhoria de performance |

### Exemplos

```
feat(product): add category validation on creation
fix(inventory): correct stock balance after cancellation
test(order): add property test for state machine transitions
docs(api): update swagger annotations for payment module
```

### Regras de mensagem

- Descrição em inglês, imperativo, lowercase, sem ponto final.
- Máximo 72 caracteres na primeira linha.
- Corpo opcional separado por linha em branco — explicar o PORQUÊ da mudança.
- Breaking changes: adicionar `BREAKING CHANGE:` no rodapé.

## 3. Processo de Code Review

O code review é parte fundamental do nosso processo de qualidade. Todo código que entra na `main` **obrigatoriamente** passa por revisão de pelo menos 2 aprovadores.

### Requisitos para merge

- **Mínimo 2 approvals** de membros do time responsável (conforme CODEOWNERS).
- Todos os checks de CI devem estar verdes (lint, testes, security scan).
- Não pode haver conversas não resolvidas (unresolved threads).
- O autor NÃO pode aprovar o próprio PR.
- Squash merge é o padrão — manter histórico limpo na `main`.

### Responsabilidades do reviewer

- Verificar conformidade com a arquitetura (DDD, Clean Architecture).
- Avaliar se testes cobrem os cenários relevantes (unitário + propriedade).
- Identificar code smells, violações de SOLID e oportunidades de simplificação.
- Verificar que nenhuma informação sensível está exposta (credenciais, tokens).
- Confirmar que a documentação foi atualizada se necessário.

### Responsabilidades do autor

- Manter PRs pequenos e focados (máximo 400 linhas alteradas).
- Preencher o template de PR com descrição, motivação e como testar.
- Responder a cada comentário do reviewer (resolver ou justificar).
- Garantir que CI está verde antes de solicitar review.

### SLA de review

- PRs devem ser revisados em até 24 horas úteis.
- PRs de hotfix têm prioridade máxima — review imediato.
- Se um reviewer não responder em 24h, escalar para o tech lead.

## 4. Template de Pull Request

Ao abrir um PR, preencha o template com as seguintes seções:

```markdown
## Descrição
Breve descrição do que foi feito e por quê.

## Tipo de mudança
- [ ] Nova feature
- [ ] Bug fix
- [ ] Refatoração
- [ ] Documentação
- [ ] Infraestrutura/CI

## Como testar
Passos para verificar a mudança localmente.

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem warnings de lint
- [ ] Sem secrets expostos
```

## 5. Padrões de Qualidade

- Cobertura de testes mínima: 70% de linhas.
- Zero warnings de ESLint no código commitado.
- Formatação automática via Prettier (executada no pre-commit hook).
- Testes de propriedade para toda regra de negócio crítica.
- Nenhum `any` explícito em código TypeScript (usar `unknown` + narrowing).

## 6. Contato

Para dúvidas sobre o processo, consulte os leads técnicos definidos no arquivo `CODEOWNERS` ou abra uma discussion no repositório.
