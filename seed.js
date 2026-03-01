const db = require('./database');

const seedEvents = async () => {
  console.log('🌱 Seeding database...');

  // Insert workers
  await db.run(`
    INSERT OR IGNORE INTO workers (worker_id, name) VALUES
    ('W1', 'John Doe'),
    ('W2', 'Jane Smith'),
    ('W3', 'Mike Johnson'),
    ('W4', 'Sarah Wilson'),
    ('W5', 'David Brown'),
    ('W6', 'Emily Davis')
  `);

  // Insert workstations
  await db.run(`
    INSERT OR IGNORE INTO workstations (station_id, name) VALUES
    ('S1', 'Assembly Line 1'),
    ('S2', 'Assembly Line 2'),
    ('S3', 'Quality Control'),
    ('S4', 'Packaging'),
    ('S5', 'Testing Station'),
    ('S6', 'Final Inspection')
  `);

  // ✅ FIXED: Start 8 hours ago instead of now
  let baseTime = new Date(Date.now() - 8 * 60 * 60 * 1000);

  for (let i = 0; i < 1000; i++) {

    // Move forward 1–5 minutes each event
    baseTime = new Date(
      baseTime.getTime() + (Math.floor(Math.random() * 5) + 1) * 60000
    );

    await db.run(
      `
      INSERT INTO events (
        timestamp,
        worker_id,
        workstation_id,
        event_type,
        confidence,
        count,
        processed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        // SQLite compatible timestamp format
        baseTime.toISOString().replace('T', ' ').replace('Z', ''),
        `W${(i % 6) + 1}`,
        `S${(i % 6) + 1}`,
        Math.random() > 0.3 ? 'working' : 'idle',
        0.95,
        Math.floor(Math.random() * 5) + 1,
        0
      ]
    );
  }

  console.log('✅ Seeding complete with 1000 realistic past-to-present events');
};

module.exports = { seedEvents };