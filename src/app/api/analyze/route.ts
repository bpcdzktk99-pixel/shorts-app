import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "shorts";
  const timeRange = searchParams.get("time") || "7d";

  // 模擬真實影片資料，並帶入真實的 YouTube 影片 ID 讓連結可以正確開啟
  const mockVideos = [
    {
      id: "dQw4w9WgXcQ", // 替換為實際的 YouTube 影片 ID
      title: "This cat protected its owner again and again. #cat #love #cute #shorts #usa",
      thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60",
      velocity: 9031,
      engagement: 0.0022,
      score: 95,
    },
    {
      id: "jNQXAC9IVRw",
      title: "Sorry cat 🐱 #shorts #cats",
      thumbnail: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=500&auto=format&fit=crop&q=60",
      velocity: 5460,
      engagement: 0.0,
      score: 55,
    },
    {
      id: "3JZ_D3ELwOQ",
      title: "Cute Cat's Funniest Moments 🐱 | Try Not to Laugh! #Shorts",
      thumbnail: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&auto=format&fit=crop&q=60",
      velocity: 4962,
      engagement: 0.0,
      score: 50,
    },
  ];

  return NextResponse.json({
    query,
    timeRange,
    aiAnalysis: {
      totalResults: "1,000,000",
      topViral: [
        "This cat protected its owner...",
        "Sorry cat 🐱...",
        "Cute Cat's Funniest Moments..."
      ],
      risingTrend: "萌寵日常搞笑互動短影音",
    },
    videos: mockVideos,
  });
}