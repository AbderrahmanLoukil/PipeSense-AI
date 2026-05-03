import { ArrowRight, CloudRain, Cpu, Gauge, Radio, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { ComponentType } from 'react';
import type { FarmField, FieldDiagnosticResult, SensorAdjustment, SimulationScenario } from '../types';

interface ClimateAndSensorsProps {
  fields: FarmField[];
  onSimulate: (scenario: SimulationScenario) => void;
  onAdjustSensor: (fieldId: string, adjustment: SensorAdjustment) => void;
  onRecalculate: () => void;
  onRunDiagnostic: (fieldId: string) => Promise<FieldDiagnosticResult | null>;
}

export function ClimateAndSensors({
  fields,
  onSimulate,
  onAdjustSensor,
  onRecalculate,
  onRunDiagnostic,
}: ClimateAndSensorsProps) {
  const [diagnosticMessage, setDiagnosticMessage] = useState<string | null>(null);
  const [diagnosticFieldId, setDiagnosticFieldId] = useState<string | null>(null);

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-950 mb-2 tracking-tight md:text-4xl">Climate & Sensors</h1>
        <p className="text-base text-slate-600 md:text-lg">Real-time environmental data and IoT sensor network</p>
      </div>

      <div className="sticky top-0 z-10 mb-8 rounded-lg border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-lg text-slate-950 tracking-tight">Demo Simulation Controls</div>
            <div className="text-sm text-slate-500">Always visible controls that update backend sensor state and recommendations.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <SimulationButton onClick={() => onSimulate('heatwave')} tone="danger">
              Simulate Heatwave
            </SimulationButton>
            <SimulationButton onClick={() => onSimulate('rain')} tone="info">
              Simulate Rain Event
            </SimulationButton>
            <SimulationButton onClick={() => onSimulate('lowPressure')} tone="warning">
              Simulate Low Pressure
            </SimulationButton>
            <button
              onClick={onRecalculate}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              Recalculate Plan
            </button>
            <button
              onClick={() => onSimulate('reset')}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {diagnosticMessage && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {diagnosticMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 mb-8 shadow-lg md:p-8">
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <FlowNode icon={CloudRain} title="Weather Data" subtitle="API Integration" color="from-blue-500 to-cyan-500" />
          <FlowArrow />
          <FlowNode icon={Radio} title="IoT Sensors" subtitle="Field Network" color="from-emerald-500 to-green-500" />
          <FlowArrow />
          <FlowNode icon={Cpu} title="AI Engine" subtitle="Decision Making" color="from-violet-500 to-fuchsia-500" highlight />
          <FlowArrow />
          <FlowNode icon={Gauge} title="Smart Valves" subtitle="Pipe Control" color="from-amber-500 to-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 mb-8 xl:grid-cols-3">
        {fields.map(field => (
          <SensorCard
            key={field.id}
            field={field}
            onAdjustSensor={onAdjustSensor}
            onRunDiagnostic={handleDiagnostic}
            isDiagnosing={diagnosticFieldId === field.id}
          />
        ))}
      </div>
    </div>
  );

  async function handleDiagnostic(fieldId: string) {
    setDiagnosticFieldId(fieldId);
    setDiagnosticMessage(null);

    try {
      const result = await onRunDiagnostic(fieldId);
      setDiagnosticMessage(result?.message ?? 'Diagnostic unavailable while the backend is offline.');
    } finally {
      setDiagnosticFieldId(null);
    }
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
    <div className="flex flex-col items-center text-center">
      <div className={`w-32 h-32 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg md:w-36 md:h-36 ${highlight ? 'ring-4 ring-white/20' : ''}`}>
        <Icon className="w-14 h-14 text-white md:w-16 md:h-16" strokeWidth={1.5} />
      </div>
      <div className="w-36 text-sm text-white font-medium">{title}</div>
      <div className="w-36 text-xs text-slate-400 mt-1">{subtitle}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden h-36 items-center justify-center md:flex">
      <ArrowRight className="w-8 h-8 text-white/40" strokeWidth={3} />
    </div>
  );
}

function SensorCard({
  field,
  onAdjustSensor,
  onRunDiagnostic,
  isDiagnosing,
}: {
  field: FarmField;
  onAdjustSensor: (fieldId: string, adjustment: SensorAdjustment) => void;
  onRunDiagnostic: (fieldId: string) => void;
  isDiagnosing: boolean;
}) {
  const pressureOk = field.sensor.pressure >= field.minPressure;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="text-lg text-slate-950 mb-4 tracking-tight">
        {field.name} - {field.crop} ({field.region})
      </div>
      <div className="space-y-3">
        <SensorRow label="Soil Moisture" value={`${field.sensor.soilMoisture}%`} target={`Target: ${field.targetMoisture}%`} />
        <SensorRow label="Rain Probability" value={`${field.sensor.rainProbability}%`} target={`Forecast: ${field.sensor.rainForecast} mm`} />
        <SensorRow label="Heatwave Risk" value={field.sensor.heatwave} target={`ET: ${field.sensor.et} mm/day`} />
        <SensorRow
          label="Pressure"
          value={`${field.sensor.pressure} bar`}
          target={`Min: ${field.minPressure} bar`}
          status={pressureOk ? 'ok' : 'warning'}
        />
        <SensorRow label="Flow Rate" value={`${field.sensor.flow} L/min`} target="Target flow" />
      </div>

      {!pressureOk && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          Pressure alert: below safe operating threshold. Irrigation remains blocked.
        </div>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">Quick Sensor Actions</div>
        <div className="grid grid-cols-2 gap-2">
          <SmallActionButton onClick={() => onAdjustSensor(field.id, { soilMoistureDelta: 3 })}>
            + Moisture
          </SmallActionButton>
          <SmallActionButton onClick={() => onAdjustSensor(field.id, { soilMoistureDelta: -3 })}>
            - Moisture
          </SmallActionButton>
          <SmallActionButton onClick={() => onAdjustSensor(field.id, { pressureDelta: 0.2 })}>
            + Pressure
          </SmallActionButton>
          <SmallActionButton onClick={() => onAdjustSensor(field.id, { pressureDelta: -0.2 })}>
            - Pressure
          </SmallActionButton>
        </div>
        <button
          onClick={() => onRunDiagnostic(field.id)}
          className="mt-3 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
        >
          {isDiagnosing ? 'Running Diagnostic...' : 'Run Field Diagnostic'}
        </button>
      </div>
    </div>
  );
}

function SensorRow({
  label,
  value,
  target,
  status = 'ok',
}: {
  label: string;
  value: string;
  target: string;
  status?: 'ok' | 'warning';
}) {
  return (
    <div className="flex justify-between gap-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-right">
        <div className={`text-sm ${status === 'warning' ? 'text-red-600' : 'text-slate-950'}`}>{value}</div>
        <div className="text-xs text-slate-500">{target}</div>
      </div>
    </div>
  );
}

function SimulationButton({
  children,
  onClick,
  tone,
}: {
  children: string;
  onClick: () => void;
  tone: 'danger' | 'info' | 'warning';
}) {
  const colors = {
    danger: 'bg-red-600 hover:bg-red-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
  };

  return (
    <button onClick={onClick} className={`rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm transition ${colors[tone]}`}>
      {children}
    </button>
  );
}

function SmallActionButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
