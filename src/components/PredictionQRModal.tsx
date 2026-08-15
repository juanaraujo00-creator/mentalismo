import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink, X, Sparkles, Smartphone, Eye, ArrowRight, Wand2 } from "lucide-react";

interface PredictionQRModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  predictionTarget?: "images" | "web" | "maps";
  onUpdateTarget?: (target: "images" | "web" | "maps") => void;
}

export const PredictionQRModal: React.FC<PredictionQRModalProps> = ({
  url,
  isOpen,
  onClose,
  predictionTarget = "images",
  onUpdateTarget,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (url) {
      QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error("Error generating QR code", err));
    }
  }, [url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-3 text-purple-400">
          <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-center">
            <Wand2 size={22} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Modo Previsão (Celular B)</h3>
            <p className="text-xs text-slate-400">Efeito duplo: Peek + Revelação no Google</p>
          </div>
        </div>

        {/* Presentation Flow Steps */}
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-3.5 mb-4 text-xs space-y-2 text-purple-200">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-400" /> Como apresentar o efeito:
          </p>
          <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <div className="flex items-start gap-1.5">
              <span className="bg-purple-800/80 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>Abra este link no celular do <strong>Espectador B</strong> e deixe o celular virado na mesa ou nas mãos dele.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="bg-purple-800/80 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>Peça para o <strong>Espectador A</strong> pesquisar mentalmente qualquer coisa no celular dele (link normal).</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="bg-purple-800/80 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Você recebe o Peek no seu Smartwatch/Celular, e o celular B <strong>redireciona automaticamente para o Google Imagens</strong> com a foto da previsão!</span>
            </div>
          </div>
        </div>

        {/* Destination Target Selector */}
        {onUpdateTarget && (
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Destino do Redirecionamento no Celular B:
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onUpdateTarget("images")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                  predictionTarget === "images"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🖼️ Imagens
              </button>
              <button
                type="button"
                onClick={() => onUpdateTarget("web")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                  predictionTarget === "web"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌐 Web Geral
              </button>
              <button
                type="button"
                onClick={() => onUpdateTarget("maps")}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                  predictionTarget === "maps"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🗺️ Maps
              </button>
            </div>
          </div>
        )}

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner mb-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code Previsão" className="w-48 h-48 rounded-lg object-contain" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-sm">
              Gerando QR...
            </div>
          )}
        </div>

        {/* Link box & Copy */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 mb-4 flex items-center justify-between gap-2">
          <span className="text-xs text-purple-300 font-mono truncate select-all">{url}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-medium rounded-lg transition shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <ExternalLink size={14} />
            Testar Previsão em nova aba
          </a>
        </div>
      </div>
    </div>
  );
};
