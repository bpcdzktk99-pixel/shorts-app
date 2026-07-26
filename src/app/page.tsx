{sortedVideos.map((video: any) => (
  <a
    key={video.id}
    href={`https://www.youtube.com/watch?v=${video.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-[#161b26] border border-gray-800 rounded-xl overflow-hidden flex flex-col group hover:border-red-500/50 transition-all cursor-pointer block relative"
  >
    <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden pointer-events-none">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
  </a>
))}