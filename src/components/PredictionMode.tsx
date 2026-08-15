import React, { useEffect, useState, useRef } from "react";
import { SearchEntry, MagicConfig } from "../types";
import { Mic, Camera, Search, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

interface PredictionModeProps {
  sessionId?: string;
  onOpenMagician?: () => void;
}

export const PredictionMode: React.FC<PredictionModeProps> = ({
  sessionId = "default",
  onOpenMagician,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<MagicConfig>({
    redirectDomain: "www.google.com",
    theme: "light",
    fakeLocation: "Brasil",
    predictionTarget: "images",
    predictionDelay: 0,
    predictionStyle: "google_wait",
  });
  const [statusText, setStatusText] = useState<string>("Aguardando pensamento...");
  const [hasTriggered, setHasTriggered] = useState(false);
  const [capturedQuery, setCapturedQuery] = useState<string | null>(null);

  // Secret tap counter to exit to magician mode
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<any>(null);

  // Mount timestamp to avoid auto-triggering on past searches
  const initialLoadTimeRef = useRef<number>(Date.now());
  const initialLatestIdRef = useRef<string | null>(null);

  const executeRedirect = (query: string, targetType: "images" | "web" | "maps" = "images", domain: string = "www.google.com") => {
    setHasTriggered(true);
    setCapturedQuery(query);
    setStatusText(`Previsão confirmada: "${query}"`);

    // Haptic buzz on Phone B if supported
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {}
    }

    let url = `https://${domain}/search?q=${encodeURIComponent(query)}&tbm=isch&udm=2`;
    if (targetType === "web") {
      url = `https://${domain}/search?q=${encodeURIComponent(query)}`;
    } else if (targetType === "maps") {
      url = `https://${domain}/maps/search/${encodeURIComponent(query)}`;
    }

    const delay = config.predictionDelay || 0;
    setTimeout(() => {
      window.location.replace(url);
    }, delay);
  };

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isCancelled = false;

    // Fetch initial snapshot and record current latest search ID
    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/searches");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig((prev) => ({ ...prev, ...data.config }));
          }
          if (data.latest) {
            initialLatestIdRef.current = data.latest.id;
          }
        }
      } catch (err) {
        console.warn("Initial fetch error in prediction mode", err);
      }
    };

    fetchInitial();

    // SSE stream for instant trigger
    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/searches/stream");

        eventSource.onopen = () => {
          if (!isCancelled) setIsConnected(true);
        };

        eventSource.addEventListener("configUpdate", (e) => {
          try {
            const newConfig = JSON.parse(e.data);
            setConfig((prev) => ({ ...prev, ...newConfig }));
          } catch {}
        });

        eventSource.addEventListener("newSearch", (e) => {
          try {
            const newEntry: SearchEntry = JSON.parse(e.data);
            if (isCancelled || hasTriggered) return;

            // Check if this search belongs to the session or is global
            if (
              !sessionId ||
              sessionId === "all" ||
              newEntry.sessionId === sessionId ||
              sessionId === "default"
            ) {
              // Ensure it's a new search occurring after this page loaded
              if (
                newEntry.timestamp >= initialLoadTimeRef.current - 2000 &&
                newEntry.id !== initialLatestIdRef.current
              ) {
                executeRedirect(newEntry.query, config.predictionTarget || "images", config.redirectDomain);
              }
            }
          } catch (err) {
            console.error("Error processing SSE newSearch in PredictionMode", err);
          }
        });

        eventSource.onerror = () => {
          if (!isCancelled) setIsConnected(false);
          eventSource?.close();
          setTimeout(() => {
            if (!isCancelled) connectSSE();
          }, 3000);
        };
      } catch (err) {
        console.error("SSE connection error in prediction mode", err);
      }
    };

    connectSSE();

    // Polling fallback every 1.5s
    const interval = setInterval(async () => {
      if (hasTriggered || isCancelled) return;
      try {
        const res = await fetch("/api/searches");
        if (res.ok) {
          const data = await res.json();
          if (data.latest && data.latest.id !== initialLatestIdRef.current) {
            if (data.latest.timestamp >= initialLoadTimeRef.current - 2000) {
              executeRedirect(data.latest.query, config.predictionTarget || "images", config.redirectDomain);
            }
          }
        }
      } catch {}
    }, 1500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [sessionId, config.predictionTarget, config.redirectDomain, config.predictionDelay, hasTriggered]);

  const handleSecretTripleTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      if (onOpenMagician) onOpenMagician();
      else window.location.hash = "peek";
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col justify-between font-sans select-none overflow-x-hidden">
      {/* Discreet Header */}
      <header className="flex justify-between items-center px-4 py-3 sm:px-6 text-sm text-[#5f6368]">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-medium text-[#1a73e8] border-b-2 border-[#1a73e8] pb-0.5">
            Imagens
          </span>
          <span className="hover:text-[#202124] cursor-pointer">Todas</span>
          <span className="hover:text-[#202124] cursor-pointer hidden sm:inline">Vídeos</span>
          <span className="hover:text-[#202124] cursor-pointer hidden sm:inline">Notícias</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Secret connection dot */}
          <div
            title={isConnected ? "Previsão Armada e Conectada" : "Conectando..."}
            className="flex items-center gap-1.5"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`}
            />
          </div>

          <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-xs shadow-sm">
            G
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
        {/* Google Logo with subtle Images tag */}
        <div className="relative mb-6 flex flex-col items-center">
          <img
            src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
            alt="Google"
            className="w-44 sm:w-64 h-auto select-none pointer-events-none drop-shadow-sm"
          />
          <span className="text-[#4285f4] text-xs sm:text-sm font-medium tracking-wide self-end -mt-3 mr-1">
            imagens
          </span>
        </div>

        {/* Realistic Search Bar */}
        <div className="w-full max-w-xl">
          <div className="flex items-center w-full px-4 py-3 rounded-full border border-[#dfe1e5] hover:border-transparent hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] bg-white transition-all">
            <Search size={18} className="text-[#9aa0a6] mr-3 shrink-0" />
            
            <div className="flex-1 flex items-center">
              {hasTriggered ? (
                <span className="text-base text-[#202124] font-normal animate-fade-in">
                  {capturedQuery}
                </span>
              ) : (
                <div className="flex items-center text-[#70757a] text-sm sm:text-base">
                  <span>Pesquisar imagens</span>
                  <span className="w-0.5 h-4 bg-[#1a73e8] ml-1 animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-[#5f6368] shrink-0 ml-2">
              <Mic size={18} className="text-[#4285f4] cursor-pointer" />
              <Camera size={18} className="text-[#4285f4] cursor-pointer" />
            </div>
          </div>

          {/* Standby indicator */}
          <div className="mt-8 flex flex-col items-center text-center">
            {hasTriggered ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-pulse">
                <RefreshCw size={13} className="animate-spin" />
                <span>Carregando resultados da previsão...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-3">
                  <button className="bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-xs px-4 py-2 rounded text-xs sm:text-sm text-[#3c4043]">
                    Pesquisa Google
                  </button>
                  <button className="bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-xs px-4 py-2 rounded text-xs sm:text-sm text-[#3c4043]">
                    Estou com sorte
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f2f2f2] text-[#70757a] text-xs sm:text-sm border-t border-[#dadce0]">
        <div
          onClick={handleSecretTripleTap}
          className="px-6 py-3 border-b border-[#dadce0] cursor-pointer active:text-[#202124] transition flex justify-between items-center"
        >
          <span>{config.fakeLocation || "Brasil"}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isConnected ? "● online" : "○ conectando"}
          </span>
        </div>
        <div className="px-6 py-3 flex flex-wrap justify-between items-center gap-y-2">
          <div className="flex gap-4 sm:gap-6">
            <span>Sobre</span>
            <span>Publicidade</span>
            <span>Negócios</span>
            <span>Como funciona a Pesquisa</span>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <span>Privacidade</span>
            <span>Termos</span>
            <span>Configurações</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
