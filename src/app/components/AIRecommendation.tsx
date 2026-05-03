import { BrainCircuit } from 'lucide-react';
import type { FarmField } from '../types';

interface AIRecommendationProps {
  fields: FarmField[];
}

export function AIRecommendation({ fields }: AIRecommendationProps) {
  const plannedWater = fields.reduce((total, field) => total + field.recommendation.liters, 0);
  const waterSaved = fields
    .filter(field => field.recommendation.status !== 'scheduled')
    .reduce((total, field) => total + field.recommendation.liters, 0);

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-950 mb-2 tracking-tight md:text-4xl">AI Recommendation Engine</h1>
        <p className="text-base text-slate-600 md:text-lg">Climate-aware irrigation scheduling powered by field telemetry</p>
      </div>

      <div className="rounded-lg bg-slate-900 p-6 mb-8 shadow-lg md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
            <BrainCircuit className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="text-white text-2xl mb-2 tracking-tight">Plan Generated</div>
            <div className="text-slate-300 text-base">
              Analyzed forecast, soil moisture, pressure safety, and flow capacity. Current plan schedules{' '}
              {plannedWater.toLocaleString()} L and protects {waterSaved.toLocaleString()} L from unnecessary or unsafe use.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 mb-8 xl:grid-cols-3">
        {fields.map(field => (
          <RecommendationCard key={field.id} field={field} />
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-lg text-slate-950">7-Day Irrigation Plan</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                {['Field', 'Region', 'Crop', 'Action', 'Time', 'Water', 'Liters', 'Status', 'Reason'].map(header => (
                  <th key={header} className="px-5 py-3 text-left text-xs text-slate-600">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fields.map(field => (
                <tr key={field.id}>
                  <td className="px-5 py-4 text-sm text-slate-950">{field.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.region}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.crop}</td>
                  <td className="px-5 py-4 text-sm text-slate-950">{field.recommendation.action}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.recommendation.time ?? '-'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.recommendation.waterMm} mm</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.recommendation.liters.toLocaleString()} L</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={field.recommendation.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.recommendation.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ field }: { field: FarmField }) {
  const priorityColors: Record<FarmField['recommendation']['priority'], string> = {
    High: 'bg-red-600 text-white',
    Medium: 'bg-amber-500 text-white',
    Low: 'bg-slate-500 text-white',
  };

  const statusColors: Record<FarmField['recommendation']['status'], string> = {
    scheduled: 'border-l-emerald-500',
    skipped: 'border-l-slate-400',
    blocked: 'border-l-red-500',
  };

  return (
    <div className={`rounded-lg border border-slate-200 border-l-4 bg-white p-6 shadow-sm transition hover:shadow-md ${statusColors[field.recommendation.status]}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-2xl text-slate-950 mb-1 tracking-tight">{field.name}</div>
          <div className="text-sm text-slate-600">{field.crop} ({field.region}, {field.areaHa} ha)</div>
        </div>
        <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${priorityColors[field.recommendation.priority]}`}>
          {field.recommendation.priority}
        </div>
      </div>

      <div className="mb-5 rounded-lg bg-slate-50 p-4">
        <div className="text-2xl text-slate-950 mb-1 tracking-tight">{field.recommendation.action}</div>
        <div className="text-sm text-slate-600">{field.recommendation.time ?? 'No valve action scheduled'}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
        <CardMetric label="Water Depth" value={`${field.recommendation.waterMm} mm`} />
        <CardMetric label="Total Volume" value={`${field.recommendation.liters.toLocaleString()} L`} />
      </div>

      <div>
        <div className="text-xs text-slate-600 mb-2">AI Reasoning</div>
        <div className="text-sm text-slate-700">{field.recommendation.reason}</div>
      </div>
    </div>
  );
}

function CardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className="text-sm text-slate-950">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: FarmField['recommendation']['status'] }) {
  const colors = {
    scheduled: 'bg-emerald-50 text-emerald-700',
    skipped: 'bg-slate-100 text-slate-700',
    blocked: 'bg-red-50 text-red-700',
  };

  return <span className={`px-2 py-1 rounded-md text-xs capitalize ${colors[status]}`}>{status}</span>;
}
