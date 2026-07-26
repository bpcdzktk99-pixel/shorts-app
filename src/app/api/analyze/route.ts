import { NextResponse } from 'next/server';

// 爆紅演算法核心 (真實計算版)
function calculateViralScore(views: number, likes: number, comments: number, publishedAt: string) {
  const hoursSincePublished = Math.max((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60), 1);
  const velocity = views / hoursSincePublished;
  const engagementRate = views > 0 ? (likes + comments) / views : 0;
  
  const rawScore = velocity * (1 + engagementRate);
  return Math.min(Math.round((rawScore / 10000) * 100), 100); 
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '橘貓';
  
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === '你的_YouTube_API_金鑰放這裡') {
    return NextResponse.json({ error: '請先在 .env.local 設定 YOUTUBE_API_KEY' }, { status: 400 });
  }

  try {
    // 1. 搜尋 YouTube 影片 (利用 #shorts 與 short 參數鎖定短影音)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query + ' #shorts')}&type=video&videoDuration=short&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
       return NextResponse.json({ error: '找不到相關影片' }, { status: 404 });
    }

    // 收集找到的影片 ID
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // 2. 獲取真實的觀看數、按讚數與留言數
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    // 3. 處理數據並計算爆紅分數
    const videos = statsData.items.map((item: any) => {
      const views = parseInt(item.statistics.viewCount || '0');
      const likes = parseInt(item.statistics.likeCount || '0');
      const comments = parseInt(item.statistics.commentCount || '0');
      const publishedAt = item.snippet.publishedAt;
      
      const hours = Math.max((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60), 1);
      const velocity = Math.round(views / hours);
      const commentRate = views > 0 ? ((comments / views) * 100).toFixed(2) + '%' : '0%';
      const score = calculateViralScore(views, likes, comments, publishedAt);

      return {
        id: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        views: views > 10000 ? (views / 10000).toFixed(1) + '萬' : views.toString(),
        velocity: velocity > 10000 ? (velocity / 10000).toFixed(1) + '萬/小時' : velocity + '/小時',
        commentRate: commentRate,
        score: score,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        rawViews: views,
        rawVelocity: velocity
      };
    });

    // 依觀看速度排序
    videos.sort((a: any, b: any) => b.rawVelocity - a.rawVelocity);

    // 4. 動態生成 AI 分析報告
    const topViral = videos.slice(0, 3).map((v: any) => ({
      title: v.title.substring(0, 15) + '...',
      rating: v.score > 80 ? '★★★★★' : '★★★★☆'
    }));

    const takingOffVideo = videos.find((v: any) => v.rawViews < 500000 && v.rawVelocity > 50) || videos[0];

    const aiResponse = {
      keyword: query,
      totalFound: searchData.pageInfo?.totalResults ? searchData.pageInfo.totalResults.toLocaleString() : "1,000+",
      aiSummary: {
        viral: topViral,
        takingOff: {
          title: takingOffVideo.title.substring(0, 20) + '...',
          views: takingOffVideo.views,
          insight: `目前觀看速度達 ${takingOffVideo.velocity}，演算法判定極具潛力！`
        }
      },
      videos: videos
    };

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '獲取 YouTube 資料失敗' }, { status: 500 });
  }
}
