const aiService = require('./ai.service');

async function analyzeCv(req, res) {
  const analysis = await aiService.analyzeCv(req.user.id, req.body.cvText);
  res.json({ success: true, data: analysis });
}

async function recommendOffers(req, res) {
  const offers = await aiService.recommendOffers(req.user.id);
  res.json({ success: true, data: offers });
}

async function startInterview(req, res) {
  const result = await aiService.startInterview(req.user.id, req.body.jobTitle);
  res.status(201).json({ success: true, data: result });
}

async function answerInterview(req, res) {
  const result = await aiService.answerInterview(req.user.id, req.params.sessionId, req.body.answer);
  res.json({ success: true, data: result });
}

module.exports = { analyzeCv, recommendOffers, startInterview, answerInterview };
