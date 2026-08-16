import React, { useState, useEffect, useRef } from "react";
import { Search, X, Mic, Camera } from "lucide-react";
import { GoogleImagesView } from "./GoogleImagesView";

interface GoogleCloneProps {
  sessionId?: string;
  onOpenMagician?: () => void;
}

export const GoogleClone: React.FC<GoogleCloneProps> = ({
  sessionId = "default",
  onOpenMagician,
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [imagesSearchTerm, setImagesSearchTerm] = useState<"Einstein" | "Cadeira" | "Mapa Mundi" | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Send live keystrokes to server
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (query.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        fetch("/api/searches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            sessionId,
            isLive: true,
            device: navigator.userAgent.includes("Mobile") ? "Celular" : "Desktop",
          }),
        }).catch(() => {});
      }, 150);

      // Generate realistic dynamic suggestions based on query
      const baseWords = [
        query,
        `${query} significado`,
        `${query} fotos`,
        `${query} notícias`,
        `${query} hoje`,
        `${query} wikipédia`,
      ];
      setSuggestions(baseWords.slice(0, 5));
    } else {
      setSuggestions([]);
      // Clear live typing on empty
      fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "", sessionId, isLive: true }),
      }).catch(() => {});
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [query, sessionId]);

  const handlePerformSearch = async (searchTerm: string) => {
    const finalQuery = (searchTerm || query).trim();
    if (!finalQuery || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Send finalized search data secretly to backend
      const response = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalQuery,
          sessionId,
          isLive: false,
          device: navigator.userAgent.includes("Mobile") ? "Celular" : "Desktop",
        }),
      });

      const data = await response.json();
      const targetUrl = data.redirectUrl || `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;

      // 2. Seamlessly redirect the spectator's browser to the REAL Google results
      window.location.replace(targetUrl);
    } catch {
      // Fallback direct redirection if network glitch
      window.location.replace(`https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleSecretTrigger = () => {
    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    if (newCount >= 3) {
      if (onOpenMagician) {
        onOpenMagician();
      } else {
        window.location.hash = "peek";
      }
      setSecretClickCount(0);
    }
  };

  if (imagesSearchTerm) {
    return (
      <GoogleImagesView
        term={imagesSearchTerm}
        onReturnToSearch={() => setImagesSearchTerm(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col justify-between font-sans selection:bg-[#c2dbff] select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 text-sm text-[#3c4043]">
        <div className="flex items-center gap-4 text-[13px]">
          <span onClick={() => setImagesSearchTerm("Einstein")} className="hover:underline cursor-pointer">Sobre</span>
          <span className="hover:underline cursor-pointer">Loja</span>
        </div>

        <div className="flex items-center gap-4 text-[13px]">
          <span className="hover:underline cursor-pointer">Gmail</span>
          <span onClick={() => setImagesSearchTerm("Einstein")} className="hover:underline cursor-pointer">Imagens</span>

          {/* 9 Dots Google Apps Icon */}
          <button
            type="button"
            className="p-2 hover:bg-black/5 rounded-full text-[#5f6368] transition"
            aria-label="Google Apps"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z" />
            </svg>
          </button>

          {/* Blue Login Button */}
          <button
            type="button"
            className="bg-[#1a73e8] hover:bg-[#1b66c9] text-white px-5 py-2 rounded-md font-medium text-sm transition shadow-sm"
          >
            Fazer login
          </button>
        </div>
      </header>

      {/* Main Google Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16 w-full max-w-3xl mx-auto">
        {/* Google Logo SVG */}
        <div className="mb-7 flex items-center justify-center select-none cursor-default">
          <svg className="w-64 sm:w-72 h-auto" viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
            <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
            <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.62h9.45zm-8.99 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
            <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
            <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
            <path d="M35.29 41.41V32H67.5c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.53 9.66C16.05 69.35 0 53.8 0 34.68 0 15.55 16.05 0 35.29 0c10.42 0 17.89 4.09 23.44 9.38l-6.62 6.62c-4.01-3.76-9.45-6.62-16.82-6.62-13.61 0-24.36 11.02-24.36 24.63 0 13.61 10.75 24.63 24.36 24.63 8.82 0 13.86-3.53 17.07-6.75 1.76-1.76 2.92-4.26 3.39-7.72H35.29z" fill="#4285F4" />
          </svg>
        </div>

        {/* Search Bar Container */}
        <div className="w-full relative max-w-[584px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(query);
            }}
            className={`flex items-center w-full px-4 py-2.5 sm:py-3 bg-white rounded-full border transition-all duration-200 ${
              isFocused || suggestions.length > 0
                ? "shadow-[0_2px_8px_rgba(32,33,36,0.28)] border-transparent"
                : "border-[#dfe1e5] hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] hover:border-transparent"
            }`}
          >
            {/* Magnifying Glass Icon */}
            <div className="text-[#9aa0a6] mr-3 shrink-0">
              <Search size={20} />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent text-[#202124] text-base outline-none placeholder:text-transparent sm:placeholder:text-[#9aa0a6]"
              placeholder="Pesquise no Google ou digite um URL"
            />

            {/* Clear Button (X) */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[#70757a] hover:text-[#202124] p-1 mr-1.5 transition"
              >
                <X size={18} />
              </button>
            )}

            {/* Google Voice Mic Icon (Colored) */}
            <div className="flex items-center gap-2.5 ml-1 shrink-0">
              <button
                type="button"
                className="p-1 cursor-pointer hover:opacity-80 transition"
                title="Pesquisa por voz"
                onClick={() => handlePerformSearch(query)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path fill="#34A853" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  <path fill="#EA4335" d="M12 17c-1.38 0-2.63-.56-3.54-1.46l-1.42 1.42C8.25 18.17 10.02 19 12 19s3.75-.83 4.96-2.04l-1.42-1.42C14.63 16.44 13.38 17 12 17z" />
                  <path fill="#FBBC05" d="M19 11h-2c0 1.38-.56 2.63-1.46 3.54l1.42 1.42C18.17 14.75 19 12.98 19 11z" />
                </svg>
              </button>

              {/* Google Lens Camera Icon */}
              <button
                type="button"
                className="p-1 cursor-pointer hover:opacity-80 transition"
                title="Pesquise por imagem"
                onClick={() => handlePerformSearch(query)}
              >
                <svg className="w-5 h-5" viewBox="0 0 192 192">
                  <path fill="#4285F4" d="M96 142c-25.4 0-46-20.6-46-46s20.6-46 46-46 46 20.6 46 46-20.6 46-46 46z" />
                  <path fill="#34A853" d="M142 96c0 25.4-20.6 46-46 46V50c25.4 0 46 20.6 46 46z" />
                  <path fill="#FBBC05" d="M152 40h-24l-12-16H76L64 40H40C29 40 20 49 20 60v92c0 11 9 20 20 20h112c11 0 20-9 20-20V60c0-11-9-20-20-20zm-56 122c-36.4 0-66-29.6-66-66s29.6-66 66-66 66 29.6 66 66-29.6 66-66 66z" />
                  <path fill="#EA4335" d="M168 60v92c0 11-9 20-20 20H96V24h20l12 16h24c11 0 20 9 20 20z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions Box */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-[0_4px_12px_rgba(32,33,36,0.28)] border border-transparent overflow-hidden z-20 py-2">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => handlePerformSearch(item)}
                  className="flex items-center px-4 py-2.5 hover:bg-[#f1f3f4] cursor-pointer text-sm text-[#202124]"
                >
                  <Search size={16} className="text-[#9aa0a6] mr-3.5" />
                  <span className="font-normal">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Search Buttons */}
        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            type="button"
            onClick={() => handlePerformSearch(query)}
            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] hover:border-[#dadce0] text-[#3c4043] text-sm px-4 py-2 rounded border border-[#f8f9fa] transition"
          >
            Pesquisa Google
          </button>
          <button
            type="button"
            onClick={() => handlePerformSearch(query || "Doodles")}
            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] hover:border-[#dadce0] text-[#3c4043] text-sm px-4 py-2 rounded border border-[#f8f9fa] transition"
          >
            Estou com sorte
          </button>
        </div>

        {/* Google language offerings */}
        <div className="mt-7 text-xs text-[#3c4043]">
          Disponibilizado pelo Google em:{" "}
          <span className="text-[#1a0dab] hover:underline cursor-pointer">English</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f2f2f2] text-[#70757a] text-sm border-t border-[#dadce0]">
        {/* Country line */}
        <div
          onClick={handleSecretTrigger}
          className="px-6 py-3 border-b border-[#dadce0] cursor-default flex items-center justify-between"
          title="Google"
        >
          <span>Brasil</span>
          <span className="opacity-0 text-[10px] select-none">✦</span>
        </div>

        {/* Footer links */}
        <div className="px-6 py-3 flex flex-wrap justify-between items-center gap-y-2 text-[13px]">
          <div className="flex flex-wrap gap-6">
            <span
              onClick={() => setImagesSearchTerm("Einstein")}
              className="hover:underline cursor-pointer"
              title="Sobre"
            >
              Sobre
            </span>
            <span
              onClick={() => setImagesSearchTerm("Cadeira")}
              className="hover:underline cursor-pointer"
              title="Publicidade"
            >
              Publicidade
            </span>
            <span
              onClick={() => setImagesSearchTerm("Mapa Mundi")}
              className="hover:underline cursor-pointer"
              title="Negócios"
            >
              Negócios
            </span>
            <span className="hover:underline cursor-pointer">Como funciona a Pesquisa</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <span className="hover:underline cursor-pointer">Privacidade</span>
            <span className="hover:underline cursor-pointer">Termos</span>
            <span className="hover:underline cursor-pointer">Configurações</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
