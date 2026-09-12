const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Administrador';
  if (!email || !password) throw new Error('Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD antes de executar o seed.');
  if (password.length < 8) throw new Error('SEED_ADMIN_PASSWORD deve ter pelo menos 8 caracteres.');

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({ where: { email }, update: { name, passwordHash }, create: { name, email, passwordHash } });

  const categories = {};
  for (const data of [{ name: 'Tênis', slug: 'tenis' }, { name: 'Sandálias', slug: 'sandalias' }, { name: 'Sapatos', slug: 'sapatos' }]) {
    categories[data.slug] = await prisma.category.upsert({ where: { slug: data.slug }, update: { name: data.name }, create: data });
  }

  const examples = [
    { name: 'Tênis Casual', slug: 'tenis-casual', description: 'Tênis confortável para o dia a dia.', price: 179.90, categoryId: categories.tenis.id, sizes: [{ size: '35', stock: 2 }, { size: '36', stock: 3 }, { size: '37', stock: 0 }, { size: '38', stock: 2 }] },
    { name: 'Sandália Conforto', slug: 'sandalia-conforto', description: 'Sandália leve e versátil.', price: 129.90, categoryId: categories.sandalias.id, sizes: [{ size: '34', stock: 1 }, { size: '35', stock: 4 }, { size: '36', stock: 2 }, { size: '37', stock: 0 }] },
  ];
  for (const example of examples) {
    const { sizes, ...data } = example;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: data,
      create: { ...data, sizes: { create: sizes } },
    });
  }
  console.log('Seed concluído. Administrador e dados de exemplo foram criados/atualizados.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
