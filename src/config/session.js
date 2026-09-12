const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const { env } = require('./env');

function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
}

function createSessionMiddleware() {
  const MySQLStore = MySQLStoreFactory(session);
  const store = new MySQLStore({
    ...parseDatabaseUrl(env.databaseUrl),
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 8 * 60 * 60 * 1000,
  });

  return session({
    name: 'lu_lou.sid',
    secret: env.sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 8 * 60 * 60 * 1000,
    },
  });
}

module.exports = { createSessionMiddleware, parseDatabaseUrl };
