import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// 輔助函數：解析 YouTube 的時間格式 (PT1M30S -> 秒數)
function parseISO8601Duration(duration: string) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

// 輔助函數：轉換為 MM:SS 顯示格式
function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "貓咪";
  const timeRange = searchParams.get("time") || "15d";
  const minViews = parseInt(searchParams.get("minViews") || "100000");
  const maxSeconds = parseInt(searchParams.get("maxSeconds") || "999999");
  const videoType = searchParams.get("type") || "all";
  const sortPopular = searchParams.get("sortPopular") === "true";
  
  // 優先讀取前端傳來的 API Key，若無則讀取伺服器的環境變數
  const apiKey = searchParams.get("apiKey") || process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "請在左側填寫 YouTube API Key，或設定於 .env.local" }, { status: 400 });
  }

  const days = parseInt(timeRange.replace('d', '')) || 15;
  const publishedAfterDate = new Date();
  publishedAfterDate.setDate(publishedAfterDate.getDate() - days);
  const publishedAfter = publishedAfterDate.toISOString();

  let searchKw = rawQuery;
  if (videoType === "shorts") {
    searchKw += " #shorts";
  }

  let allVideos: any[] = [];
  let seenIds = new Set();
  let pageToken = "";
  let pageCount = 0;
  const TARGET_COUNT = 50; // 🎯 舊版的堅持：不抓滿 50 部不罷休！
  const MAX_PAGES = 10;    // 防呆機制，最多翻 10 頁，避免消耗太多額度

  try {
    while (allVideos.length < TARGET_COUNT && pageCount < MAX_PAGES) {
      pageCount++;
      
      // 1. 呼叫 Search API 取得第一批影片 ID 清單
      let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(searchKw)}&type=video&publishedAfter=${encodeURIComponent(publishedAfter)}&key=${apiKey}`;
      if (pageToken) searchUrl += `&pageToken=${pageToken}`;
      
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.error) {
         return NextResponse.json({ error: searchData.error.message }, { status: 400 });
      }

      const items = searchData.items || [];
      if (items.length === 0) break; // 已經沒有下一頁了，提早結束

      const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean);
      
      // 2. 呼叫 Videos API 取得詳細觀看數與影片長度
      if (videoIds.length > 0) {
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
        const videoRes = await fetch(videoUrl);
        const videoData = await videoRes.json();
        const vItems = videoData.items || [];
        
        for (const v of vItems) {
          if (allVideos.length >= TARGET_COUNT) break; // 已經抓滿 50 部了！
          if (seenIds.has(v.id)) continue; // 防重複機制

          const durationSec = parseISO8601Duration(v.contentDetails.duration);
          const views = parseInt(v.statistics.viewCount || "0");

          // 🎯 嚴格審查機制 (無情過濾)
          if (views < minViews) continue;
          if (durationSec > maxSeconds) continue;
          
          let passType = true;
          if (videoType === "shorts" && durationSec > 180) passType = false;
          if (videoType === "video" && durationSec <= 180) passType = false;
          if (!passType) continue;

          // 計算單日平均
          const pubDate = new Date(v.snippet.publishedAt);
          const now = new Date();
          const daysDiff = Math.max(1, Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24)));
          const dailyAverage = Math.floor(views / daysDiff);
          const tags = v.snippet.tags ? v.snippet.tags.slice(0, 5) : [];

          // 審查通過，存入寶箱！
          allVideos.push({
            id: v.id,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
            views: views,
            dailyAverage: dailyAverage,
            duration: formatDuration(durationSec),
            durationSec: durationSec,
            publishedAt: v.snippet.publishedAt.slice(0, 10),
            channel: v.snippet.channelTitle,
            keyword: rawQuery,
            tags: tags
          });
          seenIds.add(v.id);
        }
      }

      // 取得下一頁門票，繼續翻頁
      pageToken = searchData.nextPageToken;
      if (!pageToken) break; 
    }

    if (sortPopular) {
      allVideos.sort((a, b) => b.views - a.views);
    }

    return NextResponse.json({
      aiAnalysis: {
        risingTrend: `已翻越 ${pageCount} 頁，成功為您萃取 ${allVideos.length} 部爆款影片！`
      },
      videos: allVideos
    });

  } catch (error: any) {
    return NextResponse.json({ error: "抓取失敗，請檢查 API Key 額度或正確性" }, { status: 500 });
  }
}