const prisma = require('../config/prisma');
const { slugify } = require('../utils/slug');

async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

async function uniqueSlug(name, ignoredId) {
  const base = slugify(name) || 'categoria';
  let slug = base;
  let suffix = 2;
  while (await prisma.category.findFirst({ where: { slug, ...(ignoredId ? { id: { not: ignoredId } } : {}) } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

async function createCategory(data) {
  return prisma.category.create({ data: { name: data.name, slug: await uniqueSlug(data.name) } });
}

async function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data: { name: data.name, slug: await uniqueSlug(data.name, id) } });
}

async function deleteCategory(id) {
  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products) {
    const error = new Error('Não é possível excluir uma categoria que possui produtos.');
    error.status = 409;
    throw error;
  }
  return prisma.category.delete({ where: { id } });
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
