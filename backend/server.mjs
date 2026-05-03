import { createServer } from 'node:http';
import { cloneFarmState } from './farm-data.mjs';

const port = Number(process.env.PORT || 8787);
let farmState = cloneFarmState();
let executionStartedAt = null;
let operationLog = [];

function recordEvent(type, message, status = 'info') {
  const event = {
    id: `evt-${Date.now()}-${operationLog.length}`,
    type,
    status,
    message,
    createdAt: new Date().toISOString(),
  };

  operationLog = [event, ...operationLog].slice(0, 30);
  return event;
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
    req.on('error', reject);
  });
}

function getExecutionProgress() {
  if (!executionStartedAt) {
    return 0;
  }

  return Math.min(Math.round(((Date.now() - executionStartedAt) / 5000) * 100), 100);
}

function withRuntimeState() {
  const progress = getExecutionProgress();
  const executionStatus = !executionStartedAt ? 'idle' : progress >= 100 ? 'completed' : 'running';

  return {
    ...farmState,
    fields: farmState.fields.map(field => ({
      ...field,
      execution: resolveFieldExecution(field, progress, executionStatus),
    })),
    execution: {
      started: Boolean(executionStartedAt),
      progress,
      status: executionStatus,
      log: buildExecutionLog(progress),
    },
  };
}

function resolveFieldExecution(field, progress, executionStatus) {
  if (field.recommendation.status === 'skipped') {
    return {
      ...field.execution,
      status: 'skipped',
      currentLiters: 0,
      notes: field.recommendation.reason,
    };
  }

  if (field.recommendation.status === 'blocked') {
    return {
      ...field.execution,
      status: 'blocked',
      currentLiters: 0,
      notes: field.recommendation.reason,
    };
  }

  if (executionStatus === 'completed') {
    return {
      ...field.execution,
      status: 'completed',
      currentLiters: field.recommendation.liters,
      duration: '28 min 15 sec',
      notes: 'Valve closed automatically after target volume was delivered',
    };
  }

  if (executionStatus === 'running') {
    return {
      ...field.execution,
      status: 'running',
      currentLiters: Math.round((progress / 100) * field.recommendation.liters),
      notes: 'Valve is open and flow meter is reporting delivery',
    };
  }

  return field.execution;
}

function buildExecutionLog(progress) {
  if (!executionStartedAt) {
    return [];
  }

  const log = [
    { time: '06:00:00.000', event: 'AI irrigation plan loaded into controller', status: 'info' },
    { time: '06:00:01.234', event: 'Field A: valve opening command sent', status: 'success' },
    { time: '06:00:01.456', event: 'Field A: flow sensor activated - 180 L/min detected', status: 'success' },
    { time: '06:00:02.100', event: 'Field B: irrigation skipped - rain forecast 70% (9 mm expected)', status: 'info' },
    { time: '06:00:02.345', event: 'Field C: blocked - pressure 1.3 bar below safe threshold', status: 'error' },
  ];

  if (progress > 20) {
    log.push({ time: '06:05:30.120', event: 'Field A: 100,000 L delivered (20% complete)', status: 'success' });
  }
  if (progress > 50) {
    log.push({ time: '06:14:15.890', event: 'Field A: 250,000 L delivered (50% complete)', status: 'success' });
  }
  if (progress >= 100) {
    log.push(
      { time: '06:28:15.567', event: 'Field A: target reached - 500,000 L delivered', status: 'success' },
      { time: '06:28:16.123', event: 'Field A: valve closing command sent', status: 'success' },
      { time: '06:28:18.234', event: 'Execution complete: 1 completed, 1 skipped, 1 blocked', status: 'info' },
    );
  }

  return log;
}

function applySimulation(scenario) {
  const patches = {
    heatwave: {
      'field-a': { heatwave: 'High', et: 9.5, soilMoisture: 18 },
      'field-b': { heatwave: 'High', et: 7.8, soilMoisture: 28 },
      'field-c': { heatwave: 'High', et: 8.2, soilMoisture: 20 },
    },
    rain: {
      'field-a': { rainProbability: 85, rainForecast: 12, soilMoisture: 28 },
      'field-b': { rainProbability: 90, rainForecast: 15, soilMoisture: 38 },
      'field-c': { rainProbability: 80, rainForecast: 10, soilMoisture: 32 },
    },
    lowPressure: {
      'field-a': { pressure: 1.5 },
      'field-b': { pressure: 1.4 },
      'field-c': { pressure: 1.1 },
    },
  };

  if (scenario === 'reset') {
    farmState = cloneFarmState();
    executionStartedAt = null;
    recordEvent('simulation', 'Demo data reset to baseline.', 'info');
    return;
  }

  const selectedPatch = patches[scenario];
  if (!selectedPatch) {
    throw new Error(`Unknown simulation: ${scenario}`);
  }

  farmState.fields = farmState.fields.map(field => {
    const updatedField = {
      ...field,
      sensor: {
        ...field.sensor,
        ...selectedPatch[field.id],
      },
    };

    return applyRecommendation(updatedField);
  });
  recordEvent('simulation', `Applied ${scenario} simulation and recalculated recommendations.`, 'success');
}

function findField(fieldId) {
  const field = farmState.fields.find(candidate => candidate.id === fieldId);

  if (!field) {
    throw new Error(`Unknown field: ${fieldId}`);
  }

  return field;
}

function updateField(fieldId, updater) {
  findField(fieldId);
  farmState.fields = farmState.fields.map(field => (field.id === fieldId ? updater(field) : field));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function adjustFieldSensor(fieldId, changes) {
  const field = findField(fieldId);
  updateField(fieldId, field => {
    const updatedField = {
      ...field,
      sensor: {
        ...field.sensor,
        soilMoisture: clamp(field.sensor.soilMoisture + Number(changes.soilMoistureDelta || 0), 0, 60),
        pressure: Number((field.sensor.pressure + Number(changes.pressureDelta || 0)).toFixed(1)),
        rainProbability: clamp(field.sensor.rainProbability + Number(changes.rainProbabilityDelta || 0), 0, 100),
      },
    };

    return applyRecommendation(updatedField);
  });
  recordEvent('sensor', `${field.name} sensor values adjusted and recommendation recalculated.`, 'success');
}

function resetExecution() {
  executionStartedAt = null;
  farmState.fields = farmState.fields.map(field => applyRecommendation({
    ...field,
    execution: {
      status: 'ready',
      currentLiters: 0,
      duration: null,
      notes: 'Ready for automatic valve execution',
    },
  }));
  recordEvent('execution', 'Execution state reset.', 'info');
}

function recalculatePlan() {
  farmState.fields = farmState.fields.map(field => applyRecommendation(field));
  recordEvent('recommendation', 'Recommendations recalculated from current sensor state.', 'success');
  return withRuntimeState();
}

function testValve(fieldId) {
  const field = findField(fieldId);
  const safe = field.recommendation.status === 'scheduled' && field.sensor.pressure >= field.minPressure;
  const message = safe
    ? `${field.name} valve test passed. Pressure and flow are within range.`
    : `${field.name} valve test blocked. ${field.recommendation.reason}`;
  recordEvent('valve-test', message, safe ? 'success' : 'warning');

  return {
    fieldId,
    field: field.name,
    status: safe ? 'passed' : 'blocked',
    message,
    checkedAt: new Date().toISOString(),
    state: withRuntimeState(),
  };
}

function overrideValve(fieldId, action) {
  const field = findField(fieldId);
  const safe = field.recommendation.status === 'scheduled' && field.sensor.pressure >= field.minPressure;

  if (action !== 'open' && action !== 'close') {
    throw new Error(`Unknown valve action: ${action}`);
  }

  if (action === 'open' && !safe) {
    const message = `${field.name} manual open blocked. ${field.recommendation.reason}`;
    recordEvent('manual-override', message, 'warning');
    return {
      status: 'blocked',
      message,
      state: withRuntimeState(),
      events: operationLog,
    };
  }

  updateField(fieldId, current => ({
    ...current,
    execution: {
      ...current.execution,
      status: action === 'open' ? 'running' : 'ready',
      currentLiters: action === 'open' ? current.execution.currentLiters : 0,
      duration: null,
      notes: action === 'open' ? 'Manual valve override opened for inspection' : 'Manual valve override closed',
    },
  }));

  const message = `${field.name} manual valve ${action} command accepted.`;
  recordEvent('manual-override', message, 'success');

  return {
    status: 'accepted',
    message,
    state: withRuntimeState(),
    events: operationLog,
  };
}

function runFieldDiagnostic(fieldId) {
  const field = findField(fieldId);
  const pressureOk = field.sensor.pressure >= field.minPressure;
  const moistureDeficit = Math.max(field.targetMoisture - field.sensor.soilMoisture, 0);
  const rainRisk = field.sensor.rainProbability >= 70 || field.sensor.rainForecast >= 8;
  const issues = [];

  if (!pressureOk) {
    issues.push(`Pressure is ${field.sensor.pressure} bar; minimum safe is ${field.minPressure} bar.`);
  }
  if (moistureDeficit > 0) {
    issues.push(`Moisture deficit is ${moistureDeficit}%.`);
  }
  if (rainRisk) {
    issues.push(`Rain forecast can cover demand: ${field.sensor.rainProbability}% / ${field.sensor.rainForecast} mm.`);
  }

  return {
    fieldId,
    field: field.name,
    status: issues.length ? 'attention' : 'healthy',
    recommendation: field.recommendation.action,
    issues,
    message: issues.length
      ? `${field.name} needs attention: ${issues.join(' ')}`
      : `${field.name} is healthy. Pressure, moisture, and forecast are within expected range.`,
    checkedAt: new Date().toISOString(),
  };
}

function getHealth() {
  const state = withRuntimeState();

  return {
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    fields: state.fields.length,
    blockedFields: state.fields.filter(field => field.recommendation.status === 'blocked').length,
    runningExecution: state.execution.status === 'running',
    checkedAt: new Date().toISOString(),
  };
}

function applyRecommendation(field) {
  const pressureUnsafe = field.sensor.pressure < field.minPressure;
  const rainExpected = field.sensor.rainProbability >= 70 || field.sensor.rainForecast >= 8;
  const moistureDeficit = Math.max(field.targetMoisture - field.sensor.soilMoisture, 0);
  const waterMm = Math.ceil(moistureDeficit * 2);
  const liters = waterMm * field.areaHa * 10000;

  if (pressureUnsafe) {
    return {
      ...field,
      recommendation: {
        priority: 'Medium',
        action: 'Execution Blocked',
        time: null,
        waterMm,
        liters,
        reason: `Pressure ${field.sensor.pressure} bar is below the safe ${field.minPressure} bar threshold.`,
        status: 'blocked',
      },
      execution: {
        status: 'blocked',
        currentLiters: 0,
        duration: null,
        notes: 'Pressure service required before irrigation',
      },
    };
  }

  if (rainExpected) {
    return {
      ...field,
      recommendation: {
        priority: 'Low',
        action: 'Skip Irrigation',
        time: null,
        waterMm: 0,
        liters: 0,
        reason: `Rain is likely (${field.sensor.rainProbability}%, ${field.sensor.rainForecast} mm forecast).`,
        status: 'skipped',
      },
      execution: {
        status: 'skipped',
        currentLiters: 0,
        duration: null,
        notes: 'Rain forecast covers irrigation demand',
      },
    };
  }

  if (moistureDeficit <= 0) {
    return {
      ...field,
      recommendation: {
        priority: 'Low',
        action: 'Skip Irrigation',
        time: null,
        waterMm: 0,
        liters: 0,
        reason: 'Soil moisture is already at or above target.',
        status: 'skipped',
      },
      execution: {
        status: 'skipped',
        currentLiters: 0,
        duration: null,
        notes: 'Moisture target already satisfied',
      },
    };
  }

  return {
    ...field,
    recommendation: {
      priority: field.sensor.heatwave === 'High' ? 'High' : 'Medium',
      action: 'Irrigate Tomorrow',
      time: 'Tomorrow 06:00',
      waterMm,
      liters,
      reason: `Moisture deficit is ${moistureDeficit}% with ${field.sensor.heatwave.toLowerCase()} heatwave risk.`,
      status: 'scheduled',
    },
    execution: {
      status: 'ready',
      currentLiters: 0,
      duration: null,
      notes: 'Ready for automatic valve execution',
    },
  };
}

function buildReport() {
  const state = withRuntimeState();
  const completed = state.fields.filter(field => field.execution.status === 'completed').length;
  const skipped = state.fields.filter(field => field.execution.status === 'skipped').length;
  const blocked = state.fields.filter(field => field.execution.status === 'blocked').length;
  const delivered = state.fields.reduce((total, field) => total + field.execution.currentLiters, 0);
  const planned = state.fields.reduce((total, field) => total + field.recommendation.liters, 0);
  const protectedWater = state.fields
    .filter(field => field.recommendation.status !== 'scheduled')
    .reduce((total, field) => total + field.recommendation.liters, 0);

  return {
    id: `PS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-001`,
    generatedAt: new Date().toISOString(),
    farm: state.farm,
    summary: {
      completed,
      skipped,
      blocked,
      delivered,
      planned,
      protectedWater,
      executionStatus: state.execution.status,
    },
    fields: state.fields.map(field => ({
      field: field.name,
      crop: field.crop,
      region: field.region,
      status: field.execution.status,
      waterDelivered: field.execution.currentLiters,
      targetWater: field.recommendation.liters,
      notes: field.execution.notes,
    })),
  };
}

function buildFarmerNotification() {
  const report = buildReport();
  const blockedFields = report.fields.filter(field => field.status === 'blocked').map(field => field.field);

  return {
    id: `MSG-${Date.now()}`,
    channel: 'sms',
    recipient: '+216 00 000 000',
    status: 'queued',
    message: [
      `PipeSense update for ${report.farm.name}: ${report.summary.delivered.toLocaleString()} L delivered.`,
      `${report.summary.skipped} field(s) skipped and ${report.summary.blocked} blocked.`,
      blockedFields.length ? `Maintenance needed: ${blockedFields.join(', ')}.` : 'No pressure maintenance alerts.',
    ].join(' '),
  };
}

function buildNextPlan() {
  const state = withRuntimeState();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);

    return {
      date: date.toISOString().slice(0, 10),
      fields: state.fields.map(field => {
        const heatMultiplier = field.sensor.heatwave === 'High' ? 1.15 : field.sensor.heatwave === 'Medium' ? 1.05 : 0.9;
        const rainReduction = field.sensor.rainProbability > 60 ? 0 : 1;
        const dayFactor = index % 2 === 0 ? 1 : 0.65;
        const waterMm = field.recommendation.status === 'blocked'
          ? 0
          : Math.round(field.recommendation.waterMm * heatMultiplier * rainReduction * dayFactor);

        return {
          field: field.name,
          action: waterMm > 0 ? 'irrigate' : field.recommendation.status === 'blocked' ? 'blocked' : 'skip',
          waterMm,
          liters: waterMm * field.areaHa * 10000,
          reason: waterMm > 0 ? 'Scheduled from current moisture and climate trend' : field.recommendation.reason,
        };
      }),
    };
  });
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/farm') {
      sendJson(res, 200, withRuntimeState());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/simulations') {
      const { scenario } = await readBody(req);
      applySimulation(scenario);
      sendJson(res, 200, withRuntimeState());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/execution/start') {
      executionStartedAt = Date.now();
      recordEvent('execution', 'Full AI plan execution started.', 'success');
      sendJson(res, 200, withRuntimeState());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/execution/reset') {
      resetExecution();
      sendJson(res, 200, withRuntimeState());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/recommendations/recalculate') {
      sendJson(res, 200, recalculatePlan());
      return;
    }

    const fieldSensorMatch = url.pathname.match(/^\/api\/fields\/([^/]+)\/sensor$/);
    if (req.method === 'POST' && fieldSensorMatch) {
      adjustFieldSensor(fieldSensorMatch[1], await readBody(req));
      sendJson(res, 200, withRuntimeState());
      return;
    }

    const valveTestMatch = url.pathname.match(/^\/api\/valves\/([^/]+)\/test$/);
    if (req.method === 'POST' && valveTestMatch) {
      sendJson(res, 200, testValve(valveTestMatch[1]));
      return;
    }

    const valveOverrideMatch = url.pathname.match(/^\/api\/valves\/([^/]+)\/override$/);
    if (req.method === 'POST' && valveOverrideMatch) {
      const { action } = await readBody(req);
      sendJson(res, 200, overrideValve(valveOverrideMatch[1], action));
      return;
    }

    const diagnosticMatch = url.pathname.match(/^\/api\/fields\/([^/]+)\/diagnostic$/);
    if (req.method === 'POST' && diagnosticMatch) {
      sendJson(res, 200, runFieldDiagnostic(diagnosticMatch[1]));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/report') {
      sendJson(res, 200, buildReport());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/report/export') {
      recordEvent('report', 'Execution report export generated.', 'success');
      sendJson(res, 200, {
        status: 'ready',
        filename: `pipesense-report-${new Date().toISOString().slice(0, 10)}.json`,
        report: buildReport(),
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/notifications/farmer') {
      recordEvent('notification', 'Farmer notification queued.', 'success');
      sendJson(res, 202, buildFarmerNotification());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/plans/next') {
      sendJson(res, 200, { days: buildNextPlan() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/operations') {
      sendJson(res, 200, { events: operationLog });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, getHealth());
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`PipeSense API listening on http://localhost:${port}`);
});
