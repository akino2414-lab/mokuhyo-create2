import React from 'react';
import { PRESET_GOALS } from '../data/presets';
import { PresetGoal } from '../types';
import { X, BookOpen, Laptop, Sparkles, BookmarkCheck, Activity, ArrowRight } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetGoal) => void;
}

const ICON_MAP: Record<string, any> = {
  BookOpen,
  Laptop,
  Sparkles,
  BookmarkCheck,
  Activity,
};

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-stone-200">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              よくある目標のテンプレート・例文
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              気になる目標を選ぶと、フォームに入力されて即座に中間目標を体験できます
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {PRESET_GOALS.map((preset) => {
            const Icon = ICON_MAP[preset.icon] || Sparkles;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                        {preset.category}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-600">
                        {preset.days}日間
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition">
                      {preset.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {preset.sampleSummary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                  <span className="text-xs font-semibold text-amber-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    <span>この例を使う</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
