import { AlertTriangle, Droplet, Gauge, Power, Thermometer, TrendingDown } from 'lucide-react';
import type { ComponentType } from 'react';
import type { FarmField } from '../types';

interface FarmDashboardProps {
  fields: FarmField[];
  onGeneratePlan: () => void;
}

type MetricColor = 'blue' | 'green' | 'gray' | 'orange' | 'red';

export function FarmDashboard({ fields, onGeneratePlan }: FarmDashboardProps) {
  const plannedWater = fields.reduce((total, field) => total + field.recommendation.liters, 0);
  const skippedWater = fields
    .filter(field => field.recommendation.status !== 'scheduled')
    .reduce((total, field) => total + field.recommendation.liters, 0);
  const activeValves = fields.filter(field => field.execution.status === 'running').length;
  const fieldsRequiringAction = fields.filter(field => field.recommendation.status !== 'skipped').length;
  const pressureAlerts = fields.filter(field => field.sensor.pressure < field.minPressure).length;
  const climateRisk = fields.some(field => field.sensor.heatwave === 'High') ? 'High' : 'Moderate';

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-950 mb-2 tracking-tight md:text-4xl">Farm Overview</h1>
        <p className="text-base text-slate-600 md:text-lg">Real-time monitoring and AI-powered irrigation control</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Droplet} label="Total Planned Water" value={`${plannedWater.toLocaleString()} L`} color="blue" />
        <MetricCard icon={TrendingDown} label="Estimated Water Saved" value={`${skippedWater.toLocaleString()} L`} color="green" />
        <MetricCard icon={Power} label="Active Valves" value={`${activeValves}/${fields.length}`} color="gray" />
        <MetricCard icon={AlertTriangle} label="Fields Requiring Action" value={String(fieldsRequiringAction)} color="orange" />
        <MetricCard icon={Gauge} label="Pressure Alerts" value={String(pressureAlerts)} color={pressureAlerts ? 'red' : 'green'} />
        <MetricCard icon={Thermometer} label="Climate Risk" value={climateRisk} color={climateRisk === 'High' ? 'red' : 'orange'} />
      </div>

      <div className="grid grid-cols-1 gap-5 mb-8 xl:grid-cols-3">
        {fields.map(field => (
          <FieldCard key={field.id} field={field} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <button
          onClick={onGeneratePlan}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-emerald-700"
        >
          Generate AI Irrigation Plan
        </button>
        <div className="text-sm text-slate-500">
          AI analyzes climate, sensors, forecast, pressure, and flow to build the irrigation schedule.
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: MetricColor;
}) {
  const colorClasses: Record<MetricColor, string> = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    gray: 'bg-slate-500',
    orange: 'bg-amber-500',
    red: 'bg-red-600',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`w-11 h-11 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{label}</div>
      <div className="text-2xl text-slate-950 tracking-tight">{value}</div>
    </div>
  );
}

function FieldCard({ field }: { field: FarmField }) {
  const statusColors: Record<FarmField['recommendation']['status'], string> = {
    scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    skipped: 'bg-slate-50 text-slate-700 border-slate-200',
    blocked: 'bg-red-50 text-red-700 border-red-200',
  };

  const heatwaveColors: Record<FarmField['sensor']['heatwave'], string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-emerald-100 text-emerald-700',
  };

  const priorityColors: Record<FarmField['recommendation']['priority'], string> = {
    High: 'border-l-red-500',
    Medium: 'border-l-amber-500',
    Low: 'border-l-slate-400',
  };

  const moisturePercentage = (field.sensor.soilMoisture / field.targetMoisture) * 100;
  const pressureOk = field.sensor.pressure >= field.minPressure;

  return (
    <div className={`rounded-lg border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition hover:shadow-md ${priorityColors[field.recommendation.priority]}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-xl text-slate-950 mb-1 tracking-tight">{field.name}</div>
          <div className="text-sm text-slate-600">
            {field.crop} / {field.region} / {field.areaHa} ha
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-md text-xs border font-medium ${statusColors[field.recommendation.status]}`}>
          {field.recommendation.status}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Soil Moisture</span>
          <span className="text-slate-950">{field.sensor.soilMoisture}% / {field.targetMoisture}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${field.sensor.soilMoisture < field.targetMoisture * 0.7 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(moisturePercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <FieldMetric label="Rain Probability" value={`${field.sensor.rainProbability}%`} />
        <div>
          <div className="text-xs text-slate-600 mb-1">Heatwave Risk</div>
          <div className={`text-xs px-2 py-1 rounded-md inline-block ${heatwaveColors[field.sensor.heatwave]}`}>
            {field.sensor.heatwave}
          </div>
        </div>
        <FieldMetric
          label="Pressure"
          value={`${field.sensor.pressure} bar${pressureOk ? '' : ' alert'}`}
          tone={pressureOk ? 'success' : 'danger'}
        />
        <FieldMetric label="Valve Status" value={field.execution.status} />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-700">{field.recommendation.action}: {field.recommendation.reason}</div>
      </div>
    </div>
  );
}

function FieldMetric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'danger' }) {
  const toneClass = tone === 'success' ? 'text-emerald-600' : tone === 'danger' ? 'text-red-600' : 'text-slate-950';

  return (
    <div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className={`text-sm capitalize ${toneClass}`}>{value}</div>
    </div>
  );
}
