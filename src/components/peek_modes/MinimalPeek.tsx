import React from "react";
import { SearchEntry, LiveTypingData } from "../../types";

interface MinimalPeekProps {
  latestSearch: SearchEntry | null;
  liveTyping: LiveTypingData | null;
}

export const MinimalPeek: React.FC<MinimalPeekProps> = ({ latestSearch, liveTyping }) => {
  const isTyping = liveTyping && liveTyping.query.trim().length > 0;
  const word = isTyping ? liveTyping.query : latestSearch?.query || "---";

  return (
    <div className="min-h-[75vh] bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 mb-8 font-mono">
        {isTyping ? "• AO VIVO •" : "SECRET PEEK"}
      </div>

      <div className="w-full max-w-xl">
        <h1
          className={`font-mono font-bold tracking-tight uppercase break-words transition-all duration-150 ${
            isTyping
              ? "text-5xl sm:text-7xl text-amber-400 animate-pulse"
              : word === "---"
              ? "text-4xl sm:text-5xl text-neutral-800"
              : "text-5xl sm:text-7xl text-white"
          }`}
        >
          {word}
        </h1>
      </div>

      <div className="mt-12 text-[10px] text-neutral-700 font-mono">
        {latestSearch ? new Date(latestSearch.timestamp).toLocaleTimeString() : ""}
      </div>
    </div>
  );
};
