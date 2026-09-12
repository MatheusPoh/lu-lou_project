const multer = require('multer');
const { Prisma } = require('@prisma/client');
const { env } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ error: 'Recurso não encontrado.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? `A imagem deve ter no máximo ${env.maxUploadMb} MB.`
      : 'Falha ao enviar a imagem.';
    return res.status(400).json({ error: message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Já existe um registro com esses dados.' });
    if (error.code === 'P2003') return res.status(409).json({ error: 'O registro está sendo utilizado e não pode ser excluído.' });
    if (error.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  const status = error.status || 500;
  if (env.nodeEnv !== 'production') console.error(error);
  return res.status(status).json({
    error: status === 500 ? 'Erro interno do servidor.' : error.message,
    ...(env.nodeEnv !== 'production' && status === 500 ? { details: error.message } : {}),
  });
}

module.exports = { notFound, errorHandler };
