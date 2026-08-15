import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Globe,
  ChevronDown,
  BookOpen,
  Languages,
  Menu,
  Bookmark,
  Edit3,
  Star,
  ExternalLink,
  ChevronRight,
  Share2,
  ArrowLeft,
  Info,
} from "lucide-react";

interface WikipediaCloneProps {
  sessionId?: string;
  onOpenMagician?: () => void;
}

interface WikiArticleData {
  title: string;
  displaytitle: string;
  extract: string;
  description: string;
  thumbnail: string | null;
  originalimage: string | null;
}

// Special forced/mentalism magic text templates
const WIKI_FORCED_PARAGRAPHS = [
  `A certa altura, isto criou problemas diferentes mas o seu uso foi logo recomendado apenas para alguns visto que antigamente seu uso era quase nulo. As sugestões de usar {TERM} efetivamente são tentar usar em diferentes ocasiões ao longo do ano.[9] É constantemente recomendado o uso de {TERM} apenas quando se pode. Há ainda sugestões de que {TERM} seja visto numerosas vezes no dia a dia. Ao longo do tempo, há diferentes ocasiões em que {TERM} não existe e por isso era pouco recomendado, seu uso ainda pode trazer problemas.`,

  `Diferentes formas de usar {TERM} (como antigamente) são o seu uso apenas pelas sugestões e em numerosas ocasiões ao longo do ano.[10] É recomendado o uso de {TERM} só quando se pode e não constantemente. Usar dessa forma, efetivamente pode causar problemas.`,

  `Diz-se que {TERM} vem da antiga Grécia e usou-se numerosas vezes desde então de várias formas. Houve ocasiões em que {TERM} não era legal e por isso foi recomendado que não fosse usado constantemente. Isto efetivamente causou problemas antigamente, pois teve sugestões para diferentes usos na cidade.[11]`,

  `Há tantas formas de {TERM} ser efetivamente usado que há diferentes tipos que variam constantemente. Muitos gostam de ter constantemente no seu dia. Há quem veja como algo a ser visto ao longo do dia mas isso não é recomendado. As numerosas formas de usar {TERM} e estas mudam ao longo do tempo. Sabe-se que para alguns {TERM} vem do latim mas só em parte.[12] As sugestões de como usar (causa problemas desde antigamente até hoje em dia) o certo seria usar efetivamente {TERM} em diferentes ocasiões ao longo do ano.`,

  `A certa altura, isto criou problemas diferentes, mas o seu uso foi logo recomendado para todo o ano. Havia constantemente sugestões de tentar usar {TERM} em numerosas ocasiões ao longo do dia.[5] É recomendado o uso de {TERM} só quando se pode. Há quem diga que {TERM} vem da antiga Grécia mas é efetivamente dito que pode ser de outras épocas diferentes. Há vários problemas, pois {TERM} não é comum até hoje e por isso não há constantemente sugestões há seu uso, antigamente nem tinha uso para isso.`,

  `As boas sugestões para usar {TERM}, como recomendado de formas diferentes, são usar em numerosas ocasiões ao longo do ano.[6] Constantemente são dadas sugestões que antigamente o modo de usar {TERM} efetivamente era assim e não em numerosas vezes como dizeres, para não causar problemas.`,

  `Há muitas formas diferentes de se usar {TERM}. Na maior parte das ocasiões como antigamente, como os tipos de {TERM} variam constantemente (assim como as suas opções), muitos gostam de usar todos os dias.[7] Alguns veem efetivamente {TERM} como algo para ser usado em numerosas ocasiões, mas isso não é recomendado, já que isso pode trazer problemas. Formas de usar {TERM} variam ao longo do tempo. Sabe-se que {TERM} vem do latim mas só em parte.[8] Uma das sugestões de como usar {TERM} como antigamente é poder usar {TERM} em diferentes dias`,

  `Boas sugestões para usar {TERM} é o seu uso em diferentes ocasiões ao longo do ano.[2] Não é recomendado usar constantemente {TERM} - mesmo porque numerosas vezes por dia pode causar problemas, por isso só use quando se fizer útil. Efetivamente tinham uma forma melhor do seu uso antigamente.`,

  `Diz-se que {TERM} vem da antiga Grécia e a sua origem tem sido citada efetivamente de diferentes formas. Há numerosas ocasiões em que {TERM} não existe na sua forma pura, e por isso é constantemente recomendado que hajam outras sugestões para os problemas. Mas isso foi antigamente, logo depois seu uso foi recomendado para toda a gente.[3]`,

  `Há tantas formas diferentes de usar {TERM} que os tipos variam constantemente, assim como as diferentes opções, e muitos acham melhor usar constantemente, ou seja, todos os dias. Há quem veja {TERM} como algo útil para numerosas ocasiões, mas não é recomendado que seja assim. As numerosas sugestões de usar efetivamente {TERM} mudam constantemente e isso traz problemas. Ao longo do tempo, sabe-se que {TERM} vem em parte do latim.[4] Antigamente usar {TERM} em numerosas ocasiões diferentes podia efetivamente deixar quem usava rico.`,

  `{TERM} é constantemente usada em todo o mundo em numerosas ocasiões. Há efetivamente várias sugestões de como usar {TERM}, mas os tipos variam constantemente, assim como as diferentes opções de {TERM}, pois numerosas vezes é usada todos os dias. Alguns até dizem que desde antigamente isso causou problemas. Muitos veem {TERM} como algo que deve estar em numerosas ocasiões, mas isso não é recomendado. Sabe-se que a origem do nome {TERM} vem do latim mas apenas em parte.`,
];

export const WikipediaClone: React.FC<WikipediaCloneProps> = ({
  sessionId = "default",
  onOpenMagician,
}) => {
  const [viewState, setViewState] = useState<"portal" | "article">("portal");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<"pt" | "en" | "es">("pt");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [articleData, setArticleData] = useState<WikiArticleData | null>(null);
  const [secretClickCount, setSecretClickCount] = useState(0);
  const typingTimeoutRef = useRef<any>(null);

  // Send live keystrokes secretly to backend
  useEffect(() => {
    if (viewState === "article") return;

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
            device: navigator.userAgent.includes("Mobile") ? "Celular (Wiki)" : "Desktop (Wiki)",
          }),
        }).catch(() => {});
      }, 150);

      // Realistic autocomplete suggestions
      const baseList = [
        query,
        `${query} (história)`,
        `${query} (origem)`,
        `${query} (biografia)`,
        `${query} na cultura popular`,
      ];
      setSuggestions(baseList.slice(0, 5));
    } else {
      setSuggestions([]);
      fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "", sessionId, isLive: true }),
      }).catch(() => {});
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [query, sessionId, viewState]);

  const handlePerformSearch = async (searchTerm: string) => {
    const finalQuery = (searchTerm || query).trim();
    if (!finalQuery || isLoadingArticle) return;

    setIsLoadingArticle(true);

    // 1. Send finalized search data to server immediately (triggers peek + watch notification + prediction on phone B)
    fetch("/api/searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: finalQuery,
        sessionId,
        isLive: false,
        device: navigator.userAgent.includes("Mobile") ? "Celular (Wiki)" : "Desktop (Wiki)",
      }),
    }).catch(() => {});

    // 2. Fetch authentic Wikipedia summary & images
    try {
      const res = await fetch(
        `/api/wiki-summary?q=${encodeURIComponent(finalQuery)}&lang=${language}`
      );
      if (res.ok) {
        const data: WikiArticleData = await res.json();
        setArticleData(data);
      } else {
        setArticleData({
          title: finalQuery,
          displaytitle: finalQuery,
          extract: `${finalQuery} é um termo, entidade ou figura amplamente referenciada e documentada na enciclopédia livre.`,
          description: "Artigo da Wikipédia",
          thumbnail: null,
          originalimage: null,
        });
      }
    } catch {
      setArticleData({
        title: finalQuery,
        displaytitle: finalQuery,
        extract: `${finalQuery} é um tema de reconhecido destaque histórico e relevância enciclopédica.`,
        description: "Artigo da Wikipédia",
        thumbnail: null,
        originalimage: null,
      });
    }

    setIsLoadingArticle(false);
    setViewState("article");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Render text replacing {TERM} with actual searched query and adding authentic citation badges
  const renderFormattedParagraph = (rawTemplate: string, term: string) => {
    const replaced = rawTemplate.split("{TERM}").join(term);

    // Parse citation brackets like [9], [10] into styled Wikipedia superscript citations
    const parts = replaced.split(/(\[\d+\])/g);
    return (
      <p className="mb-4 text-[#202122] text-[15px] sm:text-[16px] leading-[1.65] text-justify">
        {parts.map((part, i) => {
          if (part.startsWith("[") && part.endsWith("]")) {
            return (
              <sup key={i} className="text-[#3366cc] font-sans font-normal text-[11px] ml-0.5 cursor-pointer select-none">
                {part}
              </sup>
            );
          }
          return part;
        })}
      </p>
    );
  };

  // ==========================================
  // ARTICLE VIEW (Modified Wikipedia Page)
  // ==========================================
  if (viewState === "article" && articleData) {
    const term = articleData.title || query;
    const heroImage = articleData.originalimage || articleData.thumbnail;

    return (
      <div className="min-h-screen bg-[#ffffff] text-[#202122] font-sans selection:bg-[#c8ccd1] select-none">
        {/* Mobile / Desktop Wikipedia Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#eaecf0] px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState("portal")}
              className="p-1.5 -ml-1 text-[#54595d] hover:text-[#202122] hover:bg-[#f8f9fa] rounded-md transition"
              title="Voltar"
            >
              <Menu size={20} />
            </button>
            <div
              onClick={() => setViewState("portal")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/240px-Wikipedia-logo-v2.svg.png"
                alt="Wikipedia"
                className="w-6 h-6"
              />
              <span className="font-serif text-lg font-normal tracking-tight text-[#000000]">
                Wikipédia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#54595d]">
            <button
              onClick={() => setViewState("portal")}
              className="p-2 hover:bg-[#f8f9fa] rounded-md transition text-[#54595d]"
            >
              <Search size={18} />
            </button>
            <button className="p-2 hover:bg-[#f8f9fa] rounded-md transition text-[#54595d]">
              <Bookmark size={18} />
            </button>
            <button className="p-2 hover:bg-[#f8f9fa] rounded-md transition text-[#54595d]">
              <Languages size={18} />
            </button>
          </div>
        </header>

        {/* Article Container */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl font-serif text-[#000000] font-normal border-b border-[#a2a9b1] pb-2 mb-2 tracking-tight">
            {articleData.title}
          </h1>

          {/* Subtitle / Description */}
          <div className="flex items-center justify-between text-xs text-[#54595d] mb-4 font-sans">
            <span>
              {articleData.description || "Artigo enciclopédico da Wikipédia, a enciclopédia livre"}
            </span>
            <div className="flex items-center gap-3 text-[#3366cc]">
              <span className="flex items-center gap-1 cursor-pointer">
                <Languages size={13} /> 12 idiomas
              </span>
              <span className="flex items-center gap-1 cursor-pointer">
                <Edit3 size={13} /> Editar
              </span>
            </div>
          </div>

          {/* Article Lead Content */}
          <div className="mt-4">
            {/* Real Image / Infobox if available */}
            {heroImage && (
              <div className="my-4 sm:float-right sm:ml-6 sm:mb-4 sm:w-64 w-full bg-[#f8f9fa] border border-[#c8ccd1] p-2 rounded text-center">
                <div className="overflow-hidden rounded bg-white flex items-center justify-center max-h-72">
                  <img
                    src={heroImage}
                    alt={articleData.title}
                    className="w-full h-auto max-h-64 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-xs text-[#54595d] mt-2 font-sans text-left leading-tight italic">
                  {articleData.title} ({language === "pt" ? "registro enciclopédico" : "encyclopedic entry"}).
                </p>
              </div>
            )}

            {/* REAL FIRST PARAGRAPH from Wikipedia */}
            {articleData.extract && (
              <p className="mb-4 text-[#202122] text-[15px] sm:text-[16px] leading-[1.65] font-serif text-justify first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-1">
                {articleData.extract}
              </p>
            )}

            {/* Section 1: Origem e Contexto */}
            <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#a2a9b1] pb-1 mt-6 mb-3">
              Origem e Documentação Histórica
            </h2>

            {/* Paragraphs 1 to 4 */}
            {WIKI_FORCED_PARAGRAPHS.slice(0, 4).map((p, idx) => (
              <React.Fragment key={`p1-${idx}`}>
                {renderFormattedParagraph(p, term)}
              </React.Fragment>
            ))}

            {/* Section 2: Usos e Aplicações */}
            <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#a2a9b1] pb-1 mt-6 mb-3">
              Usos, Aplicações e Recomendações
            </h2>

            {/* Paragraphs 5 to 8 */}
            {WIKI_FORCED_PARAGRAPHS.slice(4, 8).map((p, idx) => (
              <React.Fragment key={`p2-${idx}`}>
                {renderFormattedParagraph(p, term)}
              </React.Fragment>
            ))}

            {/* Section 3: Análise e Tradição */}
            <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#a2a9b1] pb-1 mt-6 mb-3">
              Tradição e Perspectivas Modernas
            </h2>

            {/* Paragraphs 9 to 11 */}
            {WIKI_FORCED_PARAGRAPHS.slice(8, 11).map((p, idx) => (
              <React.Fragment key={`p3-${idx}`}>
                {renderFormattedParagraph(p, term)}
              </React.Fragment>
            ))}

            {/* References Section */}
            <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#a2a9b1] pb-1 mt-8 mb-3">
              Referências
            </h2>
            <ol className="list-decimal list-inside text-xs text-[#54595d] space-y-1 mb-8 leading-relaxed font-sans">
              <li><span className="text-[#3366cc]">Enciclopédia Contemporânea de Estudos Históricos</span> (2018), p. 45–48.</li>
              <li>Silva, M. A. <em>«Registro e Análise de Ocorrências»</em>. Editora Acadêmica, 2012.</li>
              <li><em>Dicionário Etimológico e Raízes Greco-Latinas</em>, Volume II, Lisboa, 2005.</li>
              <li>Almeida, R. <em>«Tradições e Práticas ao Longo dos Séculos»</em>. Coimbra: Imprensa Universitária, 2016.</li>
              <li>Conselho Geral de Pesquisas. <em>«Normas e Recomendações Práticas»</em>, 2020.</li>
              <li>Arquivos Gerais da Biblioteca Nacional, Seção de Manuscritos e Documentos, 2014.</li>
              <li>Revista Internacional de Cultura e Tradições, nº 88, pp. 112–119, 2021.</li>
              <li>Estudos Clássicos de Terminologia Antiga, Oxford University Press, 2009.</li>
              <li>Anais do Congresso de História e Sociedade, Vol. 14, 2017.</li>
              <li>Guia Oficial de Consulta Enciclopédica, 3ª Edição, 2022.</li>
              <li>Crônicas e Registros Urbanos do Mediterrâneo Antigo, Atenas, 2003.</li>
              <li>Léxico Latino-Português de Vocábulos Históricos, 2015.</li>
            </ol>
          </div>
        </main>

        {/* Wikipedia Article Footer */}
        <footer className="bg-[#f8f9fa] border-t border-[#eaecf0] py-8 px-4 text-xs text-[#54595d] font-sans">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center gap-2 text-[#3366cc]">
              <Globe size={15} />
              <span className="font-semibold">Wikipédia</span>
            </div>
            <p className="text-[11px] text-[#72777d]">
              Conteúdo disponibilizado nos termos da <span className="text-[#3366cc]">CC BY-SA 4.0</span>, salvo indicação em contrário.
            </p>
            <div
              onClick={handleSecretTrigger}
              className="flex flex-wrap gap-4 text-[#3366cc] text-[11px] pt-2 border-t border-[#eaecf0] cursor-pointer"
            >
              <span>Política de privacidade</span>
              <span>Termos de uso</span>
              <span>Versão desktop</span>
              <span>Desenvolvedores</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // PORTAL VIEW (Wikipedia Search Homepage)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#202122] flex flex-col justify-between font-serif selection:bg-[#c8ccd1] select-none">
      {/* Top Banner / Mobile Header */}
      <header className="border-b border-[#eaecf0] py-3 px-4 sm:px-8 flex items-center justify-between font-sans text-xs text-[#54595d]">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#36c]" />
          <span className="font-semibold text-[#202122]">Wikipédia</span>
          <span className="text-[#72777d] hidden sm:inline">— A enciclopédia livre</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === "pt" ? "en" : language === "en" ? "es" : "pt")}
            className="flex items-center gap-1 py-1 px-2.5 rounded border border-[#a2a9b1] hover:bg-[#f8f9fa] transition text-xs text-[#202122] font-sans"
          >
            <Languages size={13} className="text-[#36c]" />
            <span className="font-medium">
              {language === "pt" ? "PT - Português" : language === "en" ? "EN - English" : "ES - Español"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Wikipedia Iconic Globe Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/240px-Wikipedia-logo-v2.svg.png"
              alt="Wikipedia"
              className="w-32 sm:w-40 h-auto select-none pointer-events-none drop-shadow-xs"
              crossOrigin="anonymous"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#000000] tracking-tight font-serif">
            Wikipédia
          </h1>
          <p className="text-xs sm:text-sm text-[#54595d] mt-1 font-sans italic">
            {language === "pt"
              ? "A enciclopédia livre"
              : language === "es"
              ? "La enciclopedia libre"
              : "The Free Encyclopedia"}
          </p>
          <span className="text-[11px] text-[#72777d] mt-0.5 font-sans">
            {language === "pt" ? "1 130 000+ artigos em português" : "6 800 000+ articles in English"}
          </span>
        </div>

        {/* Wikipedia Search Bar */}
        <div className="w-full max-w-lg relative font-sans">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(query);
            }}
            className={`flex items-center w-full bg-white border ${
              isFocused ? "border-[#36c] shadow-[0_0_0_1px_#36c]" : "border-[#a2a9b1]"
            } rounded-md transition-all overflow-hidden`}
          >
            <div className="pl-3.5 pr-1 text-[#72777d]">
              <Search size={18} />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              placeholder={
                language === "pt"
                  ? "Pesquisar na Wikipédia..."
                  : language === "es"
                  ? "Buscar en Wikipedia..."
                  : "Search Wikipedia..."
              }
              className="w-full py-3 px-2 text-[#202122] text-sm sm:text-base outline-none bg-transparent"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              autoFocus
            />

            <button
              type="submit"
              disabled={isLoadingArticle || !query.trim()}
              className="bg-[#36c] hover:bg-[#447ff5] active:bg-[#2a4b8d] text-white p-3 px-4 transition flex items-center justify-center disabled:opacity-50"
              aria-label="Pesquisar"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Autocomplete Suggestions Box */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#a2a9b1] rounded-md shadow-lg z-30 overflow-hidden font-sans">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => handlePerformSearch(item)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#eaecf0] cursor-pointer text-sm text-[#202122] transition-colors border-b border-[#f8f9fa] last:border-0"
                >
                  <BookOpen size={15} className="text-[#72777d] shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Language Badges (Authentic Wikipedia Portal Look) */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg font-sans text-xs">
          <div
            onClick={() => setLanguage("pt")}
            className={`p-2.5 rounded border transition text-center cursor-pointer ${
              language === "pt" ? "border-[#36c] bg-[#eaf3ff]" : "border-[#eaecf0] hover:bg-[#f8f9fa]"
            }`}
          >
            <div className="font-bold text-[#36c]">Português</div>
            <div className="text-[11px] text-[#72777d]">1.130.000+ artigos</div>
          </div>

          <div
            onClick={() => setLanguage("en")}
            className={`p-2.5 rounded border transition text-center cursor-pointer ${
              language === "en" ? "border-[#36c] bg-[#eaf3ff]" : "border-[#eaecf0] hover:bg-[#f8f9fa]"
            }`}
          >
            <div className="font-bold text-[#36c]">English</div>
            <div className="text-[11px] text-[#72777d]">6,850,000+ articles</div>
          </div>

          <div
            onClick={() => setLanguage("es")}
            className={`p-2.5 rounded border transition text-center cursor-pointer col-span-2 sm:col-span-1 ${
              language === "es" ? "border-[#36c] bg-[#eaf3ff]" : "border-[#eaecf0] hover:bg-[#f8f9fa]"
            }`}
          >
            <div className="font-bold text-[#36c]">Español</div>
            <div className="text-[11px] text-[#72777d]">1.960.000+ artículos</div>
          </div>
        </div>
      </main>

      {/* Wikipedia Footer */}
      <footer className="bg-[#f8f9fa] border-t border-[#eaecf0] py-6 px-4 font-sans text-xs text-[#54595d]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-[11px] text-[#72777d]">
              O texto é disponibilizado nos termos da licença Creative Commons Atribuição-CompartilhaIgual 4.0 Internacional.
            </p>
          </div>
          <div
            onClick={handleSecretTrigger}
            className="flex items-center gap-4 text-[#36c] text-[11px] shrink-0 cursor-pointer active:opacity-70"
          >
            <span>Política de privacidade</span>
            <span>Sobre a Wikipédia</span>
            <span>Avisos gerais</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
