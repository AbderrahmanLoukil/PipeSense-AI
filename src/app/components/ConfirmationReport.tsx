import { CheckCircle2, XCircle, AlertCircle, FileDown, Send, Calendar, Lightbulb } from 'lucide-react';

export function ConfirmationReport() {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl text-gray-900 mb-3 tracking-tight">Execution Report</h1>
        <p className="text-lg text-gray-600">Complete irrigation cycle summary with water savings analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <SummaryCard
          icon={CheckCircle2}
          label="Completed"
          value="1"
          color="green"
        />
        <SummaryCard
          icon={XCircle}
          label="Skipped"
          value="1"
          color="gray"
        />
        <SummaryCard
          icon={AlertCircle}
          label="Blocked"
          value="1"
          color="red"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Water Delivered"
          value="500,000 L"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 shadow-2xl shadow-green-500/30">
          <div className="text-green-100 mb-2 tracking-wide uppercase text-sm">Total Water Saved</div>
          <div className="text-5xl text-white mb-3 tracking-tight">875,000 L</div>
          <div className="text-green-50">By skipping unnecessary irrigation and preventing unsafe execution</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 shadow-2xl shadow-orange-500/30">
          <div className="text-orange-100 mb-2 tracking-wide uppercase text-sm">Pressure Alerts</div>
          <div className="text-5xl text-white mb-3 tracking-tight">1</div>
          <div className="text-orange-50">Field C requires pressure system maintenance</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-lg text-gray-900">Execution Results</div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Field</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Crop</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Water Delivered</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Duration</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Field A</td>
              <td className="px-6 py-4 text-sm text-gray-600">Olives (Sfax)</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">500,000 L</td>
              <td className="px-6 py-4 text-sm text-gray-600">28 min 15 sec</td>
              <td className="px-6 py-4 text-sm text-gray-600">Valve closed automatically after target reached</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Field B</td>
              <td className="px-6 py-4 text-sm text-gray-600">Tomatoes (Sidi Bouzid)</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs flex items-center gap-1 w-fit">
                  <XCircle className="w-3 h-3" />
                  Skipped
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">0 L</td>
              <td className="px-6 py-4 text-sm text-gray-600">-</td>
              <td className="px-6 py-4 text-sm text-gray-600">Rain expected (9 mm forecast)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Field C</td>
              <td className="px-6 py-4 text-sm text-gray-600">Citrus (Nabeul)</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs flex items-center gap-1 w-fit">
                  <AlertCircle className="w-3 h-3" />
                  Blocked
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">0 L</td>
              <td className="px-6 py-4 text-sm text-gray-600">-</td>
              <td className="px-6 py-4 text-sm text-gray-600">Low pressure (1.3 bar below safe 1.8 bar threshold)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Insight Card */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-10 mb-10 shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
            <Lightbulb className="w-9 h-9 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-2xl text-white mb-4 tracking-tight">AI Water Optimization Impact</div>
            <div className="text-base text-purple-50 leading-relaxed">
              PipeSense AI saved 875,000 liters of water by intelligently skipping Field B irrigation due to expected rainfall,
              and prevented unsafe execution in Field C where low pipe pressure could have caused system damage.
              The AI successfully delivered precise irrigation to Field A where it was most needed based on soil moisture deficits and heatwave conditions.
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-purple-100 text-sm">
              <strong className="text-white">Key Innovation:</strong> From climate prediction → AI analysis → pipe-level valve control → water savings
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-xl shadow-green-600/30 text-base font-medium flex items-center gap-3">
          <FileDown className="w-5 h-5" />
          Export Report
        </button>
        <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-600/30 text-base font-medium flex items-center gap-3">
          <Send className="w-5 h-5" />
          Send to Farmer
        </button>
        <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-xl shadow-purple-600/30 text-base font-medium flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          View Next 7-Day Plan
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    green: 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30',
    gray: 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg shadow-gray-400/30',
    red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30',
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
