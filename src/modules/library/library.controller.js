const libraryService = require('./library.service');

async function list(req, res) {
  const result = await libraryService.listResources(req.query);
  res.json({ success: true, data: result });
}

// Reserve a un role ADMIN en pratique (a affiner selon besoin)
async function create(req, res) {
  const resource = await libraryService.createResource(req.body);
  res.status(201).json({ success: true, data: resource });
}

module.exports = { list, create };
