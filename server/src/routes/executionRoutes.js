const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const executionController = require('../controllers/executionController');

const router = express.Router();

router.use(protect);

router.post('/:workflowId/run', (req, res) => executionController.runExecution(req, res));
router.post('/:id/run', (req, res) => executionController.runExecution(req, res));
router.get('/:id', (req, res) => executionController.getExecution(req, res));
router.get('/', (req, res) => executionController.getExecutions(req, res));

module.exports = router;
