import { AlertTriangle, ArrowRight, CloudRain, Cpu, Droplets, Gauge, Play, Radio, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { ExecutionLogEntry, FarmExecutionState, FarmField, OperationEvent, ValveOverrideResult, ValveTestResult } from '../types';

interface ActionEngineProps {
  fields: FarmField[];
  execution: FarmExecutionState;
  onExecute: () => void;
  onReset: () => void;
  onValveTest: (fieldId: string) => Promise<ValveTestResult | null>;
  onValveOverride: (fieldId: string, action: 'open' | 'close') => Promise<ValveOverrideResult | null>;
  onLoadOperations: () => Promise<OperationEvent[]>;
}

export function ActionEngine({ fields, execution, onExecute, onReset, onValveTest, onValveOverride, onLoadOperations }: ActionEngineProps) {
  const [localProgress, setLocalProgress] = useState(execution.progress);
  const [valveMessage, setValveMessage] = useState<string | null>(null);
  const [valveResults, setValveResults] = useState<Record<string, ValveTestResult['status'] | 'offline'>>({});
  const [testingFieldId, setTestingFieldId] = useState<string | null>(null);
  const [overridingFieldId, setOverridingFieldId] = useState<string | null>(null);
  const [operationEvents, setOperationEvents] = useState<OperationEvent[]>([]);

  useEffect(() => {
    setLocalProgress(execution.progress);
  }, [execution.progress, execution.started]);

  useEffect(() => {
    refreshOperations();
  }, []);

  useEffect(() => {
    if (!execution.started || localProgress >= 100) {
      return;
    }

    const interval = window.setInterval(() => {
      setLocalProgress(previous => Math.min(previous + 2, 100));
    }, 100);

    return () => window.clearInterval(interval);
  }, [execution.started, localProgress]);

  const isExecuting = execution.started;
  const log = execution.log.length ? execution.log : buildLocalLog(localProgress);

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-950 mb-2 tracking-tight md:text-4xl">Action Engine</h1>
        <p className="text-base text-slate-600 md:text-lg">Real-time valve control and flow monitoring at pipe level</p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 mb-8 shadow-lg md:p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2">
            <Zap className="w-5 h-5 text-amber-300" />
            <span className="text-white font-medium">From Prediction to Pipe-Level Action</span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
          <FlowNode icon={CloudRain} title="Climate Data" subtitle="Weather & Forecast" color="from-blue-500 to-cyan-500" />
          <FlowArrow />
          <FlowNode icon={Cpu} title="AI Engine" subtitle="Smart Analysis" color="from-violet-500 to-fuchsia-500" highlight />
          <FlowArrow />
          <FlowNode icon={Radio} title="Controller" subtitle="Command Center" color="from-indigo-500 to-blue-500" />
          <FlowArrow />
          <FlowNode icon={Gauge} title="Smart Valves" subtitle="Pipe Network" color="from-emerald-500 to-green-500" />
          <FlowArrow />
          <FlowNode icon={Droplets} title="Irrigation" subtitle="Field Delivery" color="from-cyan-500 to-blue-500" />
        </div>
      </div>

      {!isExecuting && (
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onExecute}
              className="flex items-center gap-3 rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Play className="w-5 h-5" />
              Execute Full AI Plan
              <span className="rounded-md bg-white/20 px-2 py-1 text-xs">{fields.length} Fields</span>
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Reset Execution State
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Opens safe valves, skips rain-covered fields, and blocks unsafe pressure zones.
          </p>
        </div>
      )}

      {isExecuting && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg text-slate-950 font-medium mb-1">
                {localProgress >= 100 ? 'Plan Execution Complete' : 'Plan Execution In Progress'}
              </div>
              <div className="text-sm text-slate-600">Monitoring valve states and flow meters across all fields</div>
            </div>
          </div>
        </div>
      )}

      {valveMessage && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {valveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 mb-8 xl:grid-cols-3">
        {fields.map(field => (
          <ValveCard
            key={field.id}
            field={field}
            progress={field.id === 'field-a' && isExecuting ? localProgress : 0}
            isTesting={testingFieldId === field.id}
            isOverriding={overridingFieldId === field.id}
            testResult={valveResults[field.id]}
            onValveTest={handleValveTest}
            onValveOverride={handleValveOverride}
          />
        ))}
      </div>

      <OperationsPanel events={operationEvents} onRefresh={refreshOperations} />

      {isExecuting && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="text-xl text-slate-950 tracking-tight">Live Execution Log</div>
            <div className="text-sm text-slate-600 mt-1">Events from controller and field sensors</div>
          </div>
          <div className="p-5 space-y-3 bg-slate-950 font-mono text-sm">
            {log.map(entry => (
              <LogEntry key={`${entry.time}-${entry.event}`} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  async function handleValveTest(fieldId: string) {
    setTestingFieldId(fieldId);
    setValveMessage(null);

    try {
      const result = await onValveTest(fieldId);
      setValveResults(previous => ({
        ...previous,
        [fieldId]: result?.status ?? 'offline',
      }));
      setValveMessage(result?.message ?? 'Valve test unavailable while the backend is offline.');
      refreshOperations();
    } catch {
      setValveResults(previous => ({
        ...previous,
        [fieldId]: 'offline',
      }));
      setValveMessage('Valve test failed safely. The page is still usable; check that the backend is running.');
    } finally {
      setTestingFieldId(null);
    }
  }

  async function handleValveOverride(fieldId: string, action: 'open' | 'close') {
    setOverridingFieldId(fieldId);
    setValveMessage(null);

    try {
      const result = await onValveOverride(fieldId, action);
      setValveMessage(result?.message ?? 'Manual override unavailable while the backend is offline.');
      if (result?.events) {
        setOperationEvents(result.events);
      } else {
        refreshOperations();
      }
    } catch {
      setValveMessage('Manual override failed safely. Check that the backend is running.');
    } finally {
      setOverridingFieldId(null);
    }
  }

  async function refreshOperations() {
    const events = await onLoadOperations();
    setOperationEvents(events);
  }
}

function FlowNode({
  icon: Icon,
  title,
  subtitle,
  color,
  highlight = false,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center text-center ${highlight ? 'lg:scale-105' : ''}`}>
      <div className={`rounded-lg bg-gradient-to-br ${color} p-5 shadow-lg ${highlight ? 'ring-4 ring-white/20' : ''}`}>
        <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
      </div>
      <div className="w-32 text-white font-medium text-sm mt-3">{title}</div>
      <div className="w-32 text-slate-400 text-xs mt-1">{subtitle}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden h-20 items-center justify-center lg:flex">
      <ArrowRight className="w-7 h-7 text-white/40" strokeWidth={3} />
    </div>
  );
}

function ValveCard({
  field,
  progress,
  isTesting,
  isOverriding,
  testResult,
  onValveTest,
  onValveOverride,
}: {
  field: FarmField;
  progress: number;
  isTesting: boolean;
  isOverriding: boolean;
  testResult?: ValveTestResult['status'] | 'offline';
  onValveTest: (fieldId: string) => void;
  onValveOverride: (fieldId: string, action: 'open' | 'close') => void;
}) {
  const targetLiters = field.recommendation.liters;
  const currentLiters = field.execution.status === 'skipped' || field.execution.status === 'blocked'
    ? 0
    : (progress / 100) * targetLiters;
  const pressureOk = field.sensor.pressure >= field.minPressure;
  const status = resolveValveStatus(field, progress);
  const config = valveConfig[status] ?? valveConfig.ready;
  const isActive = status === 'running' || status === 'completed';

  return (
    <div className={`flex h-full min-h-[640px] flex-col rounded-lg border-2 p-5 bg-gradient-to-br ${config.bg} ${config.border} shadow-sm`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-xl text-slate-950 mb-1 tracking-tight">{field.name}</div>
          <div className="text-sm text-slate-600">{field.crop} ({field.region})</div>
        </div>
        <div className={`px-3 py-1.5 rounded-md text-sm font-medium ${config.text} bg-white/80 shadow-sm`}>
          {config.label}
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-white/70 bg-white/60 p-5">
        <div className="text-sm text-slate-700 mb-4 font-medium">Pipe Valve Status</div>
        <div className="flex items-center justify-center">
          <div className={`w-28 h-28 rounded-full ${config.valveColor} ${isActive ? 'ring-4 ring-emerald-300' : ''} flex items-center justify-center shadow-lg`}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40">
              <ValveIcon status={status} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-white/70 bg-white/60 p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-600 mb-1">Pipe Pressure</div>
            <div className={`text-2xl font-bold ${pressureOk ? 'text-emerald-600' : 'text-red-600'}`}>{field.sensor.pressure} bar</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 mb-1">Minimum Safe</div>
            <div className="text-lg text-slate-700">{field.minPressure} bar</div>
          </div>
        </div>
        {!pressureOk && (
          <div className="mt-3 pt-3 border-t border-red-200 text-sm text-red-700 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pressure below safe threshold
          </div>
        )}
      </div>

      {targetLiters > 0 && (
        <div className="rounded-lg border border-white/70 bg-white/60 p-4">
          <div className="text-xs text-slate-600 mb-3">Flow Meter</div>
          <div className="text-2xl text-slate-950 mb-2 font-bold tracking-tight">{Math.round(currentLiters).toLocaleString()} L</div>
          <div className="text-sm text-slate-600 mb-3">Target: {targetLiters.toLocaleString()} L</div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className="h-3 bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="text-xs text-slate-600 mt-2 text-right">{Math.round(progress)}%</div>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-white/70">
        <div className="text-sm text-slate-700 font-medium">{field.execution.notes}</div>
      </div>

      <div className="mt-auto pt-5">
        <button
          onClick={() => onValveTest(field.id)}
          disabled={isTesting}
          className="w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isTesting ? 'Testing Valve...' : 'Run Valve Test'}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onValveOverride(field.id, 'open')}
            disabled={isOverriding}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Manual Open
          </button>
          <button
            onClick={() => onValveOverride(field.id, 'close')}
            disabled={isOverriding}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Manual Close
          </button>
        </div>

        <div className="mt-3 min-h-[38px]">
          {testResult && (
            <div className={`rounded-md px-3 py-2 text-sm font-medium ${
              testResult === 'passed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : testResult === 'blocked'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              Valve test: {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OperationsPanel({ events, onRefresh }: { events: OperationEvent[]; onRefresh: () => void }) {
  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <div className="text-lg text-slate-950">Operations Log</div>
          <div className="text-sm text-slate-500">Backend events from simulations, valve tests, overrides, and reports.</div>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {events.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">No operations recorded yet. Try a valve test or manual override.</div>
        ) : (
          events.map(event => (
            <div key={event.id} className="grid grid-cols-[110px_1fr] gap-4 px-5 py-3 text-sm">
              <div className={`font-medium ${event.status === 'success' ? 'text-emerald-700' : event.status === 'warning' ? 'text-amber-700' : event.status === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
                {event.type}
              </div>
              <div>
                <div className="text-slate-800">{event.message}</div>
                <div className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ValveIcon({ status }: { status: ReturnType<typeof resolveValveStatus> }) {
  if (status === 'blocked') {
    return (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="white" opacity="0.9" />
        <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (status === 'running' || status === 'completed') {
    return (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="white" opacity="0.9" />
        <path d="M12 8V16M8 12H16" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="white" opacity="0.5" />
      <circle cx="12" cy="12" r="3" fill="#94a3b8" />
    </svg>
  );
}

function resolveValveStatus(field: FarmField, progress: number) {
  if (field.execution.status === 'skipped' || field.execution.status === 'blocked') {
    return field.execution.status;
  }
  if (progress >= 100) {
    return 'completed';
  }
  if (progress > 0) {
    return 'running';
  }
  return field.execution.status;
}

const valveConfig = {
  ready: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-700',
    label: 'Ready',
    valveColor: 'bg-blue-500',
  },
  running: {
    bg: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    label: 'Running',
    valveColor: 'bg-emerald-500 animate-pulse',
  },
  completed: {
    bg: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    label: 'Completed',
    valveColor: 'bg-emerald-600',
  },
  skipped: {
    bg: 'from-slate-50 to-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-700',
    label: 'Skipped',
    valveColor: 'bg-slate-400',
  },
  blocked: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    text: 'text-red-700',
    label: 'Blocked',
    valveColor: 'bg-red-500',
  },
};

function LogEntry({ entry }: { entry: ExecutionLogEntry }) {
  const statusConfig = {
    success: { color: 'text-emerald-400', icon: '●' },
    error: { color: 'text-red-400', icon: '●' },
    info: { color: 'text-blue-400', icon: '●' },
  };
  const config = statusConfig[entry.status];

  return (
    <div className="flex items-start gap-4">
      <span className="text-slate-500">[{entry.time}]</span>
      <span className={config.color}>{config.icon}</span>
      <span className="text-slate-300 flex-1">{entry.event}</span>
    </div>
  );
}

function buildLocalLog(progress: number): ExecutionLogEntry[] {
  const log: ExecutionLogEntry[] = [
    { time: '06:00:00.000', event: 'AI irrigation plan loaded into controller', status: 'info' },
    { time: '06:00:01.234', event: 'Field A: valve opening command sent', status: 'success' },
    { time: '06:00:02.345', event: 'Field C: blocked - pressure below safe threshold', status: 'error' },
  ];

  if (progress >= 100) {
    log.push({ time: '06:28:18.234', event: 'Execution complete: 1 completed, 1 skipped, 1 blocked', status: 'info' });
  }

  return log;
}
