"use client";

import { useState } from "react";
import { LayoutTemplate, ChevronDown, ChevronUp } from "lucide-react";

interface WireframeEditorProps {
  wireframe: string;
  setWireframe: (val: string) => void;
}

export function WireframeEditor({ wireframe, setWireframe }: WireframeEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 text-slate-200 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <LayoutTemplate size={18} className="text-indigo-400" />
          <span className="font-medium text-sm">Add Wireframe / Constraints (Optional)</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-700/50 bg-slate-900">
          <p className="text-xs text-slate-400 mb-2">
            Describe the layout structure or constraints to guide the AI. Keep it brief to save tokens.
            (e.g., "Header at top, sidebar on left, 3x3 grid in center")
          </p>
          <textarea
            value={wireframe}
            onChange={(e) => setWireframe(e.target.value)}
            placeholder="Layout instructions..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px] resize-y"
          />
        </div>
      )}
    </div>
  );
}
