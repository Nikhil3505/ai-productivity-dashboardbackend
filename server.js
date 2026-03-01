// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const path = require('path');
// const db = require('./database');
// const eventsRouter = require('./routes/events');
// const metricsRouter = require('./routes/metrics');
// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Routes
// app.use('/api/events', eventsRouter);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Seed endpoint
// app.post('/api/seed', async (req, res) => {
//   try {
//     const { seedEvents } = require('./seed');
//     await seedEvents();
//     res.json({ message: 'Database seeded successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// const initializeDb = async () => {
//   await db.initialize();
  
//   // 🚀 AUTO-SEED: Check if data exists, seed if empty
//   try {
//     const eventCount = await db.query('SELECT COUNT(*) as count FROM events');
//     const workerCount = await db.query('SELECT COUNT(*) as count FROM workers');
    
//     if (eventCount[0].count === 0 || workerCount[0].count === 0) {
//       console.log('🌱 No data found, auto-seeding database...');
//       const { seedEvents } = require('./seed');
//       await seedEvents();
//       console.log('✅ Database seeded with 1000+ sample events for 6 workers & 6 stations');
//     } else {
//       console.log(`📊 Database ready: ${eventCount[0].count} events, ${workerCount[0].count} workers`);
//     }
//   } catch (error) {
//     console.error('⚠️ Auto-seed check failed:', error.message);
//   }
  
//   console.log('✅ Database fully initialized');
// };

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('👋 Shutting down gracefully...');
//   await db.close();
//   process.exit(0);
// });

// initializeDb().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📱 Dashboard: http://localhost:3000`);
//     console.log(`🔧 API Docs: http://localhost:3001/health`);
//   });
// });

// module.exports = app;


// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const db = require('./database');

// const eventsRouter = require('./routes/events');
// const metricsRouter = require('./routes/metrics');

// const app = express();
// const PORT = process.env.PORT || 3001;

// /* ===============================
//    MIDDLEWARE
// =================================*/
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// /* ===============================
//    ROUTES
// =================================*/

// // Events (AI ingestion)
// app.use('/api/events', eventsRouter);

// // Metrics (Analytics)
// app.use('/api/metrics', metricsRouter);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     timestamp: new Date().toISOString()
//   });
// });

// /* ===============================
//    SEED ENDPOINT
// =================================*/
// app.post('/api/seed', async (req, res) => {
//   try {
//     const { seedEvents } = require('./seed');
//     await seedEvents();
//     res.json({ message: 'Database seeded successfully' });
//   } catch (error) {
//     console.error('Seed error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ===============================
//    DATABASE INITIALIZATION
// =================================*/
// const initializeDb = async () => {
//   await db.initialize();

//   try {
//     const eventCount = await db.query(
//       'SELECT COUNT(*) as count FROM events'
//     );
//     const workerCount = await db.query(
//       'SELECT COUNT(*) as count FROM workers'
//     );

//     if (
//       eventCount[0].count === 0 ||
//       workerCount[0].count === 0
//     ) {
//       console.log('🌱 No data found, auto-seeding database...');
//       const { seedEvents } = require('./seed');
//       await seedEvents();
//       console.log(
//         '✅ Database seeded with 1000+ sample events for 6 workers & 6 stations'
//       );
//     } else {
//       console.log(
//         `📊 Database ready: ${eventCount[0].count} events, ${workerCount[0].count} workers`
//       );
//     }
//   } catch (error) {
//     console.error('⚠️ Auto-seed check failed:', error.message);
//   }

//   console.log('✅ Database fully initialized');
// };

// /* ===============================
//    GRACEFUL SHUTDOWN
// =================================*/
// process.on('SIGINT', async () => {
//   console.log('👋 Shutting down gracefully...');
//   await db.close();
//   process.exit(0);
// });

// /* ===============================
//    START SERVER
// =================================*/
// initializeDb().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📱 Dashboard: http://localhost:3000`);
//     console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
//     console.log(`📊 Factory Metrics: http://localhost:${PORT}/api/metrics/factory`);
//   });
// });

// module.exports = app;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const eventsRouter = require('./routes/events');
const metricsRouter = require('./routes/metrics');

const app = express();
const PORT = process.env.PORT || 3001;

/* ===============================
   MIDDLEWARE
=================================*/
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ===============================
   ROOT ROUTE
=================================*/
app.get('/', (req, res) => {
  res.json({
    message: '🚀 AI Productivity Dashboard Backend Running',
    health: '/health',
    metrics: '/api/metrics/factory'
  });
});

/* ===============================
   ROUTES
=================================*/

// Events (AI ingestion)
app.use('/api/events', eventsRouter);

// Metrics (Analytics)
app.use('/api/metrics', metricsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   SEED ENDPOINT
=================================*/
app.post('/api/seed', async (req, res) => {
  try {
    const { seedEvents } = require('./seed');
    await seedEvents();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   DATABASE INITIALIZATION
=================================*/
const initializeDb = async () => {
  try {
    await db.initialize();

    const eventCount = await db.query(
      'SELECT COUNT(*) as count FROM events'
    );
    const workerCount = await db.query(
      'SELECT COUNT(*) as count FROM workers'
    );

    if (
      eventCount[0].count === 0 ||
      workerCount[0].count === 0
    ) {
      console.log('🌱 No data found, auto-seeding database...');
      const { seedEvents } = require('./seed');
      await seedEvents();
      console.log(
        '✅ Database seeded with sample events'
      );
    } else {
      console.log(
        `📊 Database ready: ${eventCount[0].count} events, ${workerCount[0].count} workers`
      );
    }

    console.log('✅ Database fully initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

/* ===============================
   GRACEFUL SHUTDOWN
=================================*/
process.on('SIGINT', async () => {
  console.log('👋 Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

/* ===============================
   START SERVER
=================================*/
initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔧 Health Check: /health`);
    console.log(`📊 Factory Metrics: /api/metrics/factory`);
  });
});

module.exports = app;