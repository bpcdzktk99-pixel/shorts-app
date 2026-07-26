"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          Shorts <span className="text-red-500">Analyzer</span>
        </h1>
        
        <form onSubmit={handleSearch} className="relative w-full shadow-2xl rounded-full overflow-hidden flex bg-gray-800 border border-gray-700 focus-within:border-red-500 transition-all">
          <input
            type="text"
            className="w-full py-4 pl-6 pr-4 outline-none text-lg text-white bg-transparent placeholder-gray-400"
            placeholder="輸入 Shorts 關鍵字或頻道名稱..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="px-8 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
            搜尋
          </button>
        </form>
      </div>
    </main>
  );
}