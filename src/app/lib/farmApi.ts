import { fallbackFarmState } from '../data/fallbackFarmState';
import type {
  FarmerNotificationResult,
  FieldDiagnosticResult,
  FarmField,
  FarmState,
  NextPlanDay,
  OperationEvent,
  ReportExportResult,
  SensorAdjustment,
  SimulationScenario,
  ValveOverrideResult,
  ValveTestResult,
} from '../types';

const headers = { 'Content-Type': 'application/json' };

export async function getFarmState(): Promise<FarmState> {
  const response = await fetch('/api/farm');
  if (!response.ok) {
    throw new Error('Unable to load farm state');
  }

  return response.json();
}

export async function runSimulation(scenario: SimulationScenario): Promise<FarmState> {
  const response = await fetch('/api/simulations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ scenario }),
  });

  if (!response.ok) {
    throw new Error('Unable to run simulation');
  }

  return response.json();
}

export async function startExecution(): Promise<FarmState> {
  const response = await fetch('/api/execution/start', {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to start execution');
  }

  return response.json();
}

export async function resetExecution(): Promise<FarmState> {
  const response = await fetch('/api/execution/reset', {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to reset execution');
  }

  return response.json();
}

export async function adjustFieldSensor(fieldId: string, adjustment: SensorAdjustment): Promise<FarmState> {
  const response = await fetch(`/api/fields/${fieldId}/sensor`, {
    method: 'POST',
    headers,
    body: JSON.stringify(adjustment),
  });

  if (!response.ok) {
    throw new Error('Unable to adjust field sensor');
  }

  return response.json();
}

export async function testValve(fieldId: string): Promise<ValveTestResult> {
  const response = await fetch(`/api/valves/${fieldId}/test`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to test valve');
  }

  return response.json();
}

export async function overrideValve(fieldId: string, action: 'open' | 'close'): Promise<ValveOverrideResult> {
  const response = await fetch(`/api/valves/${fieldId}/override`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error('Unable to override valve');
  }

  return response.json();
}

export async function getOperations(): Promise<OperationEvent[]> {
  const response = await fetch('/api/operations');

  if (!response.ok) {
    throw new Error('Unable to load operations log');
  }

  const data: { events: OperationEvent[] } = await response.json();
  return data.events;
}

export async function runFieldDiagnostic(fieldId: string): Promise<FieldDiagnosticResult> {
  const response = await fetch(`/api/fields/${fieldId}/diagnostic`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to run field diagnostic');
  }

  return response.json();
}

export async function recalculateRecommendations(): Promise<FarmState> {
  const response = await fetch('/api/recommendations/recalculate', {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to recalculate recommendations');
  }

  return response.json();
}

export async function exportReport(): Promise<ReportExportResult> {
  const response = await fetch('/api/report/export', {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to export report');
  }

  return response.json();
}

export async function sendFarmerNotification(): Promise<FarmerNotificationResult> {
  const response = await fetch('/api/notifications/farmer', {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Unable to send farmer notification');
  }

  return response.json();
}

export async function getNextPlan(): Promise<NextPlanDay[]> {
  const response = await fetch('/api/plans/next');

  if (!response.ok) {
    throw new Error('Unable to load next plan');
  }

  const data: { days: NextPlanDay[] } = await response.json();
  return data.days;
}

export function withLocalSimulation(state: FarmState, scenario: SimulationScenario): FarmState {
  if (scenario === 'reset') {
    return structuredClone(fallbackFarmState);
  }

  const patches: Record<Exclude<SimulationScenario, 'reset'>, Record<string, Partial<FarmField['sensor']>>> = {
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

  return {
    ...state,
    fields: state.fields.map(field => ({
      ...field,
      sensor: {
        ...field.sensor,
        ...patches[scenario][field.id],
      },
    })),
  };
}
