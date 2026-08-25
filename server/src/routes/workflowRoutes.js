const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const workflowController = require('../controllers/workflowController');
const executionController = require('../controllers/executionController');

const router = express.Router();

// Apply auth middleware to all workflow routes
router.use(protect);

router.get('/', (req, res) => workflowController.getWorkflows(req, res));

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required for workflow generation.')
  ],
  (req, res) => workflowController.generateWorkflow(req, res)
);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required.')
  ],
  (req, res) => workflowController.createWorkflow(req, res)
);

router.get('/:id', (req, res) => workflowController.getWorkflowById(req, res));

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Workflow name cannot be empty.')
  ],
  (req, res) => workflowController.updateWorkflow(req, res)
);

router.delete('/:id', (req, res) => workflowController.deleteWorkflow(req, res));

// Direct workflow execution route (POST /api/workflows/:id/execute)
router.post('/:id/execute', (req, res) => {
  req.params.workflowId = req.params.id;
  return executionController.runExecution(req, res);
});

module.exports = router;
