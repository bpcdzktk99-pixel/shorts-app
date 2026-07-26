"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [query, timeRange]);

  const sortedVideos = [...(data?.videos || [])].sort((a, b) => {
    if (sortBy === "velocity") {
      return b.velocity - a.velocity;
    } else {
      return b.engagement - a.engagement;
    }
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-[#0b0f19]/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <a href="/" className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            ViralShorts<span className="text-red-500">.ai</span>
          </a>
          <div className="relative w-96">
            <input
              type="text"
              defaultValue={query}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/search?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                }
              }}
              className="w-full bg-[#161b26] text-sm rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#161b26] p-1 rounded-lg border border-gray-800">
            {[
              { id: "24h", label: "最近 24 小時" },
              { id: "7d", label: "最近 7 天" },
              { id: "30d", label: "最近 30 天" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === t.id
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#161b26] p-1 rounded-lg border border-gray-800">
            {[
              { id: "velocity", label: "依觀看速度", icon: Zap },
              { id: "engagement", label: "依互動率", icon: MessageCircle },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    sortBy === s.id
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-red-500" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* AI Analysis Sidebar */}
          <div className="lg:col-span-1 bg-[#161b26] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
              <Flame className="w-4 h-4 fill-red-500" />
              AI 趨勢分析
            </div>
            {loading ? (
              <div className="text-xs text-gray-400 animate-pulse">AI 正在深度解析演算法中...</div>
            ) : (
              <div className="flex flex-col gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">搜尋結果</span>
                  <span className="font-bold text-sm text-white">共有 1,000,000 支持符合</span>
                </div>
                <div className="border-t border-gray-800 pt-3">
                  <span className="text-red-400 font-semibold block mb-2 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> 真正爆的是：
                  </span>
                  <ul className="flex flex-col gap-1.5 text-gray-300">
                    {data?.aiAnalysis?.topViral?.map((item: string, idx: number) => (
                      <li key={idx} className="flex justify-between items-center">
                        <span className="truncate pr-2">{idx + 1}. {item}</span>
                        <span className="text-yellow-500">★★★★★</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-gray-800 pt-3">
                  <span className="text-blue-400 font-semibold block mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> 目前開始起飛：
                  </span>
                  <p className="text-gray-300 font-medium">{data?.aiAnalysis?.risingTrend}</p>
                  <span className="text-[10px] text-gray-500 block mt-1">
                    目前觀看速度達標 5474/小時，演算法判定極具潛力！
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Videos Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#161b26] h-72 rounded-xl animate-pulse border border-gray-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedVideos.map((video: any) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
                    }}
                    className="bg-[#161b26] border border-gray-800 rounded-xl overflow-hidden flex flex-col group hover:border-red-500/50 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-red-500 flex items-center gap-1 border border-red-500/30">
                        <Flame className="w-3 h-3 fill-red-500" /> {video.score}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1 justify-between gap-3 pointer-events-none">
                      <h4 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/60 text-[10px]">
                        <div>
                          <span className="text-gray-500 block">速度</span>
                          <span className="font-bold text-gray-300">{video.velocity}/小時</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">互動</span>
                          <span className="font-bold text-gray-300">{(video.engagement * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <SearchContent />;
}