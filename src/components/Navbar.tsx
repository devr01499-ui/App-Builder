"use client";

import { Sparkles, Layout, Terminal, Plus } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">CLARITIY</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="#" 
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              Gallery
            </Link>
            <Link 
              href="#" 
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={16} />
            <span>New App</span>
          </button>
          
          <a 
            href="https://github.com/devr01499-ui/App-Builder" 
            target="_blank" 
            rel="noreferrer"
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Terminal size={20} />
          </a>
        </div>
      </div>
    </nav>
  );
}
