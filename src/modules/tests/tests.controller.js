const testsService = require('./tests.service');

async function getQuestions(req, res) {
  const questions = await testsService.getQuestions(req.query.category, Number(req.query.count) || 10);
  res.json({ success: true, data: questions });
}

async function submit(req, res) {
  const result = await testsService.submitResult(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
}

async function myResults(req, res) {
  const results = await testsService.myResults(req.user.id);
  res.json({ success: true, data: results });
}

module.exports = { getQuestions, submit, myResults };
