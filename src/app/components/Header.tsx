import { CheckCircle2, CloudOff } from 'lucide-react';
import type { FarmMeta } from '../types';

interface HeaderProps {
  farm: FarmMeta;
  apiOnline: boolean;
  isLoading: boolean;
}

export function Header({ farm, apiOnline, isLoading }: HeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-5 py-4 shadow-sm md:px-8 md:py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <div>
            <div className="text-xs text-slate-500 mb-1">Active Farm</div>
            <div className="text-base text-slate-900 md:text-lg">{farm.name}</div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <div className="text-xs text-slate-500 mb-1">Last Updated</div>
            <div className="text-sm text-slate-700">{farm.lastUpdated}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm ${
              apiOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {apiOnline ? <CheckCircle2 className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            <span>{isLoading ? 'Syncing' : apiOnline ? 'API Connected' : 'Local Demo'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
