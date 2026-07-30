"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Flame, TrendingUp, Zap, Sliders, Search, Download, KeyRound } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "貓咪";

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [timeRange, setTimeRange] = useState("15d");
  const [minViews, setMinViews] = useState(100000);
  const [maxSeconds, setMaxSeconds] = useState(999999);
  const [videoType, setVideoType] = useState("all");
  const [sortPopular, setSortPopular] = useState(true);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMsg("");

    fetch(`/api/analyze?q=${encodeURIComponent(query)}&time=${timeRange}&minViews=${minViews}&maxSeconds=${maxSeconds}&sortPopular=${sortPopular}&type=${videoType}&apiKey=${apiKeyInput}`)
      .then((res) => res.json())
      .then((apiData) => {
        if (isMounted) {
          if (apiData.error) {
            setErrorMsg(apiData.error);
            setData(null);
          } else {
            setData(apiData || {});
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Fetch error:", err);
          setErrorMsg("系統發生錯誤，無法連線 API");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query, timeRange, minViews, maxSeconds, sortPopular, videoType]);

  const exportToExcel = () => {
    if (!data?.videos || data.videos.length === 0) {
      alert("目前沒有影片可以匯出喔！");
      return;
    }

    let csvContent = "\uFEFF";
    csvContent += "影片標題,總觀看數,單日平均,發布時間,頻道名稱,搜尋關鍵字,標籤,影片連結\n";

    data.videos.forEach((v: any) => {
      const title = `"${(v.title || "").replace(/"/g, '""')}"`;
      const views = v.views;
      const dailyAvg = v.dailyAverage;
      const publishedAt = `"${v.publishedAt}"`;
      const channel = `"${(v.channel || "").replace(/"/g, '""')}"`;
      const keyword = v.keyword;
      const tags = `"${(v.tags || []).join(" ")}"`;
      const link = `https://www.youtube.com/watch?v=${v.id}`;

      csvContent += `${title},${views},${dailyAvg},${publishedAt},${channel},${keyword},${tags},${link}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `YT爆款分析報告_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between bg-[#1f2937]/90 backdrop-blur sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg font-bold tracking-wider text-white flex items-center gap-2">
            YT爆款搜尋神器 <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white">v3.0 PRO</span>
          </a>
        </div>
        <div className="text-xs text-blue-400 font-bold border border-blue-500/50 bg-blue-900/30 px-3 py-1 rounded-full">
          官方 API 引擎運轉中
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* 左側控制面板 */}
        <div className="lg:col-span-1 bg-[#1f2937] border border-gray-700 rounded-xl p-5 flex flex-col gap-6 shadow-xl sticky top-20">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-gray-700 pb-3">
            <Sliders className="w-4 h-4 text-red-500" /> 搜尋設定
          </div>

          {/* 💡 新增 API Key 區塊 */}
          <div className="flex flex-col gap-2 border border-blue-900/60 bg-blue-900/10 p-3 rounded-lg">
            <label className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
              <KeyRound className="w-3 h-3" /> YouTube API Key
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="留空則預設讀取 .env.local"
              className="w-full bg-[#111827] text-xs rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            />
            <span className="text-[10px] text-gray-400">貼上你的 API 金鑰以啟動翻頁超能力</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-300 font-medium">輸入關鍵字</label>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="例: ai, cute, cat"
              className="w-full bg-[#111827] text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-red-500 text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-300 font-medium text-red-400">影片類型</label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              className="w-full bg-[#111827] text-sm rounded-lg px-3 py-2 border border-gray-600 text-white focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">不限 (長影片 + Shorts)</option>
              <option value="video">一般長影片 (&gt; 180秒)</option>
              <option value="shorts">專屬 Shorts (≤ 180秒)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>往前回幾天</span>
              <span className="font-bold text-red-400">{timeRange.replace('d', '')} 天</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={parseInt(timeRange)}
              onChange={(e) => setTimeRange(e.target.value + "d")}
              className="accent-red-500 cursor-pointer"
            />
          </div>

          <div className="border-t border-gray-700 pt-4 flex flex-col gap-4">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> 篩選規則
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-300">總觀看至少這個數</label>
              <input
                type="number"
                value={minViews}
                onChange={(e) => setMinViews(Number(e.target.value))}
                className="w-full bg-[#111827] text-xs rounded-lg px-3 py-2 border border-gray-600 text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sortPopular}
                onChange={(e) => setSortPopular(e.target.checked)}
                className="accent-red-500 rounded"
              />
              先挑人氣高的影片
            </label>
          </div>

          <button
            onClick={() => setQuery(queryInput)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
          >
            <Search className="w-4 h-4" /> 開始找影片
          </button>
        </div>

        {/* 右側結果區 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-md flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-xs text-gray-400">分析摘要</div>
                <div className="text-sm font-bold text-white">
                  {errorMsg ? <span className="text-red-400">{errorMsg}</span> : (data?.aiAnalysis?.risingTrend || "準備就緒")}
                </div>
              </div>
            </div>
            
            {!errorMsg && (
              <div className="flex items-center gap-2">
                <div className="text-xs bg-[#111827] px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hidden sm:block">
                  找到影片：<span className="text-red-400 font-bold">{data?.videos?.length || 0} 部</span>
                </div>
                <button 
                  onClick={exportToExcel}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors border border-blue-500 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> 另存結果 (Excel)
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div className="bg-[#1f2937] h-80 rounded-xl animate-pulse border border-gray-700 flex items-center justify-center text-gray-500 text-xs" key={n}>
                  翻頁過濾中...
                </div>
              ))}
            </div>
          ) : errorMsg ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl text-gray-400">
               <KeyRound className="w-12 h-12 mb-4 text-gray-600" />
               <p>{errorMsg}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.videos?.map((video: any, index: number) => (
                <a
                  key={video.id || index}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1f2937] border border-gray-700 rounded-xl overflow-hidden flex flex-col group hover:border-red-500 transition-all cursor-pointer block shadow-lg"
                >
                  <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden border-b border-gray-700">
                    <img 
                      src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                      {video.duration || "0:30"}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <h4 className="text-xs font-semibold text-gray-100 line-clamp-2 group-hover:text-red-400 transition-colors h-8">
                      {video.title}
                    </h4>
                    <div className="flex flex-col gap-1 text-[11px] text-gray-400 mt-1 bg-[#111827] p-2 rounded-lg border border-gray-800">
                      <div className="flex justify-between">
                        <span>🔥 觀看數:</span>
                        <span className="font-bold text-white">{Number(video.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📊 單日平均:</span>
                        <span className="font-bold text-red-400">{Number(video.dailyAverage || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📅 發布:</span>
                        <span className="text-gray-300">{video.publishedAt}</span>
                      </div>
                      <div className="flex justify-between truncate items-center">
                        <span>👤 頻道:</span>
                        <span className="text-blue-400 truncate max-w-[90px] text-right">{video.channel}</span>
                      </div>
                      
                      <div className="flex justify-between items-start mt-0.5 border-t border-gray-700/50 pt-1.5">
                        <span className="shrink-0">🏷️ 標籤:</span>
                        <div className="flex flex-wrap justify-end gap-1 pl-2">
                          {video.tags?.map((tag: string, i: number) => (
                            <span key={i} className="bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wider">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">載入中...</div>}>
      <SearchContent />
    </Suspense>
  );
}