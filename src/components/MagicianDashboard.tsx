import React, { useState, useEffect, useRef } from "react";
import {
  SearchEntry,
  LiveTypingData,
  MagicianViewMode,
} from "../types";
import { GiantPeek } from "./peek_modes/GiantPeek";
import { CalculatorPeek } from "./peek_modes/CalculatorPeek";
import { NotesPeek } from "./peek_modes/NotesPeek";
import { MinimalPeek } from "./peek_modes/MinimalPeek";
import { HistoryPeek } from "./peek_modes/HistoryPeek";
import { QRCodeModal } from "./QRCodeModal";
import { SmartwatchModal } from "./SmartwatchModal";
import { PredictionQRModal } from "./PredictionQRModal";
import { getPublicAppUrl } from "../utils/urls";
import { triggerHapticFeedback, speakSecretText } from "../utils/magicSignals";
import { requestNotificationPermission, sendPeekNotification } from "../utils/notifications";
import {
  Eye,
  Calculator,
  FileText,
  Clock,
  History,
  QrCode,
  Volume2,
  VolumeX,
  Vibrate,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Send,
  Zap,
  Globe,
  Settings,
  Bell,
  BellOff,
  Watch,
  Check,
  Wand2,
  PenTool,
  BookOpen,
  Download,
} from "lucide-react";

interface MagicianDashboardProps {
  onSwitchToSpectator: () => void;
}

export const MagicianDashboard: React.FC<MagicianDashboardProps> = ({
  onSwitchToSpectator,
}) => {
  const [viewMode, setViewMode] = useState<MagicianViewMode>("giant");
  const [searches, setSearches] = useState<SearchEntry[]>([]);
  const [latestSearch, setLatestSearch] = useState<SearchEntry | null>(null);
  const [liveTyping, setLiveTyping] = useState<LiveTypingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPredictionQrOpen, setIsPredictionQrOpen] = useState(false);
  const [predictionTarget, setPredictionTarget] = useState<"images" | "web" | "maps">("images");
  const [isSmartwatchModalOpen, setIsSmartwatchModalOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [discreetNotification, setDiscreetNotification] = useState(false);
  const [activeSession, setActiveSession] = useState("default");
  const [testSearchInput, setTestSearchInput] = useState("");
  const [lastSpeechId, setLastSpeechId] = useState("");
  const [lastNotifiedId, setLastNotifiedId] = useState("");

  const spectatorUrl = getPublicAppUrl(`?s=${activeSession}`);
  const predictionUrl = getPublicAppUrl(`?s=${activeSession}#previsao`);

  // Check initial notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  // Connect to Real-Time SSE Stream + Polling Fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/searches/stream");

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.addEventListener("snapshot", (e) => {
          try {
            const data = JSON.parse(e.data);
            setSearches(data.searches || []);
            setLatestSearch(data.latest || null);
          } catch (err) {
            console.error("SSE snapshot parse error", err);
          }
        });

        eventSource.addEventListener("liveTyping", (e) => {
          try {
            const data: LiveTypingData = JSON.parse(e.data);
            if (!activeSession || activeSession === "all" || data.sessionId === activeSession) {
              setLiveTyping(data);
            }
          } catch (err) {
            console.error("SSE liveTyping parse error", err);
          }
        });

        eventSource.addEventListener("newSearch", (e) => {
          try {
            const newEntry: SearchEntry = JSON.parse(e.data);
            setSearches((prev) => [newEntry, ...prev.filter((p) => p.id !== newEntry.id)]);
            setLatestSearch(newEntry);
            setLiveTyping(null);

            // Signal feedback: Haptic Vibration
            if (vibrateEnabled) {
              triggerHapticFeedback();
            }

            // Signal feedback: Voice Whisper
            if (audioEnabled && newEntry.id !== lastSpeechId) {
              setLastSpeechId(newEntry.id);
              speakSecretText(`Pesquisa: ${newEntry.query}`);
            }

            // Signal feedback: Smartwatch / Push Notification
            if (notificationsEnabled && newEntry.id !== lastNotifiedId) {
              setLastNotifiedId(newEntry.id);
              sendPeekNotification(newEntry.query, { camouflaged: discreetNotification });
            }
          } catch (err) {
            console.error("SSE newSearch parse error", err);
          }
        });

        eventSource.addEventListener("cleared", (e) => {
          setSearches([]);
          setLatestSearch(null);
          setLiveTyping(null);
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Retry in 3 seconds
          setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        setIsConnected(false);
      }
    };

    connectSSE();

    // Fast backup polling (every 2s) to guarantee updates
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/searches");
        if (res.ok) {
          const data = await res.json();
          setSearches(data.searches || []);
          setLatestSearch(data.latest || null);
          if (data.currentLiveQuery && data.currentLiveQuery[activeSession]) {
            setLiveTyping({
              sessionId: activeSession,
              query: data.currentLiveQuery[activeSession].query,
              timestamp: data.currentLiveQuery[activeSession].timestamp,
            });
          }
          setIsConnected(true);
        }
      } catch {
        // network issue
      }
    }, 2000);

    return () => {
      eventSource?.close();
      clearInterval(pollInterval);
    };
  }, [activeSession, audioEnabled, vibrateEnabled, notificationsEnabled, discreetNotification, lastSpeechId, lastNotifiedId]);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const res = await requestNotificationPermission();
      if (res.granted) {
        setNotificationsEnabled(true);
        sendPeekNotification("Notificações para Smartwatch ativadas com sucesso!", {
          camouflaged: false,
          customTitle: "⌚ Smartwatch Conectado",
        });
      } else {
        // Open guidance modal for iOS or blocked permissions
        setIsSmartwatchModalOpen(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleTestNotification = () => {
    const term = latestSearch?.query || "Pensamento Mágico";
    sendPeekNotification(term, {
      camouflaged: discreetNotification,
    });
  };

  const handleDeleteSearch = async (id?: string) => {
    try {
      await fetch(`/api/searches${id ? `?id=${id}` : ""}`, {
        method: "DELETE",
      });
      if (id) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
        if (latestSearch?.id === id) {
          setLatestSearch(searches.find((s) => s.id !== id) || null);
        }
      } else {
        setSearches([]);
        setLatestSearch(null);
        setLiveTyping(null);
      }
    } catch (err) {
      console.error("Error deleting search", err);
    }
  };

  const handleSimulateTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSearchInput.trim()) return;

    try {
      await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: testSearchInput.trim(),
          sessionId: activeSession,
          isLive: false,
          device: "Teste Simulado",
        }),
      });
      setTestSearchInput("");
    } catch (err) {
      console.error("Error simulating search", err);
    }
  };

  const handleVoiceTest = () => {
    speakSecretText(latestSearch?.query ? `Pesquisa: ${latestSearch.query}` : "Sistema de voz do mágico ativo.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Magician Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Painel do Mágico
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {isConnected ? "Ao Vivo (SSE)" : "Conectando..."}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mentalismo • Espionagem de Busca em Tempo Real
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Smartwatch / Push Notification Toggle */}
            <button
              onClick={handleToggleNotifications}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                notificationsEnabled
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-900/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title={
                notificationsEnabled
                  ? "Notificações para Smartwatch / Celular ATIVAS"
                  : "Ativar Notificações para Smartwatch (Apple Watch / Galaxy Watch / Wear OS)"
              }
            >
              <Watch size={16} />
              <span className="hidden sm:inline">
                {notificationsEnabled ? "Smartwatch Ativo" : "Smartwatch"}
              </span>
            </button>

            {/* Audio Voice Whisper Toggle */}
            <button
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) {
                  speakSecretText("Áudio ativado");
                }
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                audioEnabled
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title={audioEnabled ? "Sussurro por Voz Ligado" : "Ligar Leitor de Voz (AirPods / Fones)"}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{audioEnabled ? "Voz Ativa" : "Voz"}</span>
            </button>

            {/* Haptic Vibration Toggle */}
            <button
              onClick={() => {
                setVibrateEnabled(!vibrateEnabled);
                if (!vibrateEnabled) triggerHapticFeedback([100, 50, 100]);
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                vibrateEnabled
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title="Vibração no Celular ao Receber Busca"
            >
              <Vibrate size={16} />
              <span className="hidden sm:inline">Vibração</span>
            </button>

            {/* QR Code / Share Button for Spectator A */}
            <button
              onClick={() => setIsQrOpen(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl border border-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-950 transition active:scale-95"
              title="Abrir no celular do Espectador A (quem pesquisa)"
            >
              <QrCode size={15} />
              <span>📱 Espectador A</span>
            </button>

            {/* Prediction Mode QR Button for Spectator B */}
            <button
              onClick={() => setIsPredictionQrOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl border border-purple-400/30 flex items-center gap-1.5 shadow-md shadow-purple-950 transition active:scale-95 animate-pulse"
              title="Abrir no celular do Espectador B (onde a foto da previsão vai aparecer automaticamente!)"
            >
              <Wand2 size={15} />
              <span>🔮 Previsão (Celular B)</span>
            </button>

            {/* Drawing Peek App Button */}
            <a
              href={getPublicAppUrl(`?s=${activeSession}#desenho`)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-xs transition active:scale-95"
              title="Abrir App de Desenho / Sketchpad para Peek Secreto (#desenho)"
            >
              <PenTool size={15} className="text-indigo-400" />
              <span>🎨 Desenho</span>
            </a>

            {/* Acronym Wikipedia Mode Button */}
            <a
              href={getPublicAppUrl(`?s=${activeSession}#acronimo`)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-xs transition active:scale-95"
              title="Abrir Modo Acrônimo Wikipédia (3ª letra dos links forma a palavra original) (#acronimo)"
            >
              <BookOpen size={15} className="text-amber-400" />
              <span>📚 Acrônimo</span>
            </a>

            {/* Direct Download ZIP Button */}
            <a
              href="/api/download-zip"
              download="mentalismo-app.zip"
              className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-xs transition active:scale-95"
              title="Baixar todo o código-fonte em arquivo .ZIP para instalar no seu servidor / domínio próprio"
            >
              <Download size={15} className="text-emerald-400" />
              <span>📥 Baixar ZIP</span>
            </a>

            {/* Switch to Spectator Google Clone */}
            <button
              onClick={onSwitchToSpectator}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Abrir Google Falso"
            >
              <Globe size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mode Switcher Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setViewMode("giant")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                viewMode === "giant"
                  ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Eye size={15} />
              Visão Gigante
            </button>

            <button
              onClick={() => setViewMode("calculator")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                viewMode === "calculator"
                  ? "bg-slate-800 text-amber-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Calculator size={15} />
              Calculadora Secreta
            </button>

            <button
              onClick={() => setViewMode("notes")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                viewMode === "notes"
                  ? "bg-slate-800 text-amber-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileText size={15} />
              Bloco de Notas
            </button>

            <button
              onClick={() => setViewMode("minimal")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                viewMode === "minimal"
                  ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Clock size={15} />
              Modo Relógio
            </button>

            <button
              onClick={() => setViewMode("history")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                viewMode === "history"
                  ? "bg-slate-800 text-indigo-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <History size={15} />
              Histórico ({searches.length})
            </button>
          </nav>

          {/* Quick Simulation Input */}
          <form onSubmit={handleSimulateTestSearch} className="hidden md:flex items-center gap-2">
            <input
              type="text"
              value={testSearchInput}
              onChange={(e) => setTestSearchInput(e.target.value)}
              placeholder="Simular busca rápida..."
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500 w-48 transition"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition"
              title="Testar revelação"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Mode View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col justify-center">
        {viewMode === "giant" && (
          <GiantPeek latestSearch={latestSearch} liveTyping={liveTyping} />
        )}

        {viewMode === "calculator" && (
          <CalculatorPeek latestSearch={latestSearch} liveTyping={liveTyping} />
        )}

        {viewMode === "notes" && (
          <NotesPeek
            searches={searches}
            latestSearch={latestSearch}
            liveTyping={liveTyping}
          />
        )}

        {viewMode === "minimal" && (
          <MinimalPeek latestSearch={latestSearch} liveTyping={liveTyping} />
        )}

        {viewMode === "history" && (
          <HistoryPeek searches={searches} onDelete={handleDeleteSearch} />
        )}
      </main>

      {/* Instructions Accordion / Footer bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>Como executar o truque:</strong> Peça o celular do espectador para &quot;abrir o Google&quot;, acesse o link do espectador. O espectador pesquisa qualquer coisa, a busca é capturada aqui e ele é enviado ao Google real!
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {notificationsEnabled && (
              <>
                <button
                  onClick={() => setDiscreetNotification(!discreetNotification)}
                  className={`text-xs px-2 py-0.5 rounded border transition ${
                    discreetNotification
                      ? "bg-amber-950/60 border-amber-800 text-amber-300"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                  title="Camuflar notificação no relógio como 'Lembrete de Calendário'"
                >
                  {discreetNotification ? "⌚ Modo Discreto: Ativo" : "⌚ Notificação Direta"}
                </button>
                <button
                  onClick={handleTestNotification}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  Testar Envio p/ Smartwatch
                </button>
                <span className="text-slate-700">•</span>
              </>
            )}
            <button
              onClick={handleVoiceTest}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Testar Voz
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsQrOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Exibir QR Code
            </button>
          </div>
        </div>
      </footer>

      {/* QR Code Modal for Spectator Link */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={spectatorUrl}
      />

      {/* QR Code Modal for Prediction Mode (Spectator B) */}
      <PredictionQRModal
        isOpen={isPredictionQrOpen}
        onClose={() => setIsPredictionQrOpen(false)}
        url={predictionUrl}
        predictionTarget={predictionTarget}
        onUpdateTarget={async (target) => {
          setPredictionTarget(target);
          try {
            await fetch("/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ predictionTarget: target }),
            });
          } catch (e) {
            console.error("Failed to update prediction target", e);
          }
        }}
      />

      {/* Smartwatch Guide & Activation Modal */}
      <SmartwatchModal
        isOpen={isSmartwatchModalOpen}
        onClose={() => setIsSmartwatchModalOpen(false)}
        isEnabled={notificationsEnabled}
        onRequestAgain={async () => {
          const res = await requestNotificationPermission();
          if (res.granted) {
            setNotificationsEnabled(true);
            setIsSmartwatchModalOpen(false);
            sendPeekNotification("Notificações no Smartwatch ativadas!", {
              customTitle: "⌚ Smartwatch Conectado",
            });
          }
        }}
      />
    </div>
  );
};
