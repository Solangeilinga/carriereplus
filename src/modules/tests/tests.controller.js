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

// --- Admin ---

async function listAllQuestions(req, res) {
  const result = await testsService.listAllQuestions(req.query);
  res.json({ success: true, data: result });
}

async function createQuestion(req, res) {
  const question = await testsService.createQuestion(req.body);
  res.status(201).json({ success: true, data: question });
}

async function updateQuestion(req, res) {
  const question = await testsService.updateQuestion(req.params.id, req.body);
  res.json({ success: true, data: question });
}

async function deleteQuestion(req, res) {
  await testsService.deleteQuestion(req.params.id);
  res.json({ success: true, message: 'Question supprimee' });
}

module.exports = { getQuestions, submit, myResults, listAllQuestions, createQuestion, updateQuestion, deleteQuestion };
