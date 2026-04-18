"use client";

import { useState } from "react";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { SandpackPreview } from "@/components/SandpackPreview";
import { WireframeEditor } from "@/components/WireframeEditor";
import { DesignConceptEditor } from "@/components/DesignConceptEditor";
import { GitHubExport } from "@/components/GitHubExport";

async function* readStream(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    // In SSE streams, messages are formatted like "data: {...}\n\n"
    // Together API's Kimi implementation via OpenAI standard sometimes returns 'data: {"choices": [{"delta": {"content": "..."}}]}'
    const parts = text.split("\\n");
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      
      if (trimmed.startsWith("data: ")) {
        try {
          const jsonStr = trimmed.substring(6);
          if (jsonStr === "[DONE]") continue;
          yield JSON.parse(jsonStr);
        } catch (error) {
          console.warn("Failed to parse JSON chunk", trimmed, error);
        }
      }
    }
  }
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [wireframe, setWireframe] = useState("");
  const [designConcept, setDesignConcept] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setGeneratedCode("");

    try {
      const res = await fetch("/api/generateCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, wireframe, designConcept }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate code");
      }

      for await (const chunk of readStream(res)) {
        // OpenAI format stream (Together AI mostly mimics this structure for Kimi streams)
        const content = chunk.choices?.[0]?.delta?.content || "";
        if (content) {
          setGeneratedCode((prev) => prev + content);
        } else if (chunk.choices?.[0]?.text) {
           // Fallback for legacy Together format
           setGeneratedCode((prev) => prev + chunk.choices[0].text);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate application. Please check console & API Key.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 flex flex-col xl:flex-row gap-8">
      
      {/* Left Sidebar Layout */}
      <div className="w-full xl:w-[400px] flex-shrink-0 flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center border border-zinc-200">
              <Sparkles className="text-zinc-900" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-br from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
              CLARITIY
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">
            Describe the web app you want to build and watch it render in real-time.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build me a sleek calculator app..."
              required
              className="w-full bg-white border border-zinc-200 rounded-xl p-4 pr-12 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all shadow-sm min-h-[140px] resize-y"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt}
              className="absolute right-3 bottom-3 p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-zinc-900 transition-colors shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
            </button>
          </div>

          <WireframeEditor wireframe={wireframe} setWireframe={setWireframe} />
          <DesignConceptEditor designConcept={designConcept} setDesignConcept={setDesignConcept} />
        </form>

        <div className="mt-auto hidden xl:block">
           <GitHubExport code={generatedCode} />
        </div>
      </div>

      {/* Right Canvas Layout */}
      <div className="flex-1 min-h-[60vh] xl:min-h-0 bg-zinc-50 border border-zinc-200 rounded-3xl p-2 md:p-6 shadow-md relative flex flex-col">
          {!generatedCode && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center border-2 border-dashed border-zinc-300 rounded-2xl">
              <Code2 size={48} className="mb-4 text-zinc-400 opacity-50" />
              <h2 className="text-lg font-medium text-zinc-600 mb-2">Awaiting Instructions</h2>
              <p className="text-sm max-w-sm">
                Simply describe your vision, and watch CLARITIY architect and render a production-ready application in real-time.
              </p>
            </div>
          ) : (
            <div className="flex-1 h-full w-full relative z-10 transition-all duration-500">
               <SandpackPreview code={generatedCode} />
            </div>
          )}
      </div>

      {/* Mobile Github Export (bottom) */}
      <div className="xl:hidden w-full mt-4">
        <GitHubExport code={generatedCode} />
      </div>

    </main>
  );
}
