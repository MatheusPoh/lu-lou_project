const { z } = require('zod');

const idSchema = z.coerce.number().int().positive();
const priceSchema = z.coerce.number().positive('O preço deve ser maior que zero.').max(99999999.99);

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(5000),
  price: priceSchema,
  categoryId: idSchema,
  active: z.boolean().optional().default(true),
}).strict();

const statusSchema = z.object({ active: z.boolean() }).strict();

const sizeSchema = z.object({
  size: z.string().trim().min(1).max(20),
  stock: z.coerce.number().int().min(0, 'O estoque não pode ser negativo.').max(999999),
}).strict();

const sizeUpdateSchema = z.object({
  size: z.string().trim().min(1).max(20).optional(),
  stock: z.coerce.number().int().min(0, 'O estoque não pode ser negativo.').max(999999).optional(),
}).strict().refine((value) => value.size !== undefined || value.stock !== undefined, 'Informe ao menos um campo.');

const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  admin: z.enum(['true', 'false']).optional(),
}).passthrough();

module.exports = { idSchema, productSchema, statusSchema, sizeSchema, sizeUpdateSchema, productQuerySchema };
