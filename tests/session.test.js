const test = require('node:test');
const assert = require('node:assert/strict');
process.env.DATABASE_URL ||= 'mysql://user:p%40ss@localhost:3307/store';
process.env.SESSION_SECRET ||= 'test-secret';
const { parseDatabaseUrl } = require('../src/config/session');

test('converte DATABASE_URL nas opções do MySQL', () => {
  assert.deepEqual(parseDatabaseUrl('mysql://user:p%40ss@localhost:3307/store'), { host: 'localhost', port: 3307, user: 'user', password: 'p@ss', database: 'store' });
});
