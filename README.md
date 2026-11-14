# Saúde na Mão — Protótipo

Interface HTML/CSS/JavaScript puro inspirada nas telas de referência, conectada à API Express/TypeORM existente.

## Como executar

1. Instale PostgreSQL e crie um banco `saudenamao`.
2. Crie `.env` na raiz:

```ini
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SUA_SENHA
DB_NAME=saudenamao
PORT=3000
```

3. Execute `npm install` e `npx ts-node-dev --respawn --transpile-only src/server.ts`.
4. Abra **http://localhost:3000** (não use Live Server/porta 5500).
5. Crie uma conta com CPF **fictício** de 11 dígitos, entre e use **Dados de teste** para cadastrar profissionais e procedimentos antes de criar um agendamento.

## Telas

Login/cadastro, início (próxima consulta + fila), agendamentos (filtros + detalhes), histórico, lista de espera, perfil, novo agendamento e dados de teste.

## Limitações importantes

- **Somente protótipo com dados fictícios. Não use dados pessoais ou de saúde reais.**
- A API atual **não autentica requisições posteriores ao login**, retorna listas globais e não tem autorização por paciente. A filtragem no navegador **não protege dados**. Necessário implementar autenticação, autorização e consultas por paciente no backend antes de qualquer uso real.
- O backend atual guarda senhas sem hash. Implementar bcrypt e validação apropriada antes de produção.
- A API não tem campos para nome, hora da consulta ou unidade específica; o layout não inventa essas informações.
- O formulário de novo agendamento grava na API de demonstração, **não agenda consultas reais na rede pública**.
- Não foram implementados cancelamento, reagendamento nem avisos de WhatsApp porque a API atual não tem essas funcionalidades.
- O banco utiliza `synchronize: true`, adequado apenas para desenvolvimento.
