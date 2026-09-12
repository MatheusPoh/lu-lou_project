const { validateEnv, env } = require('./config/env');
const prisma = require('./config/prisma');

validateEnv();
const { createApp } = require('./app');
const app = createApp();
const server = app.listen(env.port, () => console.log(`Servidor iniciado em http://localhost:${env.port}`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
