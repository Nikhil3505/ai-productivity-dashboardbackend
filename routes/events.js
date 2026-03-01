const express = require('express');
const db = require('../database');
const { getWorkerMetrics, getWorkstationMetrics, getFactoryMetrics } = require('../controllers/metricsController');
const router = express.Router();

// POST /api/events - Ingest AI events
router.post('/', async (req, res) => {
  try {
    const event = req.body;
    
    // Validate required fields
    if (!event.timestamp || !event.worker_id || !event.workstation_id || !event.event_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert event (idempotent for duplicates via unique constraint if needed)
    await db.run(
      `INSERT INTO events (timestamp, worker_id, workstation_id, event_type, confidence, count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event.timestamp,
        event.worker_id,
        event.workstation_id,
        event.event_type,
        event.confidence || 0.9,
        event.count || 1
      ]
    );
    
    res.status(201).json({ message: 'Event ingested successfully', event });
  } catch (error) {
    console.error('Event ingestion error:', error);
    res.status(500).json({ error: 'Failed to ingest event' });
  }
});

// GET /api/metrics/workers
router.get('/workers', async (req, res) => {
  try {
    const metrics = await getWorkerMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/workstations
router.get('/workstations', async (req, res) => {
  try {
    const metrics = await getWorkstationMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/factory
router.get('/factory', async (req, res) => {
  try {
    const metrics = await getFactoryMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
