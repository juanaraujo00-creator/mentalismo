import React from "react";
import { SearchEntry, LiveTypingData } from "../../types";
import { Plus, Search, CheckCircle2, ChevronRight, Share, Edit3 } from "lucide-react";

interface NotesPeekProps {
  searches: SearchEntry[];
  latestSearch: SearchEntry | null;
  liveTyping: LiveTypingData | null;
}

export const NotesPeek: React.FC<NotesPeekProps> = ({ searches, latestSearch, liveTyping }) => {
  const isTyping = liveTyping && liveTyping.query.trim().length > 0;
  const secretTerm = isTyping ? liveTyping.query : latestSearch?.query || "Café, água com gás e caderno";

  const staticDummyNotes = [
    { title: "Lista de compras feira", time: "Ontem", preview: "Tomates, banana prata, ovos caipira, azeite..." },
    { title: "Ideias para o show", time: "Segunda-feira", preview: "Abertura com baralho bicycle, mentalismo e final com corda." },
    { title: "Endereço do estúdio", time: "12 de Agosto", preview: "Av. Paulista 1000 - Cj 42 - Bloco B" },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[75vh] select-none">
      {/* Camouflaged iOS Notes App Container */}
      <div className="w-full max-w-[360px] bg-[#1c1c1e] text-white rounded-[36px] p-5 shadow-2xl border border-[#2c2c2e] font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between text-[#e5a00d] text-sm mb-4 px-1">
          <span className="flex items-center gap-1 cursor-pointer">
            <span className="text-lg">‹</span> Pastas
          </span>
          <div className="flex items-center gap-4 text-white">
            <Share size={18} className="text-[#e5a00d]" />
            <Edit3 size={18} className="text-[#e5a00d]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white px-1 mb-3">Notas</h2>

        {/* Search Bar */}
        <div className="bg-[#2c2c2e] rounded-xl px-3 py-1.5 flex items-center gap-2 mb-4 text-xs text-neutral-400">
          <Search size={14} />
          <span>Buscar notas...</span>
        </div>

        {/* Notes List */}
        <div className="bg-[#2c2c2e] rounded-2xl overflow-hidden divide-y divide-[#3a3a3c]">
          
          {/* Secret Note Item (Holding the Peek) */}
          <div className="p-3.5 hover:bg-[#323234] transition cursor-pointer relative group">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e5a00d]"></span>
                {isTyping ? "Digitando..." : "Lembrete Prioritário"}
              </h3>
              <span className="text-[10px] text-neutral-400">Hoje 09:41</span>
            </div>
            
            {/* The secret word sits naturally as the note body text */}
            <p className="text-xs text-amber-300 font-medium line-clamp-2 leading-relaxed">
              {secretTerm}
            </p>
            {isTyping && <span className="text-[10px] text-amber-400 animate-pulse mt-1 block">Espectador digitando ao vivo...</span>}
          </div>

          {/* Dummy Normal Notes */}
          {staticDummyNotes.map((n, idx) => (
            <div key={idx} className="p-3.5 hover:bg-[#323234] transition cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm text-white">{n.title}</h3>
                <span className="text-[10px] text-neutral-400">{n.time}</span>
              </div>
              <p className="text-xs text-neutral-400 truncate">{n.preview}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[11px] text-neutral-500 flex items-center justify-between px-2">
          <span>{searches.length + 3} Notas</span>
          <Plus size={18} className="text-[#e5a00d]" />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 text-center max-w-xs">
        Camuflagem: Parece um aplicativo de Notas padrão. O termo pesquisado surge naturalmente na primeira nota amarela.
      </p>
    </div>
  );
};
