const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
}).strict();

module.exports = { categorySchema };
