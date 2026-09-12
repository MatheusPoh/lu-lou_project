const service = require('../services/category.service');

async function list(req, res) { res.json({ categories: await service.listCategories() }); }
async function create(req, res) { res.status(201).json({ category: await service.createCategory(req.body) }); }
async function update(req, res) { res.json({ category: await service.updateCategory(Number(req.params.id), req.body) }); }
async function remove(req, res) { await service.deleteCategory(Number(req.params.id)); res.status(204).send(); }

module.exports = { list, create, update, remove };
