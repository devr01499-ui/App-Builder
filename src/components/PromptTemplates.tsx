"use client";

import { Layout, CreditCard, Calculator, PieChart, ShoppingBag, Terminal } from "lucide-react";

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
}

const TEMPLATES = [
  {
    title: "SaaS Dashboard",
    prompt: "Create a modern SaaS dashboard with a sidebar, summary cards (revenue, users, conversion), and a beautiful line chart using CSS/SVG. Use a clean white aesthetic.",
    icon: <Layout className="text-blue-500" size={18} />,
  },
  {
    title: "Pricing Page",
    prompt: "Design a high-conversion pricing page with 3 tiers (Basic, Pro, Enterprise), specific feature lists, and a highlighted 'Most Popular' center card.",
    icon: <CreditCard className="text-emerald-500" size={18} />,
  },
  {
    title: "Dark Finance",
    prompt: "Build a dark-themed cryptocurrency tracker with real-time style updates, coin lists (BTC, ETH), and interactive-looking balance cards.",
    icon: <PieChart className="text-purple-500" size={18} />,
  },
  {
    title: "Quick Calc",
    prompt: "A sleek, neumorphic calculator app with glassmorphism effects and complex operations support.",
    icon: <Calculator className="text-orange-500" size={18} />,
  },
  {
    title: "E-com Product",
    prompt: "A minimalist product detail page with image gallery thumbnails, size selector, and a sticky 'Add to Cart' bar.",
    icon: <ShoppingBag className="text-rose-500" size={18} />,
  },
  {
    title: "Developer Bio",
    prompt: "A developer portfolio landing page with a terminal-style hero section, project grid, and tech stack icons.",
    icon: <Terminal className="text-slate-500" size={18} />,
  },
];

export function PromptTemplates({ onSelect }: PromptTemplatesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {TEMPLATES.map((template) => (
        <button
          key={template.title}
          onClick={() => onSelect(template.prompt)}
          className="flex items-center space-x-3 p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-400 hover:shadow-sm transition-all text-left group"
        >
          <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-white transition-colors">
            {template.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 leading-none">{template.title}</h4>
          </div>
        </button>
      ))}
    </div>
  );
}
