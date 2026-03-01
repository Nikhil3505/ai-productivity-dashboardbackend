const express = require('express');
const {
  getWorkerMetrics,
  getWorkstationMetrics,
  getFactoryMetrics
} = require('../controllers/metricsController');

const router = express.Router();

router.get('/workers', async (req, res) => {
  try {
    const data = await getWorkerMetrics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workstations', async (req, res) => {
  try {
    const data = await getWorkstationMetrics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/factory', async (req, res) => {
  try {
    const data = await getFactoryMetrics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;