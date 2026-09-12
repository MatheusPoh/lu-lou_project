const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

async function authenticate(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return { id: user.id, name: user.name, email: user.email };
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
}

module.exports = { authenticate, findUserById };
