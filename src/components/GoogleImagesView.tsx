import React from "react";
import { Search, X, Mic, Camera, ArrowLeft, SlidersHorizontal, Share2, Bookmark, MoreVertical, ExternalLink } from "lucide-react";

export interface GoogleImageItem {
  id: string;
  title: string;
  source: string;
  imageUrl: string;
  siteUrl: string;
  dimensions: string;
  description: string;
}

interface GoogleImagesViewProps {
  term: "Einstein" | "Cadeira" | "Mapa Mundi";
  onReturnToSearch: () => void;
}

const SINGLE_IMAGE_DATA: Record<
  "Einstein" | "Cadeira" | "Mapa Mundi",
  {
    searchTerm: string;
    filters: string[];
    image: GoogleImageItem;
  }
> = {
  Einstein: {
    searchTerm: "Einstein",
    filters: [
      "língua para fora",
      "física",
      "teoria da relatividade",
      "preto e branco",
      "nobel",
      "lousa",
      "biografia",
    ],
    image: {
      id: "einstein-classic",
      title: "Albert Einstein com a língua para fora no seu aniversário de 72 anos (14 de março de 1951)",
      source: "wikipedia.org",
      siteUrl: "https://pt.wikipedia.org/wiki/Albert_Einstein",
      // Local image fixed in /public
      imageUrl: "/einstein.jpg",
      dimensions: "1200 × 1600",
      description: "Fotografia clássica e icônica tirada por Arthur Sasse. Einstein decidiu mostrar a língua para os fotógrafos que insistiam para que ele sorrisse dentro do carro.",
    },
  },
  "Cadeira": {
    searchTerm: "Cadeira",
    filters: [
      "madeira maciça",
      "rústica",
      "design",
      "sala de jantar",
      "artesanal",
      "ergonômica",
    ],
    image: {
      id: "cadeira-classic",
      title: "Cadeira de madeira maciça rústica artesanal com encosto ergonômico",
      source: "decoracao.com.br",
      siteUrl: "https://decoracao.com.br",
      // Local image fixed in /public
      imageUrl: "/cadeira.jpg",
      dimensions: "1500 × 1500",
      description: "Cadeira clássica de madeira maciça de alta qualidade com acabamento natural, resistente e elegante para ambientes internos e áreas gourmet.",
    },
  },
  "Mapa Mundi": {
    searchTerm: "Mapa Mundi",
    filters: [
      "político",
      "com nomes dos países",
      "alta resolução",
      "continentes",
      "oceanos",
      "completo",
    ],
    image: {
      id: "mapa-classic",
      title: "Mapa Mundi Político Completo com divisão de todos os países, oceanos e capitais",
      source: "welt-atlas.de",
      siteUrl: "https://www.welt-atlas.de",
      // Local image fixed in /public
      imageUrl: "/mapamundi.jpg",
      dimensions: "1536 × 997",
      description: "Planisfério político mundial detalhado em alta resolução exibindo todos os continentes, países, meridianos e oceanos.",
    },
  },
};

export const GoogleImagesView: React.FC<GoogleImagesViewProps> = ({
  term,
  onReturnToSearch,
}) => {
  const current = SINGLE_IMAGE_DATA[term] || SINGLE_IMAGE_DATA["Einstein"];
  const item = current.image;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] flex flex-col font-sans selection:bg-[#c2dbff]">
      {/* Top Header: Authentic Google Search Results Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#ebebeb] px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
          {/* Back arrow or Google Logo: THIS IS WHAT RETURNS TO SEARCH */}
          <button
            onClick={onReturnToSearch}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            title="Voltar para a pesquisa Google"
          >
            <ArrowLeft size={22} className="text-[#5f6368] group-hover:text-[#202124] transition sm:hidden" />
            <svg
              className="w-24 sm:w-28 h-auto cursor-pointer hover:opacity-90 transition"
              viewBox="0 0 272 92"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill="#EA4335"
              />
              <path
                d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill="#FBBC05"
              />
              <path
                d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.62h9.45zm-8.99 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
                fill="#4285F4"
              />
              <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
              <path
                d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                fill="#EA4335"
              />
              <path
                d="M35.29 41.41V32H67.5c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.53 9.66C16.05 69.35 0 53.8 0 34.68 0 15.55 16.05 0 35.29 0c10.42 0 17.89 4.09 23.44 9.38l-6.62 6.62c-4.01-3.76-9.45-6.62-16.82-6.62-13.61 0-24.36 11.02-24.36 24.63 0 13.61 10.75 24.63 24.36 24.63 8.82 0 13.86-3.53 17.07-6.75 1.76-1.76 2.92-4.26 3.39-7.72H35.29z"
                fill="#4285F4"
              />
            </svg>
          </button>

          {/* Search bar filled with the term */}
          <div className="flex-1 sm:w-[500px] md:w-[600px] flex items-center px-4 py-2 sm:py-2.5 bg-white rounded-full border border-[#dfe1e5] shadow-[0_1px_6px_rgba(32,33,36,0.18)]">
            <input
              type="text"
              readOnly
              value={current.searchTerm}
              className="w-full bg-transparent text-[#202124] text-sm sm:text-base outline-none cursor-default font-normal"
            />
            <div className="flex items-center gap-2.5 ml-2 text-[#70757a]">
              <X size={18} onClick={onReturnToSearch} className="cursor-pointer hover:text-[#202124]" />
              <div className="w-[1px] h-5 bg-[#dadce0] mx-0.5" />
              <Mic size={18} className="text-[#4285F4]" />
              <Camera size={18} className="text-[#4285F4]" />
              <Search size={18} className="text-[#4285F4]" />
            </div>
          </div>
        </div>

        {/* Right tools / Profile */}
        <div className="hidden sm:flex items-center gap-4 ml-auto text-sm text-[#5f6368]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[#f1f3f4] text-[#3c4043] font-medium cursor-pointer">
            <SlidersHorizontal size={16} />
            <span>Ferramentas</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm shadow-xs">
            G
          </div>
        </div>
      </header>

      {/* Tabs Bar: Todos, Imagens (Active), Vídeos, Notícias, etc. */}
      <div className="bg-white border-b border-[#ebebeb] px-4 sm:px-8 flex items-center gap-6 text-sm text-[#5f6368] overflow-x-auto scrollbar-none">
        <button
          onClick={onReturnToSearch}
          className="py-3 px-1 hover:text-[#202124] whitespace-nowrap cursor-pointer"
        >
          Todas
        </button>
        <button className="py-3 px-1 text-[#1a73e8] font-medium border-b-[3px] border-[#1a73e8] whitespace-nowrap flex items-center gap-1.5 cursor-default">
          <Camera size={16} />
          <span>Imagens</span>
        </button>
        <button
          onClick={onReturnToSearch}
          className="py-3 px-1 hover:text-[#202124] whitespace-nowrap cursor-pointer"
        >
          Vídeos
        </button>
        <button
          onClick={onReturnToSearch}
          className="py-3 px-1 hover:text-[#202124] whitespace-nowrap cursor-pointer"
        >
          Notícias
        </button>
        <button
          onClick={onReturnToSearch}
          className="py-3 px-1 hover:text-[#202124] whitespace-nowrap cursor-pointer"
        >
          Shopping
        </button>
        <button
          onClick={onReturnToSearch}
          className="py-3 px-1 hover:text-[#202124] whitespace-nowrap cursor-pointer"
        >
          Livros
        </button>
      </div>

      {/* Filter pills carousel */}
      <div className="px-4 sm:px-8 py-3 bg-white border-b border-[#ebebeb] flex items-center gap-2 overflow-x-auto scrollbar-none">
        {current.filters.map((filter, idx) => (
          <div
            key={idx}
            className="px-3.5 py-1.5 rounded-full bg-[#f8f9fa] border border-[#dadce0] text-xs sm:text-[13px] text-[#3c4043] whitespace-nowrap flex items-center gap-1"
          >
            <span>{filter}</span>
          </div>
        ))}
      </div>

      {/* Main Single Image Viewer Layout (Authentic Google Image Expanded View) */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full bg-white rounded-2xl border border-[#dadce0] shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Main Focused Image Container */}
          <div className="md:w-3/5 bg-[#202124] p-3 sm:p-6 flex items-center justify-center min-h-[320px] sm:min-h-[460px] relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="max-h-[440px] w-auto max-w-full object-contain rounded-lg shadow-md"
              loading="eager"
            />
            {/* Dimensions tag */}
            <div className="absolute bottom-3 left-4 bg-black/75 text-white/90 text-xs px-2.5 py-1 rounded-md font-mono">
              {item.dimensions}
            </div>
          </div>

          {/* Image Details Sidebar (Google Image preview panel) */}
          <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-[#ebebeb]">
            <div>
              {/* Site source header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f4]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#34A853]/15 flex items-center justify-center text-[#34A853] text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#202124]">{item.source}</div>
                    <div className="text-[11px] text-[#70757a]">Resultado verificado</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#5f6368]">
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full" title="Compartilhar">
                    <Share2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full" title="Salvar">
                    <Bookmark size={16} />
                  </button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full" title="Mais">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Title & description */}
              <div className="mt-4">
                <h1 className="text-base sm:text-lg font-medium text-[#1a0dab] leading-snug hover:underline cursor-pointer">
                  {item.title}
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-[#4d5156] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Image metadata tag */}
              <div className="mt-5 p-3 rounded-xl bg-[#f8f9fa] border border-[#e8eaed] text-xs text-[#5f6368] space-y-1.5">
                <div className="flex justify-between">
                  <span>Resolução:</span>
                  <span className="font-medium text-[#202124]">{item.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className="font-medium text-[#202124]">JPEG Image</span>
                </div>
                <div className="flex justify-between">
                  <span>Licença:</span>
                  <span className="font-medium text-[#202124]">Domínio público / Licenciado</span>
                </div>
              </div>
            </div>

            {/* Return action banner */}
            <div className="mt-6 pt-4 border-t border-[#f1f3f4] flex flex-col gap-2">
              <button
                onClick={onReturnToSearch}
                className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2.5 px-4 rounded-full text-sm font-medium transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Voltar para a pesquisa Google</span>
              </button>
              <div className="text-center">
                <span
                  onClick={onReturnToSearch}
                  className="text-xs text-[#70757a] hover:underline cursor-pointer"
                >
                  Ou clique no logotipo do Google acima
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f2f2f2] text-[#70757a] text-xs py-4 px-6 border-t border-[#dadce0] flex flex-wrap justify-between items-center gap-4 mt-auto">
        <span>Brasil - De acordo com o seu endereço de IP</span>
        <div className="flex gap-4">
          <span onClick={onReturnToSearch} className="hover:underline cursor-pointer">Ajuda</span>
          <span onClick={onReturnToSearch} className="hover:underline cursor-pointer">Enviar feedback</span>
          <span onClick={onReturnToSearch} className="hover:underline cursor-pointer">Privacidade</span>
          <span onClick={onReturnToSearch} className="hover:underline cursor-pointer">Termos</span>
        </div>
      </footer>
    </div>
  );
};

