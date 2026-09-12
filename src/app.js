const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const { env } = require('./config/env');
const { createSessionMiddleware } = require('./config/session');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const { notFound, errorHandler } = require('./middlewares/error-handler');

function createApp() {
  const app = express();
  if (env.nodeEnv === 'production') app.set('trust proxy', 1);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(createSessionMiddleware());

  app.get('/api/config', (req, res) => res.json({ storeName: env.storeName, whatsappNumber: env.whatsappNumber }));
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);

  app.use(express.static(path.resolve(process.cwd(), 'public'), { extensions: ['html'] }));
  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
