const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const integrationController = require('../controllers/integrationController');

const router = express.Router();

router.use(protect);

router.get('/', (req, res) => integrationController.getIntegrations(req, res));
router.post('/:provider/connect', (req, res) => integrationController.connectIntegration(req, res));
router.delete('/:provider', (req, res) => integrationController.disconnectIntegration(req, res));

module.exports = router;
