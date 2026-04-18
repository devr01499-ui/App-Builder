"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowRight, 
  Code2, 
  Sparkles, 
  RotateCcw, 
  History as HistoryIcon, 
  Trash2,
  ChevronRight,
  LayoutTemplate,
  Palette,
  Eye,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SandpackPreview } from "@/components/SandpackPreview";
import { WireframeEditor } from "@/components/WireframeEditor";
import { DesignConceptEditor } from "@/components/DesignConceptEditor";
import { GitHubExport } from "@/components/GitHubExport";
import { Navbar } from "@/components/Navbar";
import { PromptTemplates } from "@/components/PromptTemplates";
import { RefinePanel } from "@/components/RefinePanel";

// Types
interface Generation {
  id: string;
  prompt: string;
  code: string;
  timestamp: number;
}

type LoadingStep = "idle" | "architecting" | "coding" | "optimizing" | "rendering";

// Stream Processor
async function* readStream(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer) yield* processText(buffer);
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      yield* processText(line);
    }
  }

  function* processText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || trimmed === "data: [DONE]") return;
    if (trimmed.startsWith("data: ")) {
      try {
        const jsonStr = trimmed.substring(6);
        if (jsonStr === "[DONE]") return;
        yield JSON.parse(jsonStr);
      } catch (error) {
        console.warn("Failed to parse JSON chunk", trimmed, error);
      }
    }
  }
}

export default function Home() {
  // UI State
  const [prompt, setPrompt] = useState("");
  const [wireframe, setWireframe] = useState("");
  const [designConcept, setDesignConcept] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [activeTab, setActiveTab] = useState<"build" | "history">("build");
  
  // Persistence State
  const [history, setHistory] = useState<Generation[]>([]);

  // Initialize History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("claritiy_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = useCallback((newCode: string, currentPrompt: string) => {
    if (!newCode) return;
    const newGen: Generation = {
      id: Date.now().toString(),
      prompt: currentPrompt,
      code: newCode,
      timestamp: Date.now(),
    };
    const updated = [newGen, ...history.slice(0, 19)]; // Keep last 20
    setHistory(updated);
    localStorage.setItem("claritiy_history", JSON.stringify(updated));
  }, [history]);

  const handleGenerate = async (e?: React.FormEvent, customPrompt?: string, existingCode?: string) => {
    if (e) e.preventDefault();
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt) return;

    setIsLoading(true);
    setLoadingStep("architecting");
    if (!existingCode) setGeneratedCode("");

    try {
      // Step simulation for visual feedback
      setTimeout(() => setLoadingStep("coding"), 2000);
      
      const res = await fetch("/api/generateCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: existingCode ? `Refine this code: ${targetPrompt}\n\nExisting Code:\n${existingCode}` : targetPrompt, 
          wireframe, 
          designConcept 
        }),
      });

      if (!res.ok) throw new Error("Failed to generate code");

      let currentBuffer = "";
      for await (const chunk of readStream(res)) {
        const content = chunk.choices?.[0]?.delta?.content || "";
        if (content) {
          currentBuffer += content;
          setGeneratedCode((prev) => prev + content);
        }
      }

      setLoadingStep("rendering");
      saveToHistory(currentBuffer || generatedCode, targetPrompt);
      setTimeout(() => setLoadingStep("idle"), 1500);

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your API key.");
      setLoadingStep("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("claritiy_history");
  };

  const loadFromHistory = (gen: Generation) => {
    setGeneratedCode(gen.code);
    setPrompt(gen.prompt);
    setActiveTab("build");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white subtle-grid">
      <Navbar />

      <main className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Sidebar: Controls & History */}
        <aside className="w-[380px] border-r border-zinc-200 bg-zinc-50/50 flex flex-col shrink-0 overflow-hidden">
          <div className="flex border-b border-zinc-200">
            <button 
              onClick={() => setActiveTab("build")}
              className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${activeTab === "build" ? "bg-white text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              <LayoutTemplate size={16} />
              <span>Configure</span>
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${activeTab === "history" ? "bg-white text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              <HistoryIcon size={16} />
              <span>History</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === "build" ? (
                <motion.div 
                  key="build"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Main Prompt</label>
                    <div className="relative group">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A sleek modern dashboard with dark sidebar..."
                        className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
                      />
                      <button
                        onClick={(e) => handleGenerate(e)}
                        disabled={isLoading || !prompt}
                        className="absolute bottom-3 right-3 p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 shadow-md transition-all active:scale-95"
                      >
                        {isLoading ? <RotateCcw size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Wireframe & Aesthetics</label>
                    <WireframeEditor wireframe={wireframe} setWireframe={setWireframe} />
                    <DesignConceptEditor designConcept={designConcept} setDesignConcept={setDesignConcept} />
                  </div>

                  <div className="pt-4 border-t border-zinc-200">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-3">Quick Starts</label>
                    <PromptTemplates onSelect={(p) => { setPrompt(p); handleGenerate(undefined, p); }} />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">Recent Projects</h3>
                    <button onClick={clearHistory} className="text-xs text-zinc-400 hover:text-red-500 flex items-center space-x-1 transition-colors">
                      <Trash2 size={12} />
                      <span>Clear all</span>
                    </button>
                  </div>
                  
                  {history.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400">
                      <HistoryIcon size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm italic">No history yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((gen) => (
                        <button
                          key={gen.id}
                          onClick={() => loadFromHistory(gen)}
                          className="w-full p-3 text-left bg-white border border-zinc-200 rounded-xl hover:border-zinc-400 transition-all group"
                        >
                          <p className="text-xs text-zinc-400 mb-1">{new Date(gen.timestamp).toLocaleTimeString()}</p>
                          <p className="text-sm text-zinc-700 line-clamp-2 leading-snug group-hover:text-zinc-900">{gen.prompt}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-zinc-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <GitHubExport code={generatedCode} />
          </div>
        </aside>

        {/* Right Canvas Layout */}
        <section className="flex-1 bg-zinc-100 p-6 flex flex-col relative overflow-hidden">
          
          {/* Status Indicators */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-6 px-6 py-2.5 bg-white/50 backdrop-blur-md rounded-full border border-white/20 shadow-sm text-xs transition-all">
            <div className={`flex items-center space-x-2 transition-all ${loadingStep === "architecting" ? "step-active" : "step-inactive"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${loadingStep === "architecting" ? "bg-zinc-900 animate-ping" : "bg-zinc-300"}`} />
              <span>Architecting</span>
            </div>
            <ChevronRight size={14} className="text-zinc-300" />
            <div className={`flex items-center space-x-2 transition-all ${loadingStep === "coding" ? "step-active" : "step-inactive"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${loadingStep === "coding" ? "bg-zinc-900 animate-pulse" : "bg-zinc-300"}`} />
              <span>Coding</span>
            </div>
            <ChevronRight size={14} className="text-zinc-300" />
            <div className={`flex items-center space-x-2 transition-all ${loadingStep === "rendering" ? "step-active" : "step-inactive"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${loadingStep === "rendering" ? "bg-zinc-900" : "bg-zinc-300"}`} />
              <span>Rendering</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-zinc-200/50 flex flex-col">
              {!generatedCode && !isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center bg-white subtle-grid">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
                    <Code2 size={32} className="text-zinc-400" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 mb-2">Build Your Vision</h2>
                  <p className="text-sm max-w-sm text-zinc-400 leading-relaxed">
                    Describe any application, landing page, or UI component. CLARITIY converts your words 
                    into interactive code in real-time.
                  </p>
                </div>
              ) : (
                <div className="flex-1 h-full w-full relative z-10">
                   <SandpackPreview code={generatedCode.replace(/```(?:tsx|typescript|jsx|javascript)?\n([\s\S]*?)```/g, "$1").trim() || generatedCode} />
                </div>
              )}
          </div>

          {generatedCode && !isLoading && (
            <RefinePanel 
              onRefine={(r) => handleGenerate(undefined, r, generatedCode)} 
              isLoading={isLoading} 
            />
          )}
        </section>
      </main>
    </div>
  );
}
