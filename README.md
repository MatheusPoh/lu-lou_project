# Lu Lou Sapataria

Sistema web simples para catálogo de calçados e administração de produtos, tamanhos, estoque, imagens e categorias. A compra é encaminhada ao WhatsApp; o sistema não processa pagamentos nem reduz estoque automaticamente.

## Requisitos

- Node.js 18 ou superior
- MySQL 8 ou superior
- npm

## Instalação local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o banco no MySQL:

   ```sql
   CREATE DATABASE lu_lou CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Copie `.env.example` para `.env` e preencha todas as variáveis. Em `DATABASE_URL`, caracteres especiais do usuário ou senha precisam estar codificados para URL. Use uma `SESSION_SECRET` longa e aleatória. O número do WhatsApp deve conter país e DDD, somente dígitos.

4. Crie as tabelas e gere o cliente Prisma:

   ```bash
   npx prisma migrate deploy
   npm run prisma:generate
   ```

5. Defina `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` no `.env` e carregue os dados iniciais:

   ```bash
   npm run prisma:seed
   ```

6. Inicie em desenvolvimento:

   ```bash
   npm run dev
   ```

Abra `http://localhost:3000`. O painel fica em `http://localhost:3000/admin/login.html`.

## Produção

Configure `NODE_ENV=production`, use HTTPS e execute:

```bash
npm ci --omit=dev
npx prisma migrate deploy
npm start
```

Uploads ficam em `public/uploads`. Em produção, mantenha essa pasta em armazenamento persistente e inclua-a na rotina de backup.

## Deploy na Hostinger

Use um plano que ofereça hospedagem Node.js e banco MySQL. No painel da Hostinger:

1. Crie um banco MySQL e um usuário com acesso a ele.
2. Envie o projeto por Git ou pelo gerenciador de arquivos, sem enviar `.env` e `node_modules`.
3. Cadastre as variáveis do `.env.example` na configuração da aplicação.
4. Selecione `src/server.js` como arquivo de inicialização e Node.js 18 ou superior.
5. Execute `npm ci`, `npx prisma generate`, `npx prisma migrate deploy` e `npm run prisma:seed` no terminal da hospedagem.
6. Aponte o domínio para a aplicação e ative SSL/HTTPS antes de usar o painel.

Confirme com o suporte/plano contratado se o armazenamento de uploads é persistente após novos deploys. Caso não seja, será necessário usar armazenamento de objetos em uma evolução futura.

## Testes

```bash
npm test
```

Os testes atuais validam a geração de slugs, regras de preço/estoque e leitura segura da URL do MySQL. Para testar o fluxo completo, configure um banco de testes e valide login, CRUD, upload e catálogo pelo navegador.

## API

Rotas públicas: `GET /api/products`, `GET /api/products/:id`, `GET /api/categories` e `GET /api/config`.

Rotas de autenticação: `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me`.

As rotas de escrita em `/api/products` e `/api/categories` exigem uma sessão administrativa válida.
