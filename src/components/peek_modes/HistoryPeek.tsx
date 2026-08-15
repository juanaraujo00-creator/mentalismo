import React from "react";
import { SearchEntry } from "../../types";
import { Trash2, Copy, Check, Clock, Smartphone, ExternalLink } from "lucide-react";

interface HistoryPeekProps {
  searches: SearchEntry[];
  onDelete: (id?: string) => void;
}

export const HistoryPeek: React.FC<HistoryPeekProps> = ({ searches, onDelete }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatExactTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR")}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Histórico de Pesquisas</h2>
          <p className="text-xs text-slate-400">Todas as consultas capturadas em apresentações</p>
        </div>
        {searches.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
                onDelete();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-medium rounded-xl transition"
          >
            <Trash2 size={14} /> Limpar Tudo
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-slate-400">Nenhuma pesquisa capturada ainda</p>
          <p className="text-xs text-slate-500 mt-1">
            Abra o link do espectador e faça uma pesquisa no Google falso para testar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 transition hover:border-slate-700 shadow-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <h3 className="text-lg font-bold text-white truncate">{item.query}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-500" />
                    {formatExactTime(item.timestamp)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Smartphone size={12} className="text-slate-500" />
                    {item.device || "Mobile"}
                  </span>
                  {item.sessionId && item.sessionId !== "default" && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {item.sessionId}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(item.query, item.id)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl transition"
                  title="Copiar texto"
                >
                  {copiedId === item.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(item.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl transition"
                  title="Ver no Google"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 bg-slate-800/80 hover:bg-red-900/50 hover:text-red-300 text-slate-400 rounded-xl transition"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
