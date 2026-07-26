"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-[#0b0f19]/80 backdrop-blur">
        <div className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
          ViralShorts<span className="text-red-500">.ai</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" /> AI 驅動的短影音爆紅預測引擎
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          洞察下一個 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">百萬流量</span> 短影音
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-xl">
          輸入關鍵字，讓 AI 即時分析演算法趨勢、觀看速度與互動率，精準掌握爆紅密碼。
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-xl flex items-center gap-2 bg-[#161b26] p-2 rounded-2xl border border-gray-800 shadow-2xl focus-within:border-red-500 transition-all">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入主題（例如：貓咪、AI、搞笑、美食...）"
            className="w-full bg-transparent text-sm px-2 py-2 text-white focus:outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
          >
            AI 深度分析
          </button>
        </form>
      </main>

      <footer className="border-t border-gray-800/60 py-6 text-center text-xs text-gray-500">
        ViralShorts.ai © 2026. All rights reserved.
      </footer>
    </div>
  );
}