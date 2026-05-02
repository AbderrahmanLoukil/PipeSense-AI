export function AIRecommendation() {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl text-gray-900 mb-3 tracking-tight">AI Recommendation Engine</h1>
        <p className="text-lg text-gray-600">Climate-aware irrigation scheduling powered by machine learning</p>
      </div>

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" opacity="0.9"/>
              <circle cx="8" cy="10" r="1.5" fill="white"/>
              <circle cx="16" cy="10" r="1.5" fill="white"/>
              <path d="M9 14.5C9 14.5 10 16 12 16C14 16 15 14.5 15 14.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 7L7 5M19 7L17 5M12 2V4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-white text-2xl mb-2 tracking-tight">AI Analysis Complete</div>
            <div className="text-purple-100 text-base">
              Analyzed weather patterns, soil sensors, heatwave risk, and rainfall forecast.
              Generated optimal irrigation schedule with 875,000 L water savings.
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <RecommendationCard
          field="Field A"
          crop="Olives (Sfax, 2.5 ha)"
          priority="High"
          action="Irrigate Tomorrow"
          time="06:00"
          waterMm="20 mm"
          liters="500,000 L"
          reason="Low soil moisture (22% vs 32% target), high heatwave risk, high ET (7.2 mm/day), low rain probability (20%)"
          status="scheduled"
        />
        <RecommendationCard
          field="Field B"
          crop="Tomatoes (Sidi Bouzid, 1.2 ha)"
          priority="Low"
          action="Skip Irrigation"
          time="-"
          waterMm="0 mm"
          liters="0 L"
          reason="High rain probability (70%) with 9 mm forecast rainfall expected. No irrigation needed."
          status="skipped"
        />
        <RecommendationCard
          field="Field C"
          crop="Citrus (Nabeul, 1.8 ha)"
          priority="Medium"
          action="Execution Blocked"
          time="-"
          waterMm="21 mm needed"
          liters="378,000 L needed"
          reason="Pressure unsafe: 1.3 bar below minimum safe threshold of 1.8 bar. Cannot execute irrigation."
          status="blocked"
        />
      </div>

      {/* Weekly Plan Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-lg text-gray-900">7-Day Irrigation Plan</div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Field</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Region</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Crop</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Action</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Time</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Water (mm)</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Liters</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Field A</td>
              <td className="px-6 py-4 text-sm text-gray-600">Sfax</td>
              <td className="px-6 py-4 text-sm text-gray-600">Olives</td>
              <td className="px-6 py-4 text-sm text-gray-900">Irrigate</td>
              <td className="px-6 py-4 text-sm text-gray-600">Tomorrow 06:00</td>
              <td className="px-6 py-4 text-sm text-gray-600">20 mm</td>
              <td className="px-6 py-4 text-sm text-gray-600">500,000 L</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Scheduled</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">High ET, low moisture</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Field B</td>
              <td className="px-6 py-4 text-sm text-gray-600">Sidi Bouzid</td>
              <td className="px-6 py-4 text-sm text-gray-600">Tomatoes</td>
              <td className="px-6 py-4 text-sm text-gray-900">Skip</td>
              <td className="px-6 py-4 text-sm text-gray-600">-</td>
              <td className="px-6 py-4 text-sm text-gray-600">0 mm</td>
              <td className="px-6 py-4 text-sm text-gray-600">0 L</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">Skipped</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">Rain expected (9 mm)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Field C</td>
              <td className="px-6 py-4 text-sm text-gray-600">Nabeul</td>
              <td className="px-6 py-4 text-sm text-gray-600">Citrus</td>
              <td className="px-6 py-4 text-sm text-gray-900">Blocked</td>
              <td className="px-6 py-4 text-sm text-gray-600">-</td>
              <td className="px-6 py-4 text-sm text-gray-600">21 mm</td>
              <td className="px-6 py-4 text-sm text-gray-600">378,000 L</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">Blocked</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">Unsafe pressure (1.3 bar)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecommendationCard({ field, crop, priority, action, time, waterMm, liters, reason, status }: any) {
  const priorityColors = {
    High: 'bg-red-500 text-white',
    Medium: 'bg-orange-500 text-white',
    Low: 'bg-gray-500 text-white',
  };

  const statusColors = {
    scheduled: 'border-l-8 border-l-green-500 shadow-lg shadow-green-500/20',
    skipped: 'border-l-8 border-l-gray-400 shadow-lg shadow-gray-400/20',
    blocked: 'border-l-8 border-l-red-500 shadow-lg shadow-red-500/20',
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-8 ${statusColors[status]} hover:shadow-2xl transition-shadow`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-2xl text-gray-900 mb-2 tracking-tight">{field}</div>
          <div className="text-sm text-gray-600">{crop}</div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-medium shadow-lg ${priorityColors[priority]}`}>
          {priority} Priority
        </div>
      </div>

      <div className="mb-6 bg-gray-50 rounded-xl p-5">
        <div className="text-3xl text-gray-900 mb-2 tracking-tight">{action}</div>
        <div className="text-base text-gray-600">{time}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <div className="text-xs text-gray-600 mb-1">Water Depth</div>
          <div className="text-sm text-gray-900">{waterMm}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Total Volume</div>
          <div className="text-sm text-gray-900">{liters}</div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-2">AI Reasoning</div>
        <div className="text-sm text-gray-700">{reason}</div>
      </div>
    </div>
  );
}
