import React from 'react';
import { AlertCircle, PlusCircle } from 'lucide-react';

interface ProximalExtensionPromptBannerProps {
  hasCFVThrombus: boolean;
  isIliocavalInScope: boolean;
  onAddIliocavalScope: () => void;
}

export const ProximalExtensionPromptBanner: React.FC<ProximalExtensionPromptBannerProps> = ({
  hasCFVThrombus,
  isIliocavalInScope,
  onAddIliocavalScope
}) => {
  if (!hasCFVThrombus || isIliocavalInScope) {
    return null;
  }

  return (
    <div className="bg-amber-950/80 border border-amber-600/80 rounded-xl p-3.5 mb-4 text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md animate-fade-in">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 text-xs uppercase tracking-wide block">
            PROXIMAL EXTENSION PROMPT
          </span>
          <p className="text-xs text-amber-200/90 mt-0.5">
            CFV thrombus documented. Consider assessment of the more proximal venous system to determine superior extent where clinically appropriate.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAddIliocavalScope}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors flex-shrink-0 shadow cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        ADD ILIOCAVAL ASSESSMENT
      </button>
    </div>
  );
};
