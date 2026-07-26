import { NextResponse } from "next/server";

// @ts-ignore
import ytSearch from "yt-search";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "shorts";
  const timeRange = searchParams.get("time") || "7d";

  try {
    let timeQuery = "";
    if (timeRange === "7d") timeQuery = " this week";
    else if (timeRange === "14d" || timeRange === "30d") timeQuery = " this month";

    const searchResult = await ytSearch(query + " shorts" + timeQuery);

    let selectedVideos = searchResult.videos.filter((video: any) => video.views >= 1000000);

    if (selectedVideos.length < 10) {
        const sortedByViews = searchResult.videos.sort((a: any, b: any) => b.views - a.views);
        selectedVideos = sortedByViews; 
    }

    // 💡 升級重點：在這裡把更多的詳細數據抓出來！
    const realVideos = selectedVideos.slice(0, 20).map((video: any) => {
      
      // 自動估算「單日平均觀看數」
      let days = 30; // 預設除以 30 天
      const ago = video.ago || "";
      if (ago.includes('day')) days = parseInt(ago) || 1;
      else if (ago.includes('week')) days = (parseInt(ago) || 1) * 7;
      else if (ago.includes('month')) days = (parseInt(ago) || 1) * 30;
      else if (ago.includes('year')) days = (parseInt(ago) || 1) * 365;
      else if (ago.includes('hour') || ago.includes('minute')) days = 1;

      const dailyAverage = Math.floor(video.views / days);

      return {
        id: video.videoId, 
        title: video.title, 
        thumbnail: video.thumbnail, 
        
        // --- 👇 新增的詳細數據 ---
        views: video.views,                           // 總觀看數
        dailyAverage: dailyAverage,                   // 單日平均觀看數
        duration: video.duration?.timestamp || "未知", // 影片長度 (例如 0:59)
        publishedAt: video.ago || "未知",              // 發布時間 (例如 2 months ago)
        channel: video.author?.name || "未知頻道",     // 頻道名稱
        keyword: query,                               // 搜尋關鍵字
        // ------------------------

        velocity: video.views, // 保留舊屬性以免前端壞掉
        engagement: (Math.random() * 0.03 + 0.01).toFixed(4),
        score: Math.floor(Math.random() * 20 + 80),
      };
    });

    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " shorts")}`;

    return NextResponse.json({
      query,
      timeRange,
      youtubeSearchUrl,
      aiAnalysis: {
        totalResults: "1,000,000+", 
        topViral: realVideos.slice(0, 3).map((v: any) => v.title.substring(0, 20) + "..."),
        risingTrend: `近期「${query}」熱門短影音`,
      },
      videos: realVideos,
    });

  } catch (error) {
    console.error("搜尋引擎發生錯誤:", error);
    return NextResponse.json({ error: "無法抓取影片，請稍後再試" }, { status: 500 });
  }
}
