const authService = require('../services/auth.service');

async function login(req, res) {
  const user = await authService.authenticate(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

  await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
  req.session.userId = user.id;
  return res.json({ user });
}

async function logout(req, res) {
  await new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));
  res.clearCookie('lu_lou.sid');
  return res.status(204).send();
}

async function me(req, res) {
  const user = await authService.findUserById(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Sessão inválida.' });
  return res.json({ user });
}

module.exports = { login, logout, me };
