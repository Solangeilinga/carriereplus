const libraryService = require('./library.service');

async function list(req, res) {
  const result = await libraryService.listResources(req.query);
  res.json({ success: true, data: result });
}

// Reserve a un role ADMIN
async function create(req, res) {
  const resource = await libraryService.createResource(req.body);
  res.status(201).json({ success: true, data: resource });
}

async function update(req, res) {
  const resource = await libraryService.updateResource(req.params.id, req.body);
  res.json({ success: true, data: resource });
}

async function remove(req, res) {
  await libraryService.deleteResource(req.params.id);
  res.json({ success: true, message: 'Ressource supprimee' });
}

module.exports = { list, create, update, remove };
