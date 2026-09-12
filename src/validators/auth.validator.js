const { z } = require('zod');

const loginSchema = z.object({
  email: z.email('E-mail inválido.').trim().toLowerCase(),
  password: z.string().min(1, 'Informe a senha.').max(128),
}).strict();

module.exports = { loginSchema };
