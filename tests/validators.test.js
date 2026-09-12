const test = require('node:test');
const assert = require('node:assert/strict');
const { productSchema, sizeSchema } = require('../src/validators/product.validator');

test('produto válido é aceito', () => {
  const result = productSchema.safeParse({ name: 'Tênis', description: 'Modelo casual', price: 99.9, categoryId: 1, active: true });
  assert.equal(result.success, true);
});

test('estoque negativo é rejeitado', () => {
  const result = sizeSchema.safeParse({ size: '37', stock: -1 });
  assert.equal(result.success, false);
});

test('preço zero é rejeitado', () => {
  const result = productSchema.safeParse({ name: 'Tênis', description: 'Modelo casual', price: 0, categoryId: 1 });
  assert.equal(result.success, false);
});
