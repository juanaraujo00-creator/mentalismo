import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Globe,
  BookOpen,
  Languages,
  Menu,
  Bookmark,
  Star,
  ExternalLink,
  ChevronRight,
  Share2,
  ArrowLeft,
  Info,
  Check,
} from "lucide-react";
import { SearchEntry, LiveTypingData } from "../types";

interface AcronimoModeProps {
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

// 📚 Rich Portuguese Wikipedia Encyclopedia terms dictionary categorized by 3rd letter (1-based index 3, 0-based index 2)
const ACRONYM_DICTIONARY: { [letter: string]: string[] } = {
  a: [
    "Brasil", "Planeta", "Trabalho", "Amazônia", "Classificação", "Quantidades",
    "Tratado", "Prática", "Gravidade", "Estatística", "Gramática", "Clássico",
    "Análise", "Teatro", "Realidade", "Qualidade", "França", "Praia", "Tradição",
  ],
  b: [
    "Urbanização", "Tubarão", "Álbum", "Laboratório", "Robótica", "Tabela",
    "Gabinete", "Cubo", "Sábado", "Tribunal", "Debate", "Sabor", "Hábito",
  ],
  c: [
    "Socialismo", "Bactéria", "Sociologia", "Racionalismo", "Decisões", "Recurso",
    "Arcaico", "Vocação", "Picasso", "Escala", "Ficção", "Docente", "Secular",
    "Tecnologia", "Pacífico", "Nacional", "Rochedo", "Seca",
  ],
  d: [
    "Indústria", "Modernismo", "Medicina", "Padrão", "Radiação", "Ordem",
    "Vida", "Modelo", "Madeira", "Cidade", "Código", "Cidadão", "Rodovia",
    "Caderno", "Pedra",
  ],
  e: [
    "Meeting", "Ameaça", "Eletricidade", "Energia", "Cientista", "Presidente",
    "Alemanha", "Poema", "Atenas", "Cinema", "Teoria", "Mente", "Guerra",
    "Semente", "Tempo",
  ],
  f: [
    "Informática", "Influência", "Reflexão", "Referência", "Defesa", "Software",
    "Alfabeto", "Reforma", "Cafeína", "Perfil", "Oficina", "Efeito", "Esfera",
  ],
  g: [
    "Região", "Organização", "Legislação", "Argentina", "Digital", "Ligação",
    "Vigor", "Lógica", "Agosto", "Figura", "Magia", "Regra", "Migração",
  ],
  h: [
    "Bahia", "Bohêmio", "Teheran", "Chaminé", "Alho", "Olho", "Sahara",
    "Brahma", "Mahatma", "Jhonson",
  ],
  i: [
    "Universo", "Princípio", "Edição", "Origem", "Acidente", "Animal",
    "Amizade", "Aliança", "Clima", "Caixa", "Existe", "Emissão", "Crise",
    "União", "Unidade",
  ],
  j: [
    "Objeto", "Projeto", "Sujeito", "Rejeitado", "Feijoada", "Laje",
    "Tijolo", "Major", "Trajeto", "Injeção",
  ],
  k: [
    "Viking", "Tokyo", "Baker", "Fokker", "Paquistão", "Sake", "Bikini",
  ],
  l: [
    "Televisão", "Filosofia", "Política", "Religião", "Colégio", "Cilindro",
    "Eleição", "Seleção", "Solução", "Beleza", "Cultura", "Validade", "Polícia",
  ],
  m: [
    "Comunicação", "Comércio", "Hemisfério", "Timbre", "Campo", "Tempo",
    "Simetria", "Almoço", "Câmara", "Demografia", "Símbolo", "Família", "Romance",
  ],
  n: [
    "Conhecimento", "Linguagem", "Cinema", "Genética", "Santidade", "Fantasia",
    "Monumento", "Finanças", "Dinâmica", "Canção", "Vanguarda", "Mineral",
  ],
  o: [
    "Biologia", "Geografia", "Processo", "Produção", "Clone", "Economia",
    "Amor", "Bloco", "Evolução", "Flora", "Flotilha", "Glória", "Troca",
  ],
  p: [
    "Espaço", "Espécie", "Experiência", "Império", "Capital", "Oportunidade",
    "Ópera", "Aplicação", "Esporte", "Japão", "Opinião", "Opção", "Capítulo",
  ],
  q: [
    "Arquivo", "Arquitetura", "Pequeno", "Esquema", "Máquina", "Equipe",
    "Líquido", "Aquário", "Esquerda",
  ],
  r: [
    "Europa", "Período", "Forma", "Carta", "Terra", "Variação",
    "Norte", "Arte", "Corrente", "Circo", "Geração", "Marte", "Força",
  ],
  s: [
    "História", "Sistema", "Pesquisa", "Museu", "Visão", "Observação",
    "Resultado", "Costumes", "Moscou", "Asilo", "Passado", "Ensino", "Escola",
  ],
  t: [
    "Artigo", "Natureza", "Estudo", "Literatura", "Autor", "Metodologia",
    "Categoria", "Outono", "Fator", "Ator", "Setor", "Motor", "Fato",
  ],
  u: [
    "Educação", "Equilíbrio", "Atuação", "Saúde", "Reunião", "Fauna",
    "Saudade", "Causa", "Flauta", "Naufrágio", "Mundo", "Turismo", "Música",
  ],
  v: [
    "Invenção", "Divisão", "Novidade", "Advogado", "Investigação", "Governo",
    "Alvo", "Levantamento", "Evento", "Revolução", "Árvore", "Ouvinte", "Nuvem",
  ],
  w: [
    "Newton", "Hawaii", "Bowie", "Lawrence", "Darwin", "Show", "Download",
  ],
  x: [
    "Texto", "Fixação", "Maxwell", "Exemplo", "Oxford", "Sexo", "Próximo",
    "Taxonomia", "Exame", "Extra",
  ],
  y: [
    "Python", "Sydney", "Ryan", "Hidrogênio", "Cyber", "Byte", "Kayak",
  ],
  z: [
    "Gazeta", "Bazar", "Dezembro", "Reza", "Fuzil", "Razão", "Cozimento",
    "Vazio", "Lazer", "Azeite", "Cozinha",
  ],
};

// Clean accents helper to extract letter
function cleanChar(char: string): string {
  if (!char) return "c";
  const normalized = char
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /^[a-z]$/.test(normalized) ? normalized : "c";
}

// Check if a word has 3rd letter equal to target
function isThirdLetter(word: string, targetLetter: string): boolean {
  if (!word || word.length < 3) return false;
  const cleanWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return cleanWord[2] === targetLetter.toLowerCase();
}

export const AcronimoMode: React.FC<AcronimoModeProps> = ({
  sessionId = "default",
  onOpenMagician,
}) => {
  const [viewState, setViewState] = useState<"portal" | "article">("portal");
  const [query, setQuery] = useState("");
  const [currentArticleTitle, setCurrentArticleTitle] = useState("Ciência");
  const [language, setLanguage] = useState<"pt" | "en" | "es">("pt");
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [articleData, setArticleData] = useState<WikiArticleData | null>(null);

  // Stored Peek Target Word (from spectator's primary search)
  const [secretWord, setSecretWord] = useState<string>("cavalo");
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Secret Triple tap on logo
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<any>(null);

  // 1. Fetch & Listen to Secret Peek Word from Server
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isCancelled = false;

    const fetchStoredSearch = async () => {
      try {
        const res = await fetch("/api/searches");
        if (res.ok) {
          const data = await res.json();
          if (data.latest && data.latest.query) {
            const raw = data.latest.query.trim();
            if (raw) setSecretWord(raw);
          }
        }
      } catch (e) {
        console.warn("Could not fetch stored search for Acronym mode", e);
      }
    };

    fetchStoredSearch();

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/searches/stream");
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
              if (newEntry.query && newEntry.query.trim()) {
                setSecretWord(newEntry.query.trim());
                // Reset step on new target word
                setCurrentStep(0);
              }
            }
          } catch {}
        });
      } catch {}
    };

    connectSSE();

    return () => {
      isCancelled = true;
      if (eventSource) eventSource.close();
    };
  }, [sessionId]);

  // Extract array of clean characters from secret word
  const secretLetters = secretWord
    .split("")
    .map(cleanChar)
    .filter((c) => /^[a-z]$/.test(c));

  const effectiveLetters = secretLetters.length > 0 ? secretLetters : ["c", "a", "v", "a", "l", "o"];
  const targetChar = effectiveLetters[currentStep % effectiveLetters.length] || "c";

  // 2. Fetch and format Wikipedia article
  const loadArticle = async (titleToLoad: string) => {
    setIsLoadingArticle(true);
    setCurrentArticleTitle(titleToLoad);
    setViewState("article");

    try {
      const res = await fetch(
        `/api/wiki-summary?q=${encodeURIComponent(titleToLoad)}&lang=${language}`
      );
      if (res.ok) {
        const data: WikiArticleData = await res.json();
        setArticleData(data);
      } else {
        setArticleData({
          title: titleToLoad,
          displaytitle: titleToLoad,
          extract: `${titleToLoad} é um conceito e tema de fundamental relevância registrado no acervo da enciclopédia livre, com ramificações históricas e teóricas documentadas ao longo das eras.`,
          description: "Artigo da Wikipédia",
          thumbnail: null,
          originalimage: null,
        });
      }
    } catch {
      setArticleData({
        title: titleToLoad,
        displaytitle: titleToLoad,
        extract: `${titleToLoad} é amplamente reconhecido na literatura e nas ciências contemporâneas como um marco de estudo.`,
        description: "Artigo da Wikipédia",
        thumbnail: null,
        originalimage: null,
      });
    } finally {
      setIsLoadingArticle(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Perform a new search inside Wikipedia (innocent search)
  const handlePerformSearch = (term: string) => {
    const final = (term || query).trim();
    if (!final) return;
    setCurrentStep(0);
    loadArticle(final);
    setQuery("");
    setSuggestions([]);
  };

  // Advance to next letter upon clicking a hyperlink, or redirect to real Wikipedia on the last letter
  const handleHyperlinkClick = (clickedTerm: string, e: React.MouseEvent) => {
    e.preventDefault();

    // If clicking on the link of the last letter of the secret word (e.g., the 6th letter for "cavalo")
    // Redirect directly to the official real Wikipedia page!
    if (currentStep >= effectiveLetters.length - 1) {
      const langPrefix = language === "en" ? "en" : language === "es" ? "es" : "pt";
      window.location.href = `https://${langPrefix}.wikipedia.org/wiki/${encodeURIComponent(clickedTerm)}`;
      return;
    }

    // Advance step: next article will have 3rd letter equal to next letter of secret word!
    setCurrentStep((prev) => prev + 1);
    loadArticle(clickedTerm);
  };

  // Autocomplete suggestions
  useEffect(() => {
    if (query.trim()) {
      setSuggestions([
        query,
        `${query} (história)`,
        `${query} (origem)`,
        `${query} (conceito)`,
        `${query} na cultura popular`,
      ]);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Secret Triple Tap on Logo
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

  // Clean HTML tags helper
  const cleanHtmlTags = (text: string) => {
    if (!text) return "";
    return text.replace(/<[^>]+>/g, "").trim();
  };

  // Build Paragraphs with Natural Hyperlinks (All with 3rd letter === targetChar)
  const renderInteractiveContent = () => {
    const rawExtract = cleanHtmlTags(
      articleData?.extract ||
      `${currentArticleTitle} compreende uma vasta área de pesquisa e desenvolvimento cultural, histórico e científico.`
    );

    // Format first paragraph cleanly without duplicate prefixes
    let formattedLead = rawExtract;
    const cleanTitle = cleanHtmlTags(currentArticleTitle);
    if (formattedLead.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
      formattedLead = formattedLead.slice(cleanTitle.length).trim();
      if (formattedLead.startsWith(",") || formattedLead.startsWith(":")) {
        formattedLead = formattedLead.slice(1).trim();
      }
    }

    // Pool of available 3rd-letter matching words
    const availablePool = ACRONYM_DICTIONARY[targetChar] || [
      "Socialismo", "Bactéria", "Sociologia", "Racionalismo",
    ];

    // Pick 4-6 distinct words from pool
    const selectedKeywords = availablePool.slice(0, 6);

    return (
      <div className="space-y-4 text-slate-800 text-[15px] sm:text-base leading-relaxed font-serif">
        {/* Paragraph 1: Real Wikipedia extract */}
        <p className="leading-relaxed">
          <strong className="font-bold text-slate-900">{cleanTitle}</strong>
          {formattedLead ? ` ${formattedLead}` : " é amplamente documentado no acervo enciclopédico."}
        </p>

        {/* Paragraph 2: Encyclopedic context naturally weaving in the target links */}
        <p className="leading-relaxed">
          Ao longo do desenvolvimento moderno, as correlações teóricas integraram estudos fundamentais sobre{" "}
          <a
            href="#"
            onClick={(e) => handleHyperlinkClick(selectedKeywords[0] || "Socialismo", e)}
            className="text-[#3366cc] hover:underline cursor-pointer font-medium"
            title={selectedKeywords[0]}
          >
            {selectedKeywords[0] || "Socialismo"}
          </a>{" "}
          e suas diversas aplicações metodológicas.[1] A estruturação formal também estabeleceu diálogos profundos com{" "}
          <a
            href="#"
            onClick={(e) => handleHyperlinkClick(selectedKeywords[1] || "Bactéria", e)}
            className="text-[#3366cc] hover:underline cursor-pointer font-medium"
            title={selectedKeywords[1]}
          >
            {selectedKeywords[1] || "Bactéria"}
          </a>
          , consolidando parâmetros que influenciaram publicações acadêmicas em escala global.[2]
        </p>

        {/* Subheading: História e Influências */}
        <div className="border-b border-slate-300 pt-3 pb-1">
          <h2 className="text-xl sm:text-2xl font-serif text-slate-900 font-normal">
            História e Influências
          </h2>
        </div>

        {/* Paragraph 3 */}
        <p className="leading-relaxed">
          Documentos preservados indicam que os primeiros debates foram amplamente registrados por pesquisadores dedicados à{" "}
          <a
            href="#"
            onClick={(e) => handleHyperlinkClick(selectedKeywords[2] || "Sociologia", e)}
            className="text-[#3366cc] hover:underline cursor-pointer font-medium"
            title={selectedKeywords[2]}
          >
            {selectedKeywords[2] || "Sociologia"}
          </a>
          . Essas investigações permitiram formular hipóteses ligadas ao{" "}
          <a
            href="#"
            onClick={(e) => handleHyperlinkClick(selectedKeywords[3] || "Racionalismo", e)}
            className="text-[#3366cc] hover:underline cursor-pointer font-medium"
            title={selectedKeywords[3]}
          >
            {selectedKeywords[3] || "Racionalismo"}
          </a>
          , destacando princípios indispensáveis para a compreensão do fenômeno.[3]
        </p>

        {/* Paragraph 4 if more terms available */}
        {selectedKeywords.length >= 5 && (
          <p className="leading-relaxed">
            Na contemporaneidade, novas abordagens continuam a explorar conexões essenciais com{" "}
            <a
              href="#"
              onClick={(e) => handleHyperlinkClick(selectedKeywords[4], e)}
              className="text-[#3366cc] hover:underline cursor-pointer font-medium"
              title={selectedKeywords[4]}
            >
              {selectedKeywords[4]}
            </a>
            {selectedKeywords[5] && (
              <>
                {" "}e análises centradas em{" "}
                <a
                  href="#"
                  onClick={(e) => handleHyperlinkClick(selectedKeywords[5], e)}
                  className="text-[#3366cc] hover:underline cursor-pointer font-medium"
                  title={selectedKeywords[5]}
                >
                  {selectedKeywords[5]}
                </a>
              </>
            )}
            , promovendo debates interdisciplinares contínuos.[4]
          </p>
        )}

        {/* Section: Ver também */}
        <div className="border-b border-slate-300 pt-4 pb-1">
          <h2 className="text-lg sm:text-xl font-serif text-slate-900 font-normal">
            Ver também
          </h2>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[#3366cc]">
          {selectedKeywords.map((item, idx) => (
            <li key={idx}>
              <a
                href="#"
                onClick={(e) => handleHyperlinkClick(item, e)}
                className="hover:underline cursor-pointer font-sans text-sm"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Section: Referências */}
        <div className="border-b border-slate-300 pt-4 pb-1">
          <h2 className="text-lg sm:text-xl font-serif text-slate-900 font-normal">
            Referências
          </h2>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-500 font-sans">
          <li>Enciclopédia Universal, Volume IV, p. 112-118 (2019).</li>
          <li>Revista Brasileira de Estudos Contemporâneos, Edição 45 (2021).</li>
          <li>Arquivos de Filosofia e Ciência Aplicada, Artigo 19 (2020).</li>
          <li>Dicionário Histórico e Temático Internacional (2023).</li>
        </ol>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202122] flex flex-col font-sans">
      {/* Authentic Wikipedia Navigation Header */}
      <header className="bg-white border-b border-[#a2a9b1] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setViewState("portal")}
              className="text-[#54595d] hover:text-black p-1 rounded-sm"
              title="Menu Principal"
            >
              <Menu size={20} />
            </button>
            <div
              onClick={handleSecretTripleTap}
              className="flex items-center gap-2 cursor-pointer select-none"
              title="Wikipédia, a enciclopédia livre"
            >
              <div className="w-8 h-8 rounded-full bg-[#f8f9fa] border border-[#a2a9b1] flex items-center justify-center text-slate-800 shadow-2xs font-serif font-black text-lg">
                W
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-serif font-bold text-base tracking-tight text-black">
                  WIKIPÉDIA
                </span>
                <span className="text-[10px] text-[#54595d] uppercase tracking-wider">
                  A enciclopédia livre
                </span>
              </div>
            </div>
          </div>

          {/* Real Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="flex items-center bg-[#f8f9fa] border border-[#a2a9b1] rounded-sm focus-within:border-[#3366cc] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#3366cc] transition-all">
              <div className="pl-3 text-[#72777d]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePerformSearch(query);
                }}
                placeholder="Pesquisar na Wikipédia..."
                className="w-full py-1.5 px-2 bg-transparent outline-none text-sm text-[#202122] placeholder:text-[#72777d]"
              />
              {query && (
                <button
                  onClick={() => handlePerformSearch(query)}
                  className="px-3 py-1 bg-[#3366cc] text-white text-xs font-semibold rounded-xs mr-1 hover:bg-[#2a4b8d] transition"
                >
                  Pesquisar
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#a2a9b1] shadow-lg rounded-sm overflow-hidden z-50 animate-fade-in">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePerformSearch(item)}
                    className="px-3 py-2 text-sm text-[#202122] hover:bg-[#eaecf0] cursor-pointer flex items-center gap-2 border-b border-[#eaecf0] last:border-0"
                  >
                    <Search size={14} className="text-[#72777d]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language & Actions */}
          <div className="flex items-center gap-2 text-xs text-[#54595d]">
            <button
              onClick={() => setLanguage((l) => (l === "pt" ? "en" : l === "en" ? "es" : "pt"))}
              className="flex items-center gap-1 hover:text-black py-1 px-2 rounded-sm border border-transparent hover:border-[#a2a9b1]"
            >
              <Languages size={15} />
              <span className="uppercase font-semibold">{language}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 1. PORTAL LANDING VIEW                                       */}
      {/* ============================================================ */}
      {viewState === "portal" && (
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8">
          <div className="text-center my-6 sm:my-10">
            <div className="inline-block p-4 rounded-full bg-white border border-[#a2a9b1] mb-4 shadow-sm">
              <Globe size={48} className="text-[#202122]" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-black font-normal mb-2">
              Wikipédia
            </h1>
            <p className="text-sm sm:text-base text-[#54595d] font-serif italic">
              A enciclopédia livre disponível em mais de 300 idiomas
            </p>
          </div>

          {/* Quick Start Articles */}
          <div className="bg-white border border-[#a2a9b1] p-5 rounded-xs shadow-xs">
            <h3 className="text-sm font-bold uppercase text-[#54595d] tracking-wider mb-4 border-b border-[#eaecf0] pb-2">
              Artigos em Destaque
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Ciência", desc: "Corpo de conhecimento empírico e teórico sobre o universo." },
                { title: "História", desc: "Estudo dos eventos e sociedades humanas ao longo do tempo." },
                { title: "Filosofia", desc: "Investigação sobre a existência, conhecimento e valores." },
                { title: "Planeta Terra", desc: "O terceiro planeta do Sistema Solar habitado por seres vivos." },
              ].map((art, idx) => (
                <div
                  key={idx}
                  onClick={() => loadArticle(art.title)}
                  className="p-3 border border-[#eaecf0] hover:border-[#3366cc] rounded-xs cursor-pointer hover:bg-[#f8f9fa] transition group"
                >
                  <span className="font-bold text-[#3366cc] group-hover:underline text-base block font-serif">
                    {art.title}
                  </span>
                  <span className="text-xs text-[#54595d] line-clamp-2 mt-0.5">
                    {art.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ============================================================ */}
      {/* 2. ARTICLE READING VIEW                                      */}
      {/* ============================================================ */}
      {viewState === "article" && (
        <main className="flex-1 max-w-4xl mx-auto w-full bg-white border-x border-[#a2a9b1] p-4 sm:p-8 shadow-xs">
          {/* Article Header & Tools */}
          <div className="border-b border-[#a2a9b1] pb-2 mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-black font-normal">
                {cleanHtmlTags(articleData?.displaytitle || articleData?.title || currentArticleTitle)}
              </h1>
              <p className="text-xs text-[#54595d] mt-0.5">
                Origem: Wikipédia, a enciclopédia livre.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#54595d]">
              <span className="text-[#3366cc] cursor-pointer hover:underline">
                Artigo
              </span>
              <span className="text-[#3366cc] cursor-pointer hover:underline">
                Discussão
              </span>
              <span className="text-[#3366cc] cursor-pointer hover:underline hidden sm:inline">
                Editar
              </span>
              <span className="text-[#3366cc] cursor-pointer hover:underline hidden sm:inline">
                Histórico
              </span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoadingArticle && (
            <div className="py-12 text-center text-[#54595d]">
              <div className="inline-block w-6 h-6 border-2 border-[#3366cc] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Carregando artigo enciclopédico...</p>
            </div>
          )}

          {/* Article Content with Hyperlinks */}
          {!isLoadingArticle && renderInteractiveContent()}
        </main>
      )}

      {/* Authentic Wikipedia Footer */}
      <footer className="bg-[#eaecf0] border-t border-[#a2a9b1] py-6 px-4 text-center text-xs text-[#54595d] mt-auto">
        <div className="max-w-4xl mx-auto space-y-2">
          <p>
            O texto está disponível sob a Licença Creative Commons Atribuição-CompartilhaIgual 4.0;
            termos adicionais podem ser aplicados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-[#3366cc]">
            <a href="#" className="hover:underline">Política de privacidade</a>
            <a href="#" className="hover:underline">Sobre a Wikipédia</a>
            <a href="#" className="hover:underline">Avisos gerais</a>
            <a href="#" className="hover:underline">Versão móvel</a>
            <a href="#" className="hover:underline">Desenvolvedores</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
