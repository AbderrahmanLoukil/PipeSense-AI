export type HeatwaveRisk = 'Low' | 'Medium' | 'High';
export type RecommendationStatus = 'scheduled' | 'skipped' | 'blocked';
export type RecommendationPriority = 'Low' | 'Medium' | 'High';
export type ExecutionFieldStatus = 'ready' | 'running' | 'completed' | 'skipped' | 'blocked';
export type ExecutionStatus = 'idle' | 'running' | 'completed';
export type LogStatus = 'info' | 'success' | 'error';
export type SimulationScenario = 'heatwave' | 'rain' | 'lowPressure' | 'reset';

export interface FarmMeta {
  name: string;
  region: string;
  lastUpdated: string;
}

export interface FieldSensor {
  soilMoisture: number;
  rainProbability: number;
  rainForecast: number;
  heatwave: HeatwaveRisk;
  et: number;
  pressure: number;
  flow: number;
}

export interface FieldRecommendation {
  priority: RecommendationPriority;
  action: string;
  time: string | null;
  waterMm: number;
  liters: number;
  reason: string;
  status: RecommendationStatus;
}

export interface FieldExecution {
  status: ExecutionFieldStatus;
  currentLiters: number;
  duration: string | null;
  notes: string;
}

export interface FarmField {
  id: string;
  name: string;
  crop: string;
  region: string;
  areaHa: number;
  targetMoisture: number;
  minPressure: number;
  sensor: FieldSensor;
  recommendation: FieldRecommendation;
  execution: FieldExecution;
}

export interface ExecutionLogEntry {
  time: string;
  event: string;
  status: LogStatus;
}

export interface FarmExecutionState {
  started: boolean;
  progress: number;
  status: ExecutionStatus;
  log: ExecutionLogEntry[];
}

export interface FarmState {
  farm: FarmMeta;
  fields: FarmField[];
  execution: FarmExecutionState;
}

export interface ReportExportResult {
  status: 'ready';
  filename: string;
  report: {
    id: string;
    generatedAt: string;
    summary: {
      completed: number;
      skipped: number;
      blocked: number;
      delivered: number;
      planned: number;
      protectedWater: number;
      executionStatus: ExecutionStatus;
    };
  };
}

export interface FarmerNotificationResult {
  id: string;
  channel: 'sms';
  recipient: string;
  status: 'queued';
  message: string;
}

export interface NextPlanField {
  field: string;
  action: 'irrigate' | 'skip' | 'blocked';
  waterMm: number;
  liters: number;
  reason: string;
}

export interface NextPlanDay {
  date: string;
  fields: NextPlanField[];
}

export interface SensorAdjustment {
  soilMoistureDelta?: number;
  pressureDelta?: number;
  rainProbabilityDelta?: number;
}

export interface ValveTestResult {
  fieldId: string;
  field: string;
  status: 'passed' | 'blocked';
  message: string;
  checkedAt: string;
  state: FarmState;
}

export interface FieldDiagnosticResult {
  fieldId: string;
  field: string;
  status: 'healthy' | 'attention';
  recommendation: string;
  issues: string[];
  message: string;
  checkedAt: string;
}

export interface OperationEvent {
  id: string;
  type: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  createdAt: string;
}

export interface ValveOverrideResult {
  status: 'accepted' | 'blocked';
  message: string;
  state: FarmState;
  events: OperationEvent[];
}

export interface BackendHealth {
  status: 'ok';
  uptimeSeconds: number;
  fields: number;
  blockedFields: number;
  runningExecution: boolean;
  checkedAt: string;
}
