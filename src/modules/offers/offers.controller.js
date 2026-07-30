const offersService = require('./offers.service');

async function create(req, res) {
  const offer = await offersService.createOffer(req.user.id, req.user.role, req.body);
  res.status(201).json({ success: true, data: offer });
}

async function list(req, res) {
  const result = await offersService.listOffers(req.query);
  res.json({ success: true, data: result });
}

async function listMine(req, res) {
  const offers = await offersService.listMyOffers(req.user.id, req.user.role);
  res.json({ success: true, data: offers });
}

async function getOne(req, res) {
  const offer = await offersService.getOffer(req.params.id);
  res.json({ success: true, data: offer });
}

async function update(req, res) {
  const offer = await offersService.updateOffer(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: offer });
}

async function remove(req, res) {
  await offersService.deleteOffer(req.user.id, req.params.id);
  res.json({ success: true, message: 'Offre supprimee' });
}

async function save(req, res) {
  const saved = await offersService.saveOffer(req.user.id, req.params.id);
  res.json({ success: true, data: saved });
}

async function unsave(req, res) {
  await offersService.unsaveOffer(req.user.id, req.params.id);
  res.json({ success: true, message: 'Offre retiree des favoris' });
}

async function listSaved(req, res) {
  const offers = await offersService.listSavedOffers(req.user.id);
  res.json({ success: true, data: offers });
}

async function isSaved(req, res) {
  const saved = await offersService.isOfferSaved(req.user.id, req.params.id);
  res.json({ success: true, data: { isSaved: saved } });
}

module.exports = { create, list, listMine, getOne, update, remove, save, unsave, listSaved, isSaved };
