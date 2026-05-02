import { Droplet, TrendingDown, Power, AlertTriangle, Gauge, Thermometer } from 'lucide-react';

interface FarmDashboardProps {
  onGeneratePlan: () => void;
}

export function FarmDashboard({ onGeneratePlan }: FarmDashboardProps) {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl text-gray-900 mb-3 tracking-tight">Farm Overview</h1>
        <p className="text-lg text-gray-600">Real-time monitoring and AI-powered irrigation control</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <MetricCard
          icon={Droplet}
          label="Total Planned Water"
          value="500,000 L"
          color="blue"
        />
        <MetricCard
          icon={TrendingDown}
          label="Estimated Water Saved"
          value="875,000 L"
          color="green"
        />
        <MetricCard
          icon={Power}
          label="Active Valves"
          value="0/3"
          color="gray"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Fields Requiring Action"
          value="2"
          color="orange"
        />
        <MetricCard
          icon={Gauge}
          label="Pressure Alerts"
          value="1"
          color="red"
        />
        <MetricCard
          icon={Thermometer}
          label="Climate Risk"
          value="High"
          color="red"
        />
      </div>

      {/* Field Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <FieldCard
          name="Field A"
          crop="Olives"
          region="Sfax"
          area="2.5 ha"
          soilMoisture={22}
          targetMoisture={32}
          rainProbability={20}
          heatwave="High"
          pressure={2.4}
          minPressure={1.8}
          status="Scheduled"
          recommendation="Irrigate tomorrow 06:00 with 20 mm"
          priority="high"
        />
        <FieldCard
          name="Field B"
          crop="Tomatoes"
          region="Sidi Bouzid"
          area="1.2 ha"
          soilMoisture={34}
          targetMoisture={30}
          rainProbability={70}
          heatwave="Low"
          pressure={2.1}
          minPressure={1.7}
          status="Skipped"
          recommendation="Skip irrigation - rain expected"
          priority="low"
        />
        <FieldCard
          name="Field C"
          crop="Citrus"
          region="Nabeul"
          area="1.8 ha"
          soilMoisture={25}
          targetMoisture={35}
          rainProbability={35}
          heatwave="Medium"
          pressure={1.3}
          minPressure={1.8}
          status="Blocked"
          recommendation="Blocked - low pressure unsafe"
          priority="medium"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onGeneratePlan}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-xl shadow-green-600/30 text-lg font-medium"
        >
          Generate AI Irrigation Plan
        </button>
        <div className="text-sm text-gray-500">
          AI will analyze climate data, sensors, and forecast to create optimal irrigation schedule
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30',
    green: 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30',
    gray: 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg shadow-gray-400/30',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30',
    red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-5`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-sm text-gray-500 mb-2 tracking-wide uppercase">{label}</div>
      <div className="text-3xl text-gray-900 tracking-tight">{value}</div>
    </div>
  );
}

function FieldCard({ name, crop, region, area, soilMoisture, targetMoisture, rainProbability, heatwave, pressure, minPressure, status, recommendation, priority }: any) {
  const statusColors = {
    Scheduled: 'bg-green-50 text-green-700 border-green-200',
    Skipped: 'bg-gray-50 text-gray-700 border-gray-200',
    Blocked: 'bg-red-50 text-red-700 border-red-200',
  };

  const heatwaveColors = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-orange-100 text-orange-700',
    Low: 'bg-green-100 text-green-700',
  };

  const priorityColors = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-orange-500',
    low: 'border-l-4 border-l-gray-400',
  };

  const moisturePercentage = (soilMoisture / targetMoisture) * 100;
  const pressureOk = pressure >= minPressure;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow ${priorityColors[priority]}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xl text-gray-900 mb-1.5 tracking-tight">{name}</div>
          <div className="text-sm text-gray-600">{crop} • {region} • {area}</div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-xs border font-medium ${statusColors[status]}`}>
          {status}
        </div>
      </div>

      {/* Soil Moisture Gauge */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Soil Moisture</span>
          <span className="text-gray-900">{soilMoisture}% / {targetMoisture}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${soilMoisture < targetMoisture * 0.7 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(moisturePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">Rain Probability</div>
          <div className="text-sm text-gray-900">{rainProbability}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Heatwave Risk</div>
          <div className={`text-xs px-2 py-1 rounded inline-block ${heatwaveColors[heatwave]}`}>
            {heatwave}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Pressure</div>
          <div className={`text-sm ${pressureOk ? 'text-green-600' : 'text-red-600'}`}>
            {pressure} bar {!pressureOk && '⚠'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Valve Status</div>
          <div className="text-sm text-gray-900">Closed</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">{recommendation}</div>
      </div>
    </div>
  );
}
