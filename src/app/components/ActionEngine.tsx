import { ArrowRight, Play, Zap, CloudRain, Radio, Cpu, Gauge, Droplets, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ActionEngineProps {
  executed: boolean;
  onExecute: () => void;
}

export function ActionEngine({ executed, onExecute }: ActionEngineProps) {
  const [fieldAProgress, setFieldAProgress] = useState(0);

  useEffect(() => {
    if (executed && fieldAProgress < 100) {
      const interval = setInterval(() => {
        setFieldAProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [executed, fieldAProgress]);

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl text-gray-900 mb-3 tracking-tight">Action Engine</h1>
        <p className="text-lg text-gray-600">Real-time valve control and flow monitoring at the pipe level</p>
      </div>

      {/* Hero Flow Diagram */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 mb-10 shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-6 py-3 rounded-full border border-white/20">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">From Prediction to Pipe-Level Action</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <FlowNode
            icon={CloudRain}
            title="Climate Data"
            subtitle="Weather & Forecast"
            color="from-blue-500 to-cyan-500"
          />
          <FlowArrow />
          <FlowNode
            icon={Cpu}
            title="AI Engine"
            subtitle="Smart Analysis"
            color="from-purple-500 to-pink-500"
            highlight
          />
          <FlowArrow />
          <FlowNode
            icon={Radio}
            title="Controller"
            subtitle="Command Center"
            color="from-indigo-500 to-blue-500"
          />
          <FlowArrow />
          <FlowNode
            icon={Gauge}
            title="Smart Valves"
            subtitle="Pipe Network"
            color="from-green-500 to-emerald-500"
          />
          <FlowArrow />
          <FlowNode
            icon={Droplets}
            title="Irrigation"
            subtitle="Field Delivery"
            color="from-cyan-500 to-blue-500"
          />
        </div>
      </div>

      {/* Execute Button */}
      {!executed && (
        <div className="mb-10">
          <button
            onClick={onExecute}
            className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all shadow-2xl shadow-green-600/40 text-xl font-medium flex items-center gap-4 hover:scale-105 active:scale-100"
          >
            <Play className="w-7 h-7" />
            Execute Full AI Plan
            <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">3 Fields</span>
          </button>
          <p className="text-sm text-gray-500 mt-4 ml-1">
            This will open/close valves based on AI recommendations, skip rain-expected fields, and block unsafe pressure zones
          </p>
        </div>
      )}

      {executed && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg text-gray-900 font-medium mb-1">Plan Execution In Progress</div>
              <div className="text-sm text-gray-600">Monitoring valve states and flow meters across all fields</div>
            </div>
          </div>
        </div>
      )}

      {/* Valve Control Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <ValveCard
          field="Field A"
          crop="Olives (Sfax)"
          status={executed ? (fieldAProgress >= 100 ? 'completed' : 'running') : 'ready'}
          pressure={2.4}
          minPressure={1.8}
          targetLiters={500000}
          currentLiters={executed ? (fieldAProgress / 100) * 500000 : 0}
          progress={executed ? fieldAProgress : 0}
        />
        <ValveCard
          field="Field B"
          crop="Tomatoes (Sidi Bouzid)"
          status="skipped"
          pressure={2.1}
          minPressure={1.7}
          targetLiters={0}
          currentLiters={0}
          progress={0}
          reason="Rain expected (9 mm)"
        />
        <ValveCard
          field="Field C"
          crop="Citrus (Nabeul)"
          status="blocked"
          pressure={1.3}
          minPressure={1.8}
          targetLiters={378000}
          currentLiters={0}
          progress={0}
          reason="Unsafe pressure"
        />
      </div>

      {/* Action Log */}
      {executed && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="text-xl text-gray-900 tracking-tight">Live Execution Log</div>
            <div className="text-sm text-gray-600 mt-1">Real-time events from controller and field sensors</div>
          </div>
          <div className="p-8 space-y-3 bg-slate-950 font-mono text-sm">
            <LogEntry time="06:00:00.000" event="AI irrigation plan loaded into controller" status="info" />
            <LogEntry time="06:00:01.234" event="Field A: Valve opening command sent" status="success" />
            <LogEntry time="06:00:01.456" event="Field A: Flow sensor activated - 180 L/min detected" status="success" />
            <LogEntry time="06:00:02.100" event="Field B: Irrigation skipped - rain forecast 70% (9mm expected)" status="info" />
            <LogEntry time="06:00:02.345" event="Field C: BLOCKED - Pressure 1.3 bar below safe threshold (1.8 bar)" status="error" />
            {fieldAProgress > 20 && <LogEntry time="06:05:30.120" event="Field A: 100,000 L delivered (20% complete)" status="success" />}
            {fieldAProgress > 50 && <LogEntry time="06:14:15.890" event="Field A: 250,000 L delivered (50% complete)" status="success" />}
            {fieldAProgress >= 100 && <LogEntry time="06:28:15.567" event="Field A: Target reached - 500,000 L delivered" status="success" />}
            {fieldAProgress >= 100 && <LogEntry time="06:28:16.123" event="Field A: Valve closing command sent" status="success" />}
            {fieldAProgress >= 100 && <LogEntry time="06:28:17.890" event="Field A: Valve confirmed closed - flow stopped" status="success" />}
            {fieldAProgress >= 100 && <LogEntry time="06:28:18.234" event="Execution complete: 1 completed, 1 skipped, 1 blocked" status="info" />}
          </div>
        </div>
      )}
    </div>
  );
}

function FlowNode({ icon: IconComponent, title, subtitle, color, highlight }: any) {
  return (
    <div className={`flex-1 relative ${highlight ? 'scale-110' : ''} transition-transform`}>
      <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-2xl ${highlight ? 'ring-4 ring-white/30' : ''}`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <IconComponent className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
          <div className="text-white font-medium text-lg mb-1">{title}</div>
          <div className="text-white/80 text-sm">{subtitle}</div>
        </div>
      </div>
      {highlight && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          AI
        </div>
      )}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center">
      <ArrowRight className="w-8 h-8 text-white/60" strokeWidth={3} />
    </div>
  );
}

function ValveCard({ field, crop, status, pressure, minPressure, targetLiters, currentLiters, progress, reason }: any) {
  const statusConfig = {
    ready: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-700',
      label: 'Ready',
      valveColor: 'bg-blue-500',
      ringColor: 'ring-blue-500'
    },
    running: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-300',
      text: 'text-green-700',
      label: 'Running',
      valveColor: 'bg-green-500 animate-pulse',
      ringColor: 'ring-green-500 ring-4'
    },
    completed: {
      bg: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-300',
      text: 'text-emerald-700',
      label: 'Completed',
      valveColor: 'bg-emerald-600',
      ringColor: 'ring-emerald-500'
    },
    skipped: {
      bg: 'from-gray-50 to-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-700',
      label: 'Skipped',
      valveColor: 'bg-gray-400',
      ringColor: 'ring-gray-400'
    },
    blocked: {
      bg: 'from-red-50 to-red-100',
      border: 'border-red-300',
      text: 'text-red-700',
      label: 'Blocked',
      valveColor: 'bg-red-500',
      ringColor: 'ring-red-500'
    },
  };

  const config = statusConfig[status];
  const pressureOk = pressure >= minPressure;
  const isActive = status === 'running' || status === 'completed';

  return (
    <div className={`rounded-2xl border-2 p-8 bg-gradient-to-br ${config.bg} ${config.border} shadow-xl`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xl text-gray-900 mb-1 tracking-tight">{field}</div>
          <div className="text-sm text-gray-600">{crop}</div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-medium ${config.text} bg-white/80 backdrop-blur shadow-md`}>
          {config.label}
        </div>
      </div>

      {/* Premium Valve Visual */}
      <div className="mb-6 bg-white/50 backdrop-blur rounded-xl p-6 border border-white/60">
        <div className="text-sm text-gray-700 mb-4 font-medium">Pipe Valve Status</div>
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Valve body */}
            <div className={`w-32 h-32 rounded-full ${config.valveColor} ${config.ringColor} flex items-center justify-center shadow-2xl transition-all`}>
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/40">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isActive ? (
                    <>
                      <circle cx="12" cy="12" r="8" fill="white" opacity="0.9"/>
                      <path d="M12 8V16M8 12H16" stroke={status === 'completed' ? '#10b981' : '#22c55e'} strokeWidth="2" strokeLinecap="round"/>
                    </>
                  ) : status === 'blocked' ? (
                    <>
                      <circle cx="12" cy="12" r="8" fill="white" opacity="0.9"/>
                      <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="8" fill="white" opacity="0.5"/>
                      <circle cx="12" cy="12" r="3" fill="#9ca3af"/>
                    </>
                  )}
                </svg>
              </div>
            </div>
            {/* Flow indicator */}
            {isActive && (
              <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                <div className="flex gap-1">
                  <Droplets className="w-5 h-5 text-blue-500 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pressure Display */}
      <div className="mb-6 bg-white/50 backdrop-blur rounded-xl p-4 border border-white/60">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-600 mb-1">Pipe Pressure</div>
            <div className={`text-2xl font-bold ${pressureOk ? 'text-green-600' : 'text-red-600'}`}>
              {pressure} bar
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Minimum Safe</div>
            <div className="text-lg text-gray-700">{minPressure} bar</div>
          </div>
        </div>
        {!pressureOk && (
          <div className="mt-3 pt-3 border-t border-red-200 text-sm text-red-700 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pressure below safe threshold
          </div>
        )}
      </div>

      {/* Flow Meter */}
      {targetLiters > 0 && (
        <div className="bg-white/50 backdrop-blur rounded-xl p-4 border border-white/60">
          <div className="text-xs text-gray-600 mb-3">Flow Meter</div>
          <div className="text-2xl text-gray-900 mb-3 font-bold tracking-tight">
            {Math.round(currentLiters).toLocaleString()} L
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Target: {targetLiters.toLocaleString()} L
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-2 text-right">{Math.round(progress)}%</div>
        </div>
      )}

      {reason && (
        <div className="mt-6 pt-6 border-t border-white/60">
          <div className="text-sm text-gray-700 font-medium">{reason}</div>
        </div>
      )}
    </div>
  );
}

function LogEntry({ time, event, status }: any) {
  const statusConfig = {
    success: { color: 'text-green-400', icon: '●' },
    error: { color: 'text-red-400', icon: '●' },
    info: { color: 'text-blue-400', icon: '●' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-start gap-4">
      <span className="text-gray-500">[{time}]</span>
      <span className={config.color}>{config.icon}</span>
      <span className="text-gray-300 flex-1">{event}</span>
    </div>
  );
}
