// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');
// const fs = require('fs');

// class Database {
//   constructor() {
//     this.db = null;
//     this.initSql = `
//       CREATE TABLE IF NOT EXISTS workers (
//         worker_id TEXT PRIMARY KEY,
//         name TEXT NOT NULL
//       );

//       CREATE TABLE IF NOT EXISTS workstations (
//         station_id TEXT PRIMARY KEY,
//         name TEXT NOT NULL
//       );

//       CREATE TABLE IF NOT EXISTS events (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         timestamp DATETIME NOT NULL,
//         worker_id TEXT NOT NULL,
//         workstation_id TEXT NOT NULL,
//         event_type TEXT NOT NULL,
//         confidence REAL NOT NULL,
//         count INTEGER DEFAULT 1,
//         processed BOOLEAN DEFAULT FALSE,
//         FOREIGN KEY(worker_id) REFERENCES workers(worker_id),
//         FOREIGN KEY(workstation_id) REFERENCES workstations(station_id)
//       );

//       CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
//       CREATE INDEX IF NOT EXISTS idx_events_worker ON events(worker_id);
//       CREATE INDEX IF NOT EXISTS idx_events_station ON events(workstation_id);
//     `;
//   }

//   async initialize() {
//     return new Promise((resolve, reject) => {
//       // ✅ FIXED: Correct Docker volume path
//       const dbPath = process.env.SQLITE_DB_PATH || 
//         (process.env.NODE_ENV === 'production' 
//           ? '/app/backend/data/productivity.db'  // ← MATCHES DOCKER VOLUME
//           : './data/productivity.db');
      
//       // ✅ FIXED: Ensure directory exists with proper permissions
//       const dbDir = process.env.NODE_ENV === 'production' ? '/app/backend/data' : './data';
//       if (!fs.existsSync(dbDir)) {
//         fs.mkdirSync(dbDir, { recursive: true });
//         fs.chmodSync(dbDir, 0o777);
//         console.log(`📁 Created database directory: ${dbDir}`);
//       }

//       console.log(`🗄️  Connecting to SQLite: ${dbPath}`);
      
//       this.db = new sqlite3.Database(dbPath, (err) => {
//         if (err) {
//           console.error('❌ SQLite connection failed:', err.message);
//           return reject(err);
//         }
        
//         console.log('✅ SQLite connected successfully');
        
//         this.db.exec(this.initSql, (err) => {
//           if (err) {
//             console.error('❌ Table creation failed:', err.message);
//             return reject(err);
//           }
//           console.log('✅ Database tables created/initialized');
//           resolve();
//         });
//       });
//     });
//   }

//   async getDb() {
//     return this.db;
//   }

//   async close() {
//     return new Promise((resolve) => {
//       if (this.db) {
//         this.db.close((err) => {
//           if (err) console.error('Close error:', err);
//           resolve();
//         });
//       } else {
//         resolve();
//       }
//     });
//   }

//   async query(sql, params = []) {
//     return new Promise((resolve, reject) => {
//       this.db.all(sql, params, (err, rows) => {
//         if (err) reject(err);
//         else resolve(rows);
//       });
//     });
//   }

//   async run(sql, params = []) {
//     return new Promise((resolve, reject) => {
//       this.db.run(sql, params, function(err) {
//         if (err) reject(err);
//         else resolve({ id: this.lastID });
//       });
//     });
//   }
// }

// module.exports = new Database();


const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;

    this.initSql = `
      CREATE TABLE IF NOT EXISTS workers (
        worker_id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workstations (
        station_id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME NOT NULL,
        worker_id TEXT NOT NULL,
        workstation_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        confidence REAL NOT NULL,
        count INTEGER DEFAULT 1,
        processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(worker_id) REFERENCES workers(worker_id),
        FOREIGN KEY(workstation_id) REFERENCES workstations(station_id)
      );

      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_worker ON events(worker_id);
      CREATE INDEX IF NOT EXISTS idx_events_station ON events(workstation_id);
    `;
  }

  async initialize() {
    return new Promise((resolve, reject) => {

      // ✅ Render-safe & local-safe database path
      const dbDir = path.join(__dirname, 'data');
      const dbPath = path.join(dbDir, 'productivity.db');

      // Ensure directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Created database directory: ${dbDir}`);
      }

      console.log(`🗄️ Connecting to SQLite: ${dbPath}`);

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ SQLite connection failed:', err.message);
          return reject(err);
        }

        console.log('✅ SQLite connected successfully');

        this.db.exec(this.initSql, (err) => {
          if (err) {
            console.error('❌ Table creation failed:', err.message);
            return reject(err);
          }

          console.log('✅ Database tables created/initialized');
          resolve();
        });
      });
    });
  }

  async getDb() {
    return this.db;
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) console.error('Close error:', err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }
}

module.exports = new Database();