const applicationsService = require('./applications.service');

async function apply(req, res) {
  const application = await applicationsService.apply(req.user.id, req.params.offerId, req.body);
  res.status(201).json({ success: true, data: application });
}

async function listMine(req, res) {
  const applications = await applicationsService.listMyApplications(req.user.id);
  res.json({ success: true, data: applications });
}

async function listForOffer(req, res) {
  const applications = await applicationsService.listOfferApplications(req.user.id, req.params.offerId);
  res.json({ success: true, data: applications });
}

async function updateStatus(req, res) {
  const application = await applicationsService.updateStatus(req.user.id, req.params.id, req.body.status);
  res.json({ success: true, data: application });
}

module.exports = { apply, listMine, listForOffer, updateStatus };
