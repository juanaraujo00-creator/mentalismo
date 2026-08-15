import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface SearchEntry {
  id: string;
  query: string;
  timestamp: number;
  sessionId: string;
  device?: string;
  isLiveTyping?: boolean;
}

interface ServerState {
  searches: SearchEntry[];
  currentLiveQuery: { [sessionId: string]: { query: string; timestamp: number } };
  config: {
    redirectDomain: string; // e.g. "www.google.com" or "www.google.com.br"
    theme: "system" | "light" | "dark";
    fakeLocation: string;
    predictionTarget: "images" | "web" | "maps";
    predictionDelay: number;
    predictionStyle: "google_wait" | "stealth_black" | "google_images_wait";
  };
}

const state: ServerState = {
  searches: [],
  currentLiveQuery: {},
  config: {
    redirectDomain: "www.google.com",
    theme: "light",
    fakeLocation: "Brasil",
    predictionTarget: "images",
    predictionDelay: 0,
    predictionStyle: "google_wait",
  },
};

// SSE clients for real-time live push
const sseClients: Response[] = [];

function notifyClients(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Get current searches & live state
  app.get("/api/searches", (req: Request, res: Response) => {
    res.json({
      searches: state.searches,
      currentLiveQuery: state.currentLiveQuery,
      latest: state.searches[0] || null,
      config: state.config,
    });
  });

  // Record a search (or live keystroke)
  app.post("/api/searches", (req: Request, res: Response) => {
    const { query, sessionId = "default", isLive = false, device = "Mobile" } = req.body;
    const cleanQuery = typeof query === "string" ? query.trim() : "";

    if (!cleanQuery && !isLive) {
      return res.status(400).json({ error: "Empty query" });
    }

    if (isLive) {
      // Update live keystroke
      state.currentLiveQuery[sessionId] = {
        query: cleanQuery,
        timestamp: Date.now(),
      };
      notifyClients("liveTyping", {
        sessionId,
        query: cleanQuery,
        timestamp: Date.now(),
      });
      return res.json({ success: true, isLive: true });
    }

    // Finalized search
    const newEntry: SearchEntry = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      query: cleanQuery,
      timestamp: Date.now(),
      sessionId,
      device,
      isLiveTyping: false,
    };

    // Prepend to history
    state.searches.unshift(newEntry);
    if (state.searches.length > 100) {
      state.searches.pop();
    }

    // Clear live typing for this session
    delete state.currentLiveQuery[sessionId];

    // Real-time broadcast
    notifyClients("newSearch", newEntry);

    res.json({
      success: true,
      entry: newEntry,
      redirectUrl: `https://${state.config.redirectDomain}/search?q=${encodeURIComponent(cleanQuery)}`,
    });
  });

  // SSE Stream for Instant Real-Time Peek
  app.get("/api/searches/stream", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // Send initial snapshot
    res.write(
      `event: snapshot\ndata: ${JSON.stringify({
        searches: state.searches,
        currentLiveQuery: state.currentLiveQuery,
        latest: state.searches[0] || null,
        config: state.config,
      })}\n\n`
    );

    sseClients.push(res);

    req.on("close", () => {
      const index = sseClients.indexOf(res);
      if (index !== -1) {
        sseClients.splice(index, 1);
      }
    });
  });

  // Clear history
  app.delete("/api/searches", (req: Request, res: Response) => {
    const { id } = req.query;
    if (id && typeof id === "string") {
      state.searches = state.searches.filter((s) => s.id !== id);
    } else {
      state.searches = [];
      state.currentLiveQuery = {};
    }
    notifyClients("cleared", { searches: state.searches });
    res.json({ success: true });
  });

  // Configuration update
  app.post("/api/config", (req: Request, res: Response) => {
    const {
      redirectDomain,
      theme,
      fakeLocation,
      predictionTarget,
      predictionDelay,
      predictionStyle,
    } = req.body;
    if (redirectDomain) state.config.redirectDomain = redirectDomain;
    if (theme) state.config.theme = theme;
    if (fakeLocation) state.config.fakeLocation = fakeLocation;
    if (predictionTarget) state.config.predictionTarget = predictionTarget;
    if (typeof predictionDelay === "number") state.config.predictionDelay = predictionDelay;
    if (predictionStyle) state.config.predictionStyle = predictionStyle;

    notifyClients("configUpdate", state.config);
    res.json({ success: true, config: state.config });
  });

  // Wikipedia Summary & Images Proxy for the spectator article page
  app.get("/api/wiki-summary", async (req: Request, res: Response) => {
    const q = req.query.q as string;
    const lang = (req.query.lang as string) || "pt";

    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    const searchTerm = q.trim();

    try {
      // 1. Try direct summary first
      let wikiRes = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            "User-Agent": "WikiApp/1.0 (magic-peek-applet)",
            Accept: "application/json",
          },
        }
      );

      if (wikiRes.ok) {
        const data = await wikiRes.json();
        return res.json({
          title: data.title || searchTerm,
          displaytitle: data.displaytitle || data.title || searchTerm,
          extract: data.extract || "",
          description: data.description || "",
          thumbnail: data.thumbnail?.source || null,
          originalimage: data.originalimage?.source || null,
        });
      }

      // 2. If direct title 404, search for the best matching article
      const searchRes = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          searchTerm
        )}&format=json`
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const topResult = searchData?.query?.search?.[0];
        if (topResult && topResult.title) {
          const matchRes = await fetch(
            `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              topResult.title
            )}`,
            {
              headers: {
                "User-Agent": "WikiApp/1.0 (magic-peek-applet)",
                Accept: "application/json",
              },
            }
          );
          if (matchRes.ok) {
            const matchData = await matchRes.json();
            return res.json({
              title: matchData.title || searchTerm,
              displaytitle: matchData.displaytitle || matchData.title || searchTerm,
              extract: matchData.extract || topResult.snippet?.replace(/<[^>]+>/g, "") || "",
              description: matchData.description || "",
              thumbnail: matchData.thumbnail?.source || null,
              originalimage: matchData.originalimage?.source || null,
            });
          }
        }
      }

      // Fallback
      return res.json({
        title: searchTerm,
        displaytitle: searchTerm,
        extract: `${searchTerm} é um termo ou figura de amplo reconhecimento e relevância cultural e histórica, documentado em diversos registros e estudos.`,
        description: "Artigo da Wikipédia",
        thumbnail: null,
        originalimage: null,
      });
    } catch (err) {
      console.error("Wikipedia API fetch error:", err);
      return res.json({
        title: searchTerm,
        displaytitle: searchTerm,
        extract: `${searchTerm} é um conceito e assunto de notável destaque histórico e documentação enciclopédica.`,
        description: "Artigo da Wikipédia",
        thumbnail: null,
        originalimage: null,
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Magic Peek Server running on http://localhost:${PORT}`);
  });
}

startServer();
