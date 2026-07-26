"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Flame, TrendingUp, MessageCircle, Zap } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [timeRange, setTimeRange] = useState("7d");
  const [sortBy, setSortBy] = useState("velocity");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analyze?q=${encodeURIComponent(query)}&time=${timeRange}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [query, timeRange]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Viral<span className="text-red-500">Shorts</span>.ai
          </Link>
          <div className="flex-1 w-full flex items-center bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 focus-within:border-red-500 transition-all">
            <input type="text" defaultValue={query} className="w-full bg-transparent outline-none text-white placeholder-gray-500" placeholder="搜尋題材..." />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="flex gap-2">
            {[ { id: '24h', label: '最近 24 小時' }, { id: '7d', label: '最近 7 天' }, { id: '30d', label: '最近 30 天' } ].map(t => (
              <button key={t.id} onClick={() => setTimeRange(t.id)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === t.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSortBy('velocity')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === 'velocity' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              <TrendingUp size={16} /> 依觀看速度
            </button>
            <button onClick={() => setSortBy('comments')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === 'comments' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              <MessageCircle size={16} /> 依留言率
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-red-500 animate-pulse font-bold text-xl">AI 分析中...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} /> AI 趨勢分析
                </h3>
                
                <div className="space-y-6 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">搜尋結果</p>
                    <p className="text-2xl font-black text-white">共有 {data.totalFound} 支符合</p>
                  </div>
                  
                  <div className="bg-gray-950/50 p-4 rounded-lg border border-gray-800">
                    <p className="text-red-400 font-bold mb-2 flex items-center gap-2"><Flame size={16}/> 真正爆的是：</p>
                    <ul className="space-y-2">
                      {data.aiSummary.viral.map((v:any, i:number) => (
                        <li key={i} className="flex justify-between items-center text-gray-300">
                          <span>{i+1}. {v.title}</span>
                          <span className="text-yellow-500 text-xs">{v.rating}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50">
                    <p className="text-blue-400 font-bold mb-2 flex items-center gap-2"><TrendingUp size={16}/> 目前開始起飛：</p>
                    <p className="text-white font-medium">{data.aiSummary.takingOff.title}</p>
                    <p className="text-gray-400 text-xs mt-1">目前 {data.aiSummary.takingOff.views} 觀看</p>
                    <p className="text-blue-300 font-bold mt-2">{data.aiSummary.takingOff.insight}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.videos.map((video: any) => (
                  <div key={video.id} className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all group cursor-pointer border border-gray-800">
                    <div className="relative aspect-[9/16] bg-gray-800 overflow-hidden">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                        <Flame size={12} /> {video.score}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{video.title}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-800 p-2 rounded text-gray-400">速度<br/><span className="text-white font-semibold">{video.velocity}</span></div>
                        <div className="bg-gray-800 p-2 rounded text-gray-400">互動<br/><span className="text-white font-semibold">{video.commentRate}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-500 font-bold text-xl">載入中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
