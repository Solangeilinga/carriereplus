const aiService = require('./ai.service');

async function analyzeCv(req, res) {
  const analysis = await aiService.analyzeCv(req.user.id, req.body.cvText);
  res.json({ success: true, data: analysis });
}

async function recommendOffers(req, res) {
  const offers = await aiService.recommendOffers(req.user.id);
  res.json({ success: true, data: offers });
}

async function generateInterview(req, res) {
  const session = await aiService.generateInterview(req.user.id, req.body.jobTitle);
  res.status(201).json({ success: true, data: session });
}

async function evaluateInterview(req, res) {
  const session = await aiService.evaluateInterview(req.user.id, req.params.sessionId, req.body.answers);
  res.json({ success: true, data: session });
}

module.exports = { analyzeCv, recommendOffers, generateInterview, evaluateInterview };
