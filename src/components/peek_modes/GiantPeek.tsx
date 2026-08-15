import React from "react";
import { SearchEntry, LiveTypingData } from "../../types";
import { Zap, Clock, Smartphone, Sparkles } from "lucide-react";

interface GiantPeekProps {
  latestSearch: SearchEntry | null;
  liveTyping: LiveTypingData | null;
}

export const GiantPeek: React.FC<GiantPeekProps> = ({ latestSearch, liveTyping }) => {
  const isTypingNow = liveTyping && liveTyping.query.trim().length > 0;
  const activeWord = isTypingNow ? liveTyping.query : latestSearch?.query || "Aguardando espectador...";

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 10) return "Agora mesmo";
    if (seconds < 60) return `Há ${seconds} segundos`;
    const minutes = Math.floor(seconds / 60);
    return `Há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center select-none">
      {/* Live Badge */}
      <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-sm">
        {isTypingNow ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Zap size={13} /> Digitando em tempo real
            </span>
          </>
        ) : latestSearch ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles size={13} /> Pesquisa Capturada
            </span>
          </>
        ) : (
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Clock size={13} /> Pronto para captura
          </span>
        )}
      </div>

      {/* Main Secret Display Box */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-80" />

        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">
          {isTypingNow ? "O que o espectador está digitando:" : "Termo Revelado"}
        </p>

        <div className="min-h-[140px] flex items-center justify-center">
          <h1
            className={`font-black tracking-tight break-words transition-all duration-200 ${
              isTypingNow
                ? "text-4xl sm:text-6xl text-amber-300 animate-pulse"
                : latestSearch
                ? "text-4xl sm:text-6xl lg:text-7xl text-emerald-400"
                : "text-2xl sm:text-3xl text-slate-600 font-normal italic"
            }`}
          >
            {activeWord}
            {isTypingNow && <span className="inline-block w-1 h-10 ml-2 bg-amber-400 animate-bounce align-middle" />}
          </h1>
        </div>

        {/* Metadata Footer */}
        {latestSearch && !isTypingNow && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-slate-500" />
              <span>{latestSearch.device || "Dispositivo móvel"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <span>{formatTime(latestSearch.timestamp)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Helper Tip */}
      <p className="mt-6 text-xs text-slate-500 max-w-md">
        Dica: Você pode esconder a tela do celular na mesa ou usar fone de ouvido bluetooth com o leitor de voz ativado.
      </p>
    </div>
  );
};
