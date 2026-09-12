const fs = require('node:fs/promises');
const path = require('node:path');
const prisma = require('../config/prisma');
const { slugify } = require('../utils/slug');
const { uploadDirectory } = require('../middlewares/upload');

const includeRelations = {
  category: true,
  images: { orderBy: { createdAt: 'asc' } },
  sizes: { orderBy: { size: 'asc' } },
};

async function uniqueSlug(name, ignoredId) {
  const base = slugify(name) || 'produto';
  let slug = base;
  let suffix = 2;
  while (await prisma.product.findFirst({ where: { slug, ...(ignoredId ? { id: { not: ignoredId } } : {}) } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

function serializeProduct(product) {
  return { ...product, price: Number(product.price) };
}

async function listProducts({ search, category, includeInactive = false }) {
  const products = await prisma.product.findMany({
    where: {
      ...(!includeInactive ? { active: true } : {}),
      ...(search ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] } : {}),
      ...(category ? { category: { slug: category } } : {}),
    },
    include: includeRelations,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
}

async function getProduct(id, includeInactive = false) {
  const product = await prisma.product.findFirst({
    where: { id, ...(!includeInactive ? { active: true } : {}) },
    include: includeRelations,
  });
  if (!product) {
    const error = new Error('Produto não encontrado.');
    error.status = 404;
    throw error;
  }
  return serializeProduct(product);
}

async function createProduct(data) {
  const product = await prisma.product.create({
    data: { ...data, slug: await uniqueSlug(data.name) },
    include: includeRelations,
  });
  return serializeProduct(product);
}

async function updateProduct(id, data) {
  const product = await prisma.product.update({
    where: { id },
    data: { ...data, slug: await uniqueSlug(data.name, id) },
    include: includeRelations,
  });
  return serializeProduct(product);
}

async function deleteProduct(id) {
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) {
    const error = new Error('Produto não encontrado.');
    error.status = 404;
    throw error;
  }
  await prisma.product.delete({ where: { id } });
  await Promise.all(product.images.map((image) => removeLocalFile(image.url)));
}

async function updateStatus(id, active) {
  return prisma.product.update({ where: { id }, data: { active } });
}

async function addImages(productId, files) {
  await getProduct(productId, true);
  if (!files?.length) {
    const error = new Error('Envie ao menos uma imagem.');
    error.status = 400;
    throw error;
  }
  const validity = await Promise.all(files.map(async (file) => {
    const content = await fs.readFile(file.path);
    const isJpeg = content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff;
    const isPng = content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = content.subarray(0, 4).toString('ascii') === 'RIFF' && content.subarray(8, 12).toString('ascii') === 'WEBP';
    return isJpeg || isPng || isWebp;
  }));
  if (validity.some((valid) => !valid)) {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
    const error = new Error('Um ou mais arquivos não contêm uma imagem válida.');
    error.status = 400;
    throw error;
  }
  const invalidFiles = [];
  for (const file of files) {
    const bytes = await fs.readFile(file.path);
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
    if (!isJpeg && !isPng && !isWebp) invalidFiles.push(file);
  }
  if (invalidFiles.length) {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
    const error = new Error('Um ou mais arquivos não contêm uma imagem válida.');
    error.status = 400;
    throw error;
  }
  await prisma.productImage.createMany({
    data: files.map((file) => ({ productId, url: `/uploads/${file.filename}` })),
  });
  return getProduct(productId, true);
}

async function removeLocalFile(url) {
  const filename = path.basename(url);
  try { await fs.unlink(path.join(uploadDirectory, filename)); } catch (error) {
    if (error.code !== 'ENOENT') console.error('Falha ao remover imagem:', error.message);
  }
}

async function deleteImage(productId, imageId) {
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) {
    const error = new Error('Imagem não encontrada.');
    error.status = 404;
    throw error;
  }
  await prisma.productImage.delete({ where: { id: imageId } });
  await removeLocalFile(image.url);
}

async function addSize(productId, data) {
  await getProduct(productId, true);
  return prisma.productSize.create({ data: { productId, ...data } });
}

async function updateSize(productId, sizeId, data) {
  const existing = await prisma.productSize.findFirst({ where: { id: sizeId, productId } });
  if (!existing) {
    const error = new Error('Tamanho não encontrado.');
    error.status = 404;
    throw error;
  }
  return prisma.productSize.update({ where: { id: sizeId }, data });
}

async function deleteSize(productId, sizeId) {
  const existing = await prisma.productSize.findFirst({ where: { id: sizeId, productId } });
  if (!existing) {
    const error = new Error('Tamanho não encontrado.');
    error.status = 404;
    throw error;
  }
  return prisma.productSize.delete({ where: { id: sizeId } });
}

module.exports = {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  updateStatus, addImages, deleteImage, addSize, updateSize, deleteSize,
};
