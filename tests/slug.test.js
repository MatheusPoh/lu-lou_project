const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify } = require('../src/utils/slug');

test('slugify remove acentos e normaliza espaços', () => {
  assert.equal(slugify('  Tênis Casual Feminino  '), 'tenis-casual-feminino');
});

test('slugify remove caracteres especiais', () => {
  assert.equal(slugify('Sapato & Cia.'), 'sapato-cia');
});
