import { ArrowRight, RotateCcw, CloudRain, Radio, Cpu, Gauge } from 'lucide-react';
import { useState } from 'react';

export function ClimateAndSensors() {
  const [sensorData, setSensorData] = useState({
    fieldA: {
      soilMoisture: 22,
      rainProbability: 20,
      rainForecast: 0,
      heatwave: 'High',
      et: 7.2,
      pressure: 2.4,
      flow: 180,
    },
    fieldB: {
      soilMoisture: 34,
      rainProbability: 70,
      rainForecast: 9,
      heatwave: 'Low',
      et: 4.1,
      pressure: 2.1,
      flow: 120,
    },
    fieldC: {
      soilMoisture: 25,
      rainProbability: 35,
      rainForecast: 1,
      heatwave: 'Medium',
      et: 5.6,
      pressure: 1.3,
      flow: 150,
    },
  });

  const simulateHeatwave = () => {
    setSensorData(prev => ({
      fieldA: { ...prev.fieldA, heatwave: 'High', et: 9.5, soilMoisture: 18 },
      fieldB: { ...prev.fieldB, heatwave: 'High', et: 7.8, soilMoisture: 28 },
      fieldC: { ...prev.fieldC, heatwave: 'High', et: 8.2, soilMoisture: 20 },
    }));
  };

  const simulateRain = () => {
    setSensorData(prev => ({
      fieldA: { ...prev.fieldA, rainProbability: 85, rainForecast: 12, soilMoisture: 28 },
      fieldB: { ...prev.fieldB, rainProbability: 90, rainForecast: 15, soilMoisture: 38 },
      fieldC: { ...prev.fieldC, rainProbability: 80, rainForecast: 10, soilMoisture: 32 },
    }));
  };

  const simulateLowPressure = () => {
    setSensorData(prev => ({
      fieldA: { ...prev.fieldA, pressure: 1.5 },
      fieldB: { ...prev.fieldB, pressure: 1.4 },
      fieldC: { ...prev.fieldC, pressure: 1.1 },
    }));
  };

  const resetData = () => {
    setSensorData({
      fieldA: {
        soilMoisture: 22,
        rainProbability: 20,
        rainForecast: 0,
        heatwave: 'High',
        et: 7.2,
        pressure: 2.4,
        flow: 180,
      },
      fieldB: {
        soilMoisture: 34,
        rainProbability: 70,
        rainForecast: 9,
        heatwave: 'Low',
        et: 4.1,
        pressure: 2.1,
        flow: 120,
      },
      fieldC: {
        soilMoisture: 25,
        rainProbability: 35,
        rainForecast: 1,
        heatwave: 'Medium',
        et: 5.6,
        pressure: 1.3,
        flow: 150,
      },
    });
  };
  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl text-gray-900 mb-3 tracking-tight">Climate & Sensors</h1>
        <p className="text-lg text-gray-600">Real-time environmental data and IoT sensor network</p>
      </div>

      {/* Flow Diagram */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 mb-10 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-2xl">
              <CloudRain className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-sm text-white font-medium">Weather Data</div>
            <div className="text-xs text-gray-400 mt-1">API Integration</div>
          </div>
          <ArrowRight className="w-10 h-10 text-white/40" strokeWidth={3} />
          <div className="text-center flex-1">
            <div className="w-36 h-36 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-2xl">
              <Radio className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-sm text-white font-medium">IoT Sensors</div>
            <div className="text-xs text-gray-400 mt-1">Field Network</div>
          </div>
          <ArrowRight className="w-10 h-10 text-white/40" strokeWidth={3} />
          <div className="text-center flex-1">
            <div className="w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-2xl ring-4 ring-white/20">
              <Cpu className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-sm text-white font-medium">AI Engine</div>
            <div className="text-xs text-gray-400 mt-1">Decision Making</div>
          </div>
          <ArrowRight className="w-10 h-10 text-white/40" strokeWidth={3} />
          <div className="text-center flex-1">
            <div className="w-36 h-36 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-2xl">
              <Gauge className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-sm text-white font-medium">Smart Valves</div>
            <div className="text-xs text-gray-400 mt-1">Pipe Control</div>
          </div>
        </div>
      </div>

      {/* Sensor Data Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <SensorCard
          field="Field A - Olives (Sfax)"
          data={[
            { label: 'Soil Moisture', value: `${sensorData.fieldA.soilMoisture}%`, target: 'Target: 32%' },
            { label: 'Rain Probability', value: `${sensorData.fieldA.rainProbability}%`, target: `Forecast: ${sensorData.fieldA.rainForecast} mm` },
            { label: 'Heatwave Risk', value: sensorData.fieldA.heatwave, target: `ET: ${sensorData.fieldA.et} mm/day` },
            { label: 'Pressure', value: `${sensorData.fieldA.pressure} bar`, target: 'Min: 1.8 bar', status: sensorData.fieldA.pressure >= 1.8 ? 'ok' : 'warning' },
            { label: 'Flow Rate', value: `${sensorData.fieldA.flow} L/min`, target: 'Target flow' },
          ]}
        />
        <SensorCard
          field="Field B - Tomatoes (Sidi Bouzid)"
          data={[
            { label: 'Soil Moisture', value: `${sensorData.fieldB.soilMoisture}%`, target: 'Target: 30%' },
            { label: 'Rain Probability', value: `${sensorData.fieldB.rainProbability}%`, target: `Forecast: ${sensorData.fieldB.rainForecast} mm` },
            { label: 'Heatwave Risk', value: sensorData.fieldB.heatwave, target: `ET: ${sensorData.fieldB.et} mm/day` },
            { label: 'Pressure', value: `${sensorData.fieldB.pressure} bar`, target: 'Min: 1.7 bar', status: sensorData.fieldB.pressure >= 1.7 ? 'ok' : 'warning' },
            { label: 'Flow Rate', value: `${sensorData.fieldB.flow} L/min`, target: 'Target flow' },
          ]}
        />
        <SensorCard
          field="Field C - Citrus (Nabeul)"
          data={[
            { label: 'Soil Moisture', value: `${sensorData.fieldC.soilMoisture}%`, target: 'Target: 35%' },
            { label: 'Rain Probability', value: `${sensorData.fieldC.rainProbability}%`, target: `Forecast: ${sensorData.fieldC.rainForecast} mm` },
            { label: 'Heatwave Risk', value: sensorData.fieldC.heatwave, target: `ET: ${sensorData.fieldC.et} mm/day` },
            { label: 'Pressure', value: `${sensorData.fieldC.pressure} bar`, target: 'Min: 1.8 bar', status: sensorData.fieldC.pressure >= 1.8 ? 'ok' : 'warning' },
            { label: 'Flow Rate', value: `${sensorData.fieldC.flow} L/min`, target: 'Target flow' },
          ]}
        />
      </div>

      {/* Simulation Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
        <div className="text-lg text-gray-900 mb-5 tracking-tight">Demo Simulation Controls</div>
        <div className="flex gap-4">
          <button
            onClick={simulateHeatwave}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30 text-sm font-medium"
          >
            Simulate Heatwave
          </button>
          <button
            onClick={simulateRain}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 text-sm font-medium"
          >
            Simulate Rain Event
          </button>
          <button
            onClick={simulateLowPressure}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 text-sm font-medium"
          >
            Simulate Low Pressure
          </button>
          <button
            onClick={resetData}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}

function SensorCard({ field, data }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-lg text-gray-900 mb-5 tracking-tight">{field}</div>
      <div className="space-y-3">
        {data.map((item: any, index: number) => (
          <div key={index} className="flex justify-between items-center">
            <div className="text-sm text-gray-600">{item.label}</div>
            <div className="text-right">
              <div className={`text-sm ${item.status === 'warning' ? 'text-red-600' : 'text-gray-900'}`}>
                {item.value}
              </div>
              <div className="text-xs text-gray-500">{item.target}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
