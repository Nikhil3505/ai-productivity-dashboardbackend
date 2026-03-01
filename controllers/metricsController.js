const db = require('../database');

/* ===============================
   WORKER METRICS
=================================*/
async function getWorkerMetrics() {
  const workers = await db.query('SELECT * FROM workers');
  const metricsArray = [];

  for (const worker of workers) {
    const events = await db.query(
      `SELECT * FROM events 
       WHERE worker_id = ? 
       ORDER BY datetime(timestamp)`,
      [worker.worker_id]
    );

    const workerMetrics = computeWorkerMetrics(events);

    workerMetrics.worker_id = worker.worker_id;
    workerMetrics.name = worker.name;

    metricsArray.push(workerMetrics);
  }

  return metricsArray.sort(
    (a, b) => Number(b.utilization) - Number(a.utilization)
  );
}

/* ===============================
   WORKSTATION METRICS
=================================*/
async function getWorkstationMetrics() {
  const stations = await db.query('SELECT * FROM workstations');
  const metricsArray = [];

  for (const station of stations) {
    const events = await db.query(
      `SELECT * FROM events 
       WHERE workstation_id = ? 
       ORDER BY datetime(timestamp)`,
      [station.station_id]
    );

    const stationMetrics = computeWorkstationMetrics(events);

    stationMetrics.station_id = station.station_id;
    stationMetrics.name = station.name;

    metricsArray.push(stationMetrics);
  }

  return metricsArray;
}

/* ===============================
   FACTORY METRICS
=================================*/
async function getFactoryMetrics() {
  const workerMetrics = await getWorkerMetrics();
  const workstationMetrics = await getWorkstationMetrics();

  const totalEvents = await db.query('SELECT COUNT(*) as count FROM events');
  const firstEvent = await db.query('SELECT MIN(datetime(timestamp)) as first FROM events');
  const lastEvent = await db.query('SELECT MAX(datetime(timestamp)) as last FROM events');

  if (!firstEvent[0].first || !lastEvent[0].last) {
    return emptyFactoryMetrics();
  }

  const totalProduction = workerMetrics.reduce(
    (sum, w) => sum + Number(w.total_units),
    0
  );

  const avgWorkerUtil =
    workerMetrics.length > 0
      ? workerMetrics.reduce((sum, w) => sum + Number(w.utilization), 0) /
        workerMetrics.length
      : 0;

  const avgStationUtil =
    workstationMetrics.length > 0
      ? workstationMetrics.reduce((sum, s) => sum + Number(s.utilization), 0) /
        workstationMetrics.length
      : 0;

  const periodHours =
    (new Date(lastEvent[0].last) - new Date(firstEvent[0].first)) /
    (1000 * 60 * 60);

  const safePeriod = periodHours > 0 ? periodHours : 1;

  return {
    total_productive_time: periodHours.toFixed(1),
    total_production_count: totalProduction,
    average_production_rate: (totalProduction / safePeriod).toFixed(1),
    average_worker_utilization: avgWorkerUtil.toFixed(1) + '%',
    average_workstation_utilization: avgStationUtil.toFixed(1) + '%',
    total_events: totalEvents[0].count,
    period_hours: periodHours.toFixed(1)
  };
}

function emptyFactoryMetrics() {
  return {
    total_productive_time: 0,
    total_production_count: 0,
    average_production_rate: 0,
    average_worker_utilization: '0%',
    average_workstation_utilization: '0%',
    total_events: 0,
    period_hours: 0
  };
}

/* ===============================
   COMPUTE WORKER METRICS
=================================*/
function computeWorkerMetrics(events) {
  if (!events || events.length < 2) {
    return {
      total_active_time: 0,
      total_idle_time: 0,
      utilization: 0,
      total_units: 0,
      units_per_hour: 0
    };
  }

  let totalActiveTime = 0;
  let totalIdleTime = 0;
  let totalUnits = 0;

  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const current = events[i];

    const prevTime = new Date(prev.timestamp).getTime();
    const currentTime = new Date(current.timestamp).getTime();

    const duration = (currentTime - prevTime) / 1000 / 60; // minutes

    // ✅ Accept BOTH working and production
    if (
      (prev.event_type === 'working' ||
        prev.event_type === 'production') &&
      prev.confidence > 0.8
    ) {
      totalActiveTime += duration;
      totalUnits += prev.count || 0;
    } else {
      totalIdleTime += duration;
    }
  }

  const totalTime = totalActiveTime + totalIdleTime;

  const utilization =
    totalTime > 0 ? (totalActiveTime / totalTime) * 100 : 0;

  const unitsPerHour =
    totalTime > 0 ? totalUnits / (totalTime / 60) : 0;

  return {
    total_active_time: totalActiveTime.toFixed(1),
    total_idle_time: totalIdleTime.toFixed(1),
    utilization: Number(utilization.toFixed(1)),
    total_units: totalUnits,
    units_per_hour: unitsPerHour.toFixed(1)
  };
}

/* ===============================
   COMPUTE WORKSTATION METRICS
=================================*/
function computeWorkstationMetrics(events) {
  if (!events || events.length < 2) {
    return {
      occupancy_time: 0,
      utilization: 0,
      total_units: 0,
      throughput_rate: 0
    };
  }

  let occupancyTime = 0;
  let totalUnits = 0;

  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const current = events[i];

    const prevTime = new Date(prev.timestamp).getTime();
    const currentTime = new Date(current.timestamp).getTime();

    const duration = (currentTime - prevTime) / 1000 / 60;

    if (
      prev.event_type === 'working' ||
      prev.event_type === 'production'
    ) {
      occupancyTime += duration;
      totalUnits += prev.count || 0;
    }
  }

  const totalTime =
    (new Date(events[events.length - 1].timestamp) -
      new Date(events[0].timestamp)) /
    1000 /
    60;

  const utilization =
    totalTime > 0 ? (occupancyTime / totalTime) * 100 : 0;

  const throughputRate =
    totalTime > 0 ? totalUnits / (totalTime / 60) : 0;

  return {
    occupancy_time: occupancyTime.toFixed(1),
    utilization: Number(utilization.toFixed(1)),
    total_units: totalUnits,
    throughput_rate: throughputRate.toFixed(1)
  };
}

module.exports = {
  getWorkerMetrics,
  getWorkstationMetrics,
  getFactoryMetrics
};