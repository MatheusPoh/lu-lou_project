const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = ['DATABASE_URL', 'SESSION_SECRET'];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }
}

module.exports = {
  validateEnv,
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    whatsappNumber: (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, ''),
    storeName: process.env.STORE_NAME || 'Lu Lou Sapataria',
    maxUploadMb: Math.max(1, Number(process.env.MAX_UPLOAD_MB) || 5),
  },
};
