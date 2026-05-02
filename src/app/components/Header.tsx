import { CheckCircle2 } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-white border-b border-gray-100 px-8 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">Active Farm</div>
            <div className="text-lg text-gray-900">Demo Farm Tunisia</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-xs text-gray-500 mb-1">Last Updated</div>
            <div className="text-sm text-gray-700">2 minutes ago</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg shadow-green-500/30 border border-green-400/20">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">AI Plan Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
