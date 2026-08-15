import React, { useState, useEffect, useRef, useCallback } from "react";
import { SearchEntry, LiveTypingData } from "../types";
import {
  Pen,
  Eraser,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Undo2,
  Type,
  X,
} from "lucide-react";

interface DrawingPeekAppProps {
  sessionId?: string;
  onOpenMagician?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface DrawStroke {
  id: string;
  type: "stroke";
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
}

interface DrawTextItem {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

type DrawAction = DrawStroke | DrawTextItem;

const COLOR_PALETTE = [
  "#1e293b", // Slate black
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#9333ea", // Purple
  "#ea580c", // Orange
];

const STROKE_SIZES = [
  { label: "Fino", value: 3, textPx: 18 },
  { label: "Médio", value: 6, textPx: 26 },
  { label: "Grosso", value: 12, textPx: 38 },
  { label: "Marcador", value: 24, textPx: 52 },
];

export const DrawingPeekApp: React.FC<DrawingPeekAppProps> = ({
  sessionId = "default",
  onOpenMagician,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing States
  const [selectedColor, setSelectedColor] = useState<string>("#1e293b");
  const [strokeSizeIndex, setStrokeSizeIndex] = useState<number>(1); // default Médio
  const [tool, setTool] = useState<"pen" | "eraser" | "text">("pen");
  const [actions, setActions] = useState<DrawAction[]>([]);

  // Refs for low-latency active drawing loop
  const actionsRef = useRef<DrawAction[]>([]);
  actionsRef.current = actions;
  const currentStrokeRef = useRef<DrawStroke | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Text Modal / Placement State
  const [isTextModalOpen, setIsTextModalOpen] = useState<boolean>(false);
  const [captionText, setCaptionText] = useState<string>("");
  const [textCoords, setTextCoords] = useState<Point>({ x: 40, y: 80 });
  const textInputRef = useRef<HTMLInputElement | null>(null);

  // Secret Peek States
  const [showSecretPeek, setShowSecretPeek] = useState<boolean>(false);
  const [latestSearch, setLatestSearch] = useState<SearchEntry | null>(null);
  const [liveTyping, setLiveTyping] = useState<LiveTypingData | null>(null);
  const [hasNewQueryAlert, setHasNewQueryAlert] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Secret triple tap on logo for dashboard
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<any>(null);

  const strokeSize = STROKE_SIZES[strokeSizeIndex].value;
  const currentFontSize = STROKE_SIZES[strokeSizeIndex].textPx;

  // Selected values in refs for stable touch listener access
  const toolRef = useRef<"pen" | "eraser" | "text">("pen");
  toolRef.current = tool;
  const selectedColorRef = useRef<string>(selectedColor);
  selectedColorRef.current = selectedColor;
  const strokeSizeRef = useRef<number>(strokeSize);
  strokeSizeRef.current = strokeSize;

  // 1. Connect to Real-Time SSE Stream for instant Peeks
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isCancelled = false;

    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/searches");
        if (res.ok) {
          const data = await res.json();
          if (data.latest) {
            setLatestSearch(data.latest);
          }
          if (data.liveTyping) {
            setLiveTyping(data.liveTyping);
          }
        }
      } catch (err) {
        console.warn("Error fetching initial searches in drawing mode", err);
      }
    };

    fetchInitial();

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/searches/stream");

        eventSource.onopen = () => {
          if (!isCancelled) setIsConnected(true);
        };

        eventSource.addEventListener("newSearch", (e) => {
          try {
            const newEntry: SearchEntry = JSON.parse(e.data);
            if (isCancelled) return;

            if (
              !sessionId ||
              sessionId === "all" ||
              newEntry.sessionId === sessionId ||
              sessionId === "default"
            ) {
              setLatestSearch(newEntry);
              setLiveTyping(null);
              setHasNewQueryAlert(true);

              if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                try {
                  navigator.vibrate([100, 50, 100]);
                } catch {}
              }
            }
          } catch (err) {
            console.error("Error processing newSearch in Drawing Mode", err);
          }
        });

        eventSource.addEventListener("liveTyping", (e) => {
          try {
            const data: LiveTypingData = JSON.parse(e.data);
            if (isCancelled) return;
            if (
              !sessionId ||
              sessionId === "all" ||
              data.sessionId === sessionId ||
              sessionId === "default"
            ) {
              setLiveTyping(data);
              if (data.query.trim()) {
                setHasNewQueryAlert(true);
              }
            }
          } catch (err) {
            console.error("Error processing liveTyping in Drawing Mode", err);
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
        console.error("SSE error in Drawing Mode", err);
      }
    };

    connectSSE();

    // Polling fallback
    const interval = setInterval(async () => {
      if (isCancelled) return;
      try {
        const res = await fetch("/api/searches");
        if (res.ok) {
          const data = await res.json();
          if (data.latest) {
            setLatestSearch((prev) => {
              if (!prev || prev.id !== data.latest.id) {
                setHasNewQueryAlert(true);
                return data.latest;
              }
              return prev;
            });
          }
        }
      } catch {}
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [sessionId]);

  // 2. Redraw function (Pure & Fast)
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grid pattern
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render completed actions (strokes & texts)
    const list = actionsRef.current;
    for (let i = 0; i < list.length; i++) {
      const action = list[i];
      if (action.type === "stroke") {
        if (action.points.length === 0) continue;
        ctx.beginPath();
        ctx.strokeStyle = action.isEraser ? "#ffffff" : action.color;
        ctx.lineWidth = action.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (action.points.length === 1) {
          ctx.arc(action.points[0].x, action.points[0].y, action.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = action.isEraser ? "#ffffff" : action.color;
          ctx.fill();
        } else {
          ctx.moveTo(action.points[0].x, action.points[0].y);
          for (let p = 1; p < action.points.length; p++) {
            ctx.lineTo(action.points[p].x, action.points[p].y);
          }
          ctx.stroke();
        }
      } else if (action.type === "text") {
        ctx.font = `bold ${action.fontSize}px 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = action.color;
        ctx.textBaseline = "top";
        ctx.fillText(action.text, action.x, action.y);
      }
    }

    // Render active drawing stroke
    const active = currentStrokeRef.current;
    if (active && active.points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = active.isEraser ? "#ffffff" : active.color;
      ctx.lineWidth = active.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (active.points.length === 1) {
        ctx.arc(active.points[0].x, active.points[0].y, active.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = active.isEraser ? "#ffffff" : active.color;
        ctx.fill();
      } else {
        ctx.moveTo(active.points[0].x, active.points[0].y);
        for (let p = 1; p < active.points.length; p++) {
          ctx.lineTo(active.points[p].x, active.points[p].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }, []);

  // 3. Initialize & Resize Canvas only on layout change
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const setupDimensions = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (rect.width <= 0 || rect.height <= 0) return;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      redrawCanvas();
    };

    setupDimensions();

    const resizeObserver = new ResizeObserver(() => {
      setupDimensions();
    });
    resizeObserver.observe(container);

    window.addEventListener("resize", setupDimensions);
    window.addEventListener("orientationchange", setupDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", setupDimensions);
      window.removeEventListener("orientationchange", setupDimensions);
    };
  }, [redrawCanvas]);

  // Redraw when actions state changes
  useEffect(() => {
    redrawCanvas();
  }, [actions, redrawCanvas]);

  // 4. Native Non-Passive Touch and Mouse Event Listeners for Bulletproof Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (clientX: number, clientY: number): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const onStart = (clientX: number, clientY: number) => {
      const pt = getPos(clientX, clientY);

      if (toolRef.current === "text") {
        setTextCoords(pt);
        setIsTextModalOpen(true);
        setTimeout(() => textInputRef.current?.focus(), 150);
        return;
      }

      isDrawingRef.current = true;
      currentStrokeRef.current = {
        id: "stroke-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        type: "stroke",
        points: [pt],
        color: selectedColorRef.current,
        size: toolRef.current === "eraser" ? strokeSizeRef.current * 3 : strokeSizeRef.current,
        isEraser: toolRef.current === "eraser",
      };
      redrawCanvas();
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return;
      const pt = getPos(clientX, clientY);
      currentStrokeRef.current.points.push(pt);
      redrawCanvas();
    };

    const onEnd = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
        const finished = currentStrokeRef.current;
        setActions((prev) => [...prev, finished]);
      }
      currentStrokeRef.current = null;
      redrawCanvas();
    };

    // Touch Event Handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      onEnd();
    };

    // Mouse Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        onStart(e.clientX, e.clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      onMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      onEnd();
    };

    // Attach listeners with passive: false to disable browser scrolling
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);

      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [redrawCanvas]);

  // Add confirmed text to canvas
  const handleApplyText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = captionText.trim();
    if (!trimmed) {
      setIsTextModalOpen(false);
      return;
    }

    const newTextItem: DrawTextItem = {
      id: "text-" + Date.now(),
      type: "text",
      x: textCoords.x,
      y: textCoords.y,
      text: trimmed,
      color: selectedColor,
      fontSize: currentFontSize,
    };

    setActions((prev) => [...prev, newTextItem]);
    setCaptionText("");
    setIsTextModalOpen(false);
  };

  const handleUndo = () => {
    setActions((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setActions([]);
  };

  // Secret Triple Tap to open Magician Dashboard
  const handleSecretTripleTap = () => {
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);

    if (logoTapCountRef.current >= 3) {
      logoTapCountRef.current = 0;
      if (onOpenMagician) onOpenMagician();
      else window.location.hash = "peek";
    } else {
      logoTapTimerRef.current = setTimeout(() => {
        logoTapCountRef.current = 0;
      }, 700);
    }
  };

  // What is currently the captured search query
  const peekQuery =
    (liveTyping && liveTyping.query.trim()) ||
    (latestSearch && latestSearch.query.trim()) ||
    "";

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col font-sans select-none overflow-hidden touch-none relative">
      {/* Top Header / App Bar */}
      <header className="bg-white border-b border-slate-200 px-3 py-2 sm:px-5 flex items-center justify-between shadow-xs z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            onClick={handleSecretTripleTap}
            className="flex items-center gap-2 cursor-pointer active:opacity-75"
            title="Sketchpad"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Pen size={14} />
            </div>
            <span className="font-semibold text-slate-800 text-sm hidden sm:inline">
              SketchPad
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Undo & Clear Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={actions.length === 0}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition active:scale-95"
              title="Desfazer traço/texto"
            >
              <Undo2 size={17} />
            </button>
            <button
              onClick={handleClear}
              disabled={actions.length === 0}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30 transition active:scale-95"
              title="Limpar tela"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECRET PEEK TOGGLE BUTTON (Discreet & Realistic)             */}
        {/* ============================================================ */}
        <div className="flex items-center gap-2">
          {/* Direct Caption Button */}
          <button
            type="button"
            onClick={() => {
              const canvas = canvasRef.current;
              const h = canvas ? canvas.clientHeight : 400;
              setTextCoords({ x: 30, y: Math.max(h - 90, 80) });
              setIsTextModalOpen(true);
              setTimeout(() => textInputRef.current?.focus(), 150);
            }}
            className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
            title="Escrever legenda no desenho"
          >
            <Type size={13} className="text-indigo-600" />
            <span className="text-[11px] font-semibold">+ Legenda</span>
          </button>

          {/* Subtle Secret Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setShowSecretPeek((prev) => !prev);
              setHasNewQueryAlert(false);
            }}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              showSecretPeek
                ? "bg-slate-800 text-white shadow-sm ring-2 ring-slate-400/50"
                : hasNewQueryAlert
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
            }`}
            title="Alternar anotação / Peek secreto"
          >
            {showSecretPeek ? (
              <>
                <EyeOff size={14} className="text-rose-300" />
                <span className="text-[11px]">Ocultar</span>
              </>
            ) : (
              <>
                <Eye size={14} className={hasNewQueryAlert ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-[11px]">
                  {hasNewQueryAlert ? "● Pronto" : "Memo"}
                </span>
              </>
            )}
          </button>

          {/* Discreet connection indicator */}
          <div
            title={isConnected ? "Conectado e pronto" : "Conectando..."}
            className="flex items-center"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* DISCREET PEEK BANNER (Only visible when toggled by Magician) */}
      {/* ============================================================ */}
      {showSecretPeek && (
        <div
          onClick={() => setShowSecretPeek(false)}
          className="bg-slate-900/95 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md border-b border-slate-800 cursor-pointer animate-fade-in z-20 shrink-0"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-indigo-600/80 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-amber-300" />
            </div>
            <div className="truncate">
              {peekQuery ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400">Pensamento:</span>
                  <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                    "{peekQuery}"
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Aguardando espectador digitar no Google/Wikipédia...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Toque para ocultar
            </span>
          </div>
        </div>
      )}

      {/* Drawing Canvas Area */}
      <main
        ref={containerRef}
        className="flex-1 relative w-full bg-white overflow-hidden touch-none"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full cursor-crosshair"
          style={{ touchAction: "none" }}
        />

        {/* Empty state hint if nothing drawn yet */}
        {actions.length === 0 && !isDrawingRef.current && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-sm font-sans select-none">
            <span>Desenhe com o dedo ou clique em "+ Legenda" para escrever</span>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* TEXT / CAPTION INPUT MODAL                                   */}
      {/* ============================================================ */}
      {isTextModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                <Type size={18} />
                <span>Adicionar Legenda</span>
              </div>
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyText} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Texto da legenda que aparecerá no desenho:
                </label>
                <input
                  ref={textInputRef}
                  type="text"
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Ex: Torre Eiffel, Michael Jordan..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-base font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  autoFocus
                />
              </div>

              {/* Color choices for text */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Cor:</span>
                <div className="flex items-center gap-1.5">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full transition flex items-center justify-center ${
                        selectedColor === color ? "ring-2 ring-indigo-500 ring-offset-2 scale-110" : ""
                      }`}
                    >
                      {selectedColor === color && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTextModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!captionText.trim()}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
                >
                  Inserir Legenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Floating Drawing Toolbar */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-slate-200 px-3 py-2 sm:px-6 flex items-center justify-between gap-3 shadow-lg z-30 shrink-0">
        {/* Tool Selector: Pen vs Eraser vs Text */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-lg transition active:scale-95 ${
              tool === "pen"
                ? "bg-white text-indigo-600 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Caneta"
          >
            <Pen size={17} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-lg transition active:scale-95 ${
              tool === "eraser"
                ? "bg-white text-indigo-600 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Borracha"
          >
            <Eraser size={17} />
          </button>
          <button
            onClick={() => {
              setTool("text");
              const canvas = canvasRef.current;
              const h = canvas ? canvas.clientHeight : 400;
              setTextCoords({ x: 30, y: Math.max(h - 90, 80) });
              setIsTextModalOpen(true);
              setTimeout(() => textInputRef.current?.focus(), 150);
            }}
            className={`p-2 rounded-lg transition active:scale-95 flex items-center gap-1 ${
              tool === "text"
                ? "bg-white text-indigo-600 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Adicionar Texto / Legenda"
          >
            <Type size={17} />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                if (tool === "eraser") setTool("pen");
              }}
              style={{ backgroundColor: color }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center shadow-xs ${
                selectedColor === color && tool !== "eraser"
                  ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                  : "hover:scale-105"
              }`}
            >
              {selectedColor === color && tool !== "eraser" && (
                <Check size={14} className="text-white drop-shadow-xs" />
              )}
            </button>
          ))}
        </div>

        {/* Stroke / Text Size Selector */}
        <div className="flex items-center gap-1.5">
          {STROKE_SIZES.map((sizeObj, idx) => (
            <button
              key={sizeObj.value}
              onClick={() => setStrokeSizeIndex(idx)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-95 ${
                strokeSizeIndex === idx
                  ? "bg-slate-200 text-slate-900 font-bold border border-slate-300"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
              title={`Tamanho: ${sizeObj.label}`}
            >
              <div
                className="rounded-full bg-slate-800"
                style={{
                  width: Math.min(sizeObj.value + 4, 18),
                  height: Math.min(sizeObj.value + 4, 18),
                }}
              />
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
