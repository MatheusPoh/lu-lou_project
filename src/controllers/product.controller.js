const service = require('../services/product.service');

async function list(req, res) {
  const includeInactive = req.query.admin === 'true' && Boolean(req.session?.userId);
  const products = await service.listProducts({ ...req.query, includeInactive });
  res.json({ products });
}
async function get(req, res) {
  const includeInactive = req.query.admin === 'true' && Boolean(req.session?.userId);
  res.json({ product: await service.getProduct(Number(req.params.id), includeInactive) });
}
async function create(req, res) { res.status(201).json({ product: await service.createProduct(req.body) }); }
async function update(req, res) { res.json({ product: await service.updateProduct(Number(req.params.id), req.body) }); }
async function remove(req, res) { await service.deleteProduct(Number(req.params.id)); res.status(204).send(); }
async function status(req, res) { res.json({ product: await service.updateStatus(Number(req.params.id), req.body.active) }); }
async function addImages(req, res) { res.status(201).json({ product: await service.addImages(Number(req.params.id), req.files) }); }
async function deleteImage(req, res) { await service.deleteImage(Number(req.params.id), Number(req.params.imageId)); res.status(204).send(); }
async function addSize(req, res) { res.status(201).json({ size: await service.addSize(Number(req.params.id), req.body) }); }
async function updateSize(req, res) { res.json({ size: await service.updateSize(Number(req.params.id), Number(req.params.sizeId), req.body) }); }
async function deleteSize(req, res) { await service.deleteSize(Number(req.params.id), Number(req.params.sizeId)); res.status(204).send(); }

module.exports = { list, get, create, update, remove, status, addImages, deleteImage, addSize, updateSize, deleteSize };
