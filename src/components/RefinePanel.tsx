"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface RefinePanelProps {
  onRefine: (refinement: string) => void;
  isLoading: boolean;
}

export function RefinePanel({ onRefine, isLoading }: RefinePanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;
    onRefine(input);
    setInput("");
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-20">
      <form 
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-xl border border-zinc-200 p-2 pl-4 rounded-2xl shadow-2xl flex items-center space-x-2"
      >
        <Sparkles size={18} className="text-zinc-400 shrink-0" />
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CLARITIY to refine or change something..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-zinc-900 placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={!input || isLoading}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl disabled:opacity-50 transition-all shrink-0"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}
