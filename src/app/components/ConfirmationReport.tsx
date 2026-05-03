import { AlertCircle, Calendar, CheckCircle2, FileDown, Lightbulb, Send, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { ComponentType } from 'react';
import { exportReport, getNextPlan, sendFarmerNotification } from '../lib/farmApi';
import type { FarmerNotificationResult, FarmExecutionState, FarmField, NextPlanDay, ReportExportResult } from '../types';

interface ConfirmationReportProps {
  fields: FarmField[];
  execution: FarmExecutionState;
}

type SummaryColor = 'green' | 'gray' | 'red' | 'blue';

export function ConfirmationReport({ fields, execution }: ConfirmationReportProps) {
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<string | null>(null);
  const [nextPlan, setNextPlan] = useState<NextPlanDay[]>([]);
  const executionComplete = execution.status === 'completed' || execution.progress >= 100;
  const completed = executionComplete ? fields.filter(field => field.recommendation.status === 'scheduled').length : 0;
  const skipped = fields.filter(field => field.execution.status === 'skipped').length;
  const blocked = fields.filter(field => field.execution.status === 'blocked').length;
  const delivered = fields
    .filter(field => field.recommendation.status === 'scheduled')
    .reduce((total, field) => total + (executionComplete ? field.recommendation.liters : 0), 0);
  const protectedWater = fields
    .filter(field => field.recommendation.status !== 'scheduled')
    .reduce((total, field) => total + field.recommendation.liters, 0);
  const pressureAlerts = fields.filter(field => field.sensor.pressure < field.minPressure).length;

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-950 mb-2 tracking-tight md:text-4xl">Execution Report</h1>
        <p className="text-base text-slate-600 md:text-lg">Irrigation cycle summary with water savings analysis</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CheckCircle2} label="Completed" value={String(completed)} color="green" />
        <SummaryCard icon={XCircle} label="Skipped" value={String(skipped)} color="gray" />
        <SummaryCard icon={AlertCircle} label="Blocked" value={String(blocked)} color="red" />
        <SummaryCard icon={CheckCircle2} label="Water Delivered" value={`${delivered.toLocaleString()} L`} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-5 mb-8 lg:grid-cols-2">
        <ImpactPanel
          label="Water Protected"
          value={`${protectedWater.toLocaleString()} L`}
          body="Saved by skipping unnecessary irrigation and preventing unsafe execution."
          tone="green"
        />
        <ImpactPanel
          label="Pressure Alerts"
          value={String(pressureAlerts)}
          body="Fields with pressure below the safe operating threshold."
          tone="orange"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm mb-8">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-lg text-slate-950">Execution Results</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50">
              <tr>
                {['Field', 'Crop', 'Status', 'Water Delivered', 'Duration', 'Notes'].map(header => (
                  <th key={header} className="px-5 py-3 text-left text-xs text-slate-600">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fields.map(field => (
                <tr key={field.id}>
                  <td className="px-5 py-4 text-sm text-slate-950">{field.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.crop} ({field.region})</td>
                  <td className="px-5 py-4">
                    <ExecutionBadge status={field.execution.status} completed={executionComplete && field.recommendation.status === 'scheduled'} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-950">
                    {executionComplete && field.recommendation.status === 'scheduled' ? `${field.recommendation.liters.toLocaleString()} L` : '0 L'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.execution.duration ?? (executionComplete && field.id === 'field-a' ? '28 min 15 sec' : '-')}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{field.execution.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-slate-900 p-6 mb-8 shadow-lg md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center border border-white/15">
            <Lightbulb className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-2xl text-white mb-3 tracking-tight">AI Water Optimization Impact</div>
            <div className="text-base text-slate-300 leading-relaxed">
              PipeSense coordinates climate prediction, field telemetry, pressure safety, and valve control in one loop.
              The current cycle delivers water where needed, skips rain-covered irrigation, and blocks unsafe pressure zones.
            </div>
            <div className="mt-5 pt-5 border-t border-white/10 text-slate-300 text-sm">
              <strong className="text-white">Key innovation:</strong> climate prediction to AI analysis to pipe-level valve control to measurable water savings.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ReportButton
          icon={FileDown}
          label={isBusy === 'export' ? 'Exporting...' : 'Export Report'}
          color="green"
          onClick={() => runAction('export', handleExportReport)}
        />
        <ReportButton
          icon={Send}
          label={isBusy === 'send' ? 'Sending...' : 'Send to Farmer'}
          color="blue"
          onClick={() => runAction('send', handleSendFarmer)}
        />
        <ReportButton
          icon={Calendar}
          label={isBusy === 'plan' ? 'Loading...' : 'View Next 7-Day Plan'}
          color="purple"
          onClick={() => runAction('plan', handleNextPlan)}
        />
      </div>

      {actionResult && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionResult}
        </div>
      )}

      {nextPlan.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="text-lg text-slate-950">Next 7-Day Plan</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50">
                <tr>
                  {['Date', 'Field', 'Action', 'Water', 'Liters', 'Reason'].map(header => (
                    <th key={header} className="px-5 py-3 text-left text-xs text-slate-600">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {nextPlan.flatMap(day =>
                  day.fields.map(field => (
                    <tr key={`${day.date}-${field.field}`}>
                      <td className="px-5 py-4 text-sm text-slate-950">{day.date}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{field.field}</td>
                      <td className="px-5 py-4 text-sm text-slate-950 capitalize">{field.action}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{field.waterMm} mm</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{field.liters.toLocaleString()} L</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{field.reason}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  async function runAction(name: string, action: () => Promise<void>) {
    setIsBusy(name);
    setActionResult(null);

    try {
      await action();
    } catch {
      setActionResult('That action is unavailable while the backend is offline.');
    } finally {
      setIsBusy(null);
    }
  }

  async function handleExportReport() {
    const result: ReportExportResult = await exportReport();
    setActionResult(`Report ${result.report.id} is ready as ${result.filename}.`);
  }

  async function handleSendFarmer() {
    const result: FarmerNotificationResult = await sendFarmerNotification();
    setActionResult(`Farmer update queued by ${result.channel.toUpperCase()}: ${result.message}`);
  }

  async function handleNextPlan() {
    const plan = await getNextPlan();
    setNextPlan(plan);
    setActionResult(`Loaded ${plan.length} days of projected irrigation actions.`);
  }
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: SummaryColor;
}) {
  const colorClasses: Record<SummaryColor, string> = {
    green: 'bg-emerald-600',
    gray: 'bg-slate-500',
    red: 'bg-red-600',
    blue: 'bg-blue-600',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`w-11 h-11 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-xs text-slate-500 mb-1 tracking-wide uppercase">{label}</div>
      <div className="text-2xl text-slate-950 tracking-tight">{value}</div>
    </div>
  );
}

function ImpactPanel({ label, value, body, tone }: { label: string; value: string; body: string; tone: 'green' | 'orange' }) {
  const colors = tone === 'green' ? 'bg-emerald-600' : 'bg-amber-600';

  return (
    <div className={`rounded-lg p-6 shadow-sm ${colors}`}>
      <div className="text-white/80 mb-2 tracking-wide uppercase text-sm">{label}</div>
      <div className="text-4xl text-white mb-3 tracking-tight">{value}</div>
      <div className="text-white/90">{body}</div>
    </div>
  );
}

function ExecutionBadge({ status, completed }: { status: FarmField['execution']['status']; completed: boolean }) {
  const effectiveStatus = completed ? 'completed' : status;
  const config = {
    ready: { icon: AlertCircle, className: 'bg-blue-50 text-blue-700', label: 'Ready' },
    running: { icon: AlertCircle, className: 'bg-emerald-50 text-emerald-700', label: 'Running' },
    completed: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700', label: 'Completed' },
    skipped: { icon: XCircle, className: 'bg-slate-100 text-slate-700', label: 'Skipped' },
    blocked: { icon: AlertCircle, className: 'bg-red-50 text-red-700', label: 'Blocked' },
  };
  const selected = config[effectiveStatus];
  const Icon = selected.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${selected.className}`}>
      <Icon className="w-3 h-3" />
      {selected.label}
    </span>
  );
}

function ReportButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  color: 'green' | 'blue' | 'purple';
  onClick: () => void;
}) {
  const colors = {
    green: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-violet-600 hover:bg-violet-700',
  };

  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm transition ${colors[color]}`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}
