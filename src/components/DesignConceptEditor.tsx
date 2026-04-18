"use client";

import { useState } from "react";
import { Palette, ChevronDown, ChevronUp } from "lucide-react";

interface DesignConceptEditorProps {
  designConcept: string;
  setDesignConcept: (val: string) => void;
}

export function DesignConceptEditor({ designConcept, setDesignConcept }: DesignConceptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Palette size={18} className="text-zinc-600" />
          <span className="font-medium text-sm">Design Concept (Optional)</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-zinc-200 bg-white">
          <p className="text-xs text-zinc-500 mb-2">
            Describe the visual identity or design aesthetics you want (e.g., &quot;Minimalist monochrome, brutalist, rounded colorful neon&quot;)
          </p>
          <textarea
            value={designConcept}
            onChange={(e) => setDesignConcept(e.target.value)}
            placeholder="Visual instructions..."
            className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-3 text-sm text-zinc-800 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 min-h-[100px] resize-y"
          />
        </div>
      )}
    </div>
  );
}
