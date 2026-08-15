import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink, X, Smartphone, QrCode, Globe, Search } from "lucide-react";

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"google" | "wiki">("google");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Compute actual URL based on tab
  const currentUrl = activeTab === "google" 
    ? url 
    : (url.includes("#") ? url.replace(/#.*$/, "#wiki") : `${url}#wiki`);

  useEffect(() => {
    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
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
  }, [currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5 mb-3 text-emerald-400">
          <QrCode size={22} />
          <h3 className="font-semibold text-lg text-white">Link do Espectador A</h3>
        </div>

        {/* Tab Switcher: Google vs Wikipedia */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("google")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === "google"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search size={14} />
            Google
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wiki")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === "wiki"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={14} />
            Wikipédia (#wiki)
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          {activeTab === "google" ? (
            <span>Abra este link no celular do espectador para simular a <strong>página inicial do Google</strong>.</span>
          ) : (
            <span>Abra este link no celular do espectador para simular a <strong>Wikipédia</strong>. Ao pesquisar, enviará o peek e abrirá o artigo real na Wikipédia!</span>
          )}
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner mb-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code do Espectador" className="w-52 h-52 rounded-lg object-contain" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-sm">
              Gerando QR...
            </div>
          )}
        </div>

        {/* Link box & Copy */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 mb-4 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300 font-mono truncate select-all">{currentUrl}</span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${
              activeTab === "google" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"
            } active:scale-95 text-white text-xs font-medium rounded-lg transition shrink-0`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="flex gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <ExternalLink size={14} />
            Testar {activeTab === "google" ? "Google" : "Wikipédia"} em nova aba
          </a>
        </div>
      </div>
    </div>
  );
};

