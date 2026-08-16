/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GoogleClone } from "./components/GoogleClone";
import { WikipediaClone } from "./components/WikipediaClone";
import { MagicianDashboard } from "./components/MagicianDashboard";
import { PredictionMode } from "./components/PredictionMode";
import { DrawingPeekApp } from "./components/DrawingPeekApp";
import { AcronimoMode } from "./components/AcronimoMode";
import { AppViewMode } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<AppViewMode>("spectator");
  const [sessionId, setSessionId] = useState("default");

  useEffect(() => {
    // Check initial route / hash / query params and domain
    const checkRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();
      const hostname = window.location.hostname.toLowerCase();

      // Check if domain is a Wikipedia clone domain
      const isWikiDomain =
        hostname.includes("wikipedia") ||
        hostname.includes("wkipedia") ||
        hostname.includes("wiki.");
      
      const isMagicianParam =
        hash === "#peek" ||
        hash === "#magico" ||
        hash === "#control" ||
        hash === "#p" ||
        params.get("mode") === "peek" ||
        params.get("mode") === "magico" ||
        params.get("mode") === "p" ||
        params.get("peek") === "1" ||
        params.get("magico") === "1" ||
        params.get("p") === "1" ||
        pathname === "/p" ||
        pathname.startsWith("/p/") ||
        pathname.includes("/peek") ||
        pathname.includes("/magico");

      const isPredictionParam =
        hash === "#prediction" ||
        hash === "#previsao" ||
        params.get("mode") === "previsao" ||
        params.get("mode") === "prediction" ||
        params.get("previsao") === "1" ||
        params.get("prediction") === "1" ||
        pathname.includes("/previsao") ||
        pathname.includes("/prediction");

      const isDrawingParam =
        hash === "#desenho" ||
        hash === "#drawing" ||
        hash === "#paint" ||
        params.get("mode") === "desenho" ||
        params.get("mode") === "drawing" ||
        params.get("mode") === "paint" ||
        params.get("desenho") === "1" ||
        pathname.includes("/desenho");

      const isAcronimoParam =
        hash === "#acronimo" ||
        hash === "#acronym" ||
        hash === "#letras" ||
        hash === "#a" ||
        params.get("mode") === "acronimo" ||
        params.get("mode") === "acronym" ||
        params.get("mode") === "a" ||
        params.get("acronimo") === "1" ||
        params.get("a") === "1" ||
        pathname === "/a" ||
        pathname.startsWith("/a/") ||
        pathname.includes("/acronimo");

      const isWikiParam =
        hash === "#wiki" ||
        hash === "#wikipedia" ||
        hash === "#w" ||
        params.get("mode") === "wiki" ||
        params.get("mode") === "wikipedia" ||
        params.get("mode") === "w" ||
        params.get("wiki") === "1" ||
        params.get("w") === "1" ||
        pathname === "/w" ||
        pathname.startsWith("/w/") ||
        pathname.includes("/wiki");

      const session = params.get("s") || params.get("session") || "default";
      setSessionId(session);

      if (isMagicianParam) {
        setCurrentView("magician");
      } else if (isAcronimoParam) {
        setCurrentView("acronimo");
      } else if (isDrawingParam) {
        setCurrentView("desenho");
      } else if (isWikiParam) {
        setCurrentView("wiki");
      } else if (isPredictionParam) {
        setCurrentView("prediction");
      } else if (isWikiDomain) {
        // Automatic default for wikipedia domains (e.g. wkipedia.org.br, wikipedia.app.br)
        setCurrentView("wiki");
      } else {
        // Default Google clone search for googlee.net.br / googlee.app.br / others
        setCurrentView("spectator");
      }
    };

    checkRoute();

    window.addEventListener("hashchange", checkRoute);
    window.addEventListener("popstate", checkRoute);

    // Keyboard shortcut for magician: Alt + M or Ctrl + Shift + M
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === "m") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m")) {
        e.preventDefault();
        setCurrentView((prev) => (prev === "spectator" ? "magician" : "spectator"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", checkRoute);
      window.removeEventListener("popstate", checkRoute);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleOpenMagician = () => {
    try {
      window.history.pushState(null, "", "/p");
    } catch {
      window.location.hash = "p";
    }
    setCurrentView("magician");
  };

  const handleSwitchToSpectator = () => {
    try {
      window.history.pushState(null, "", "/");
    } catch {
      window.location.hash = "";
    }
    setCurrentView("spectator");
  };

  const handleSwitchToAcronimo = () => {
    try {
      window.history.pushState(null, "", "/a");
    } catch {
      window.location.hash = "a";
    }
    setCurrentView("acronimo");
  };

  const handleSwitchToWiki = () => {
    try {
      window.history.pushState(null, "", "/w");
    } catch {
      window.location.hash = "w";
    }
    setCurrentView("wiki");
  };

  if (currentView === "magician") {
    return <MagicianDashboard onSwitchToSpectator={handleSwitchToSpectator} />;
  }

  if (currentView === "acronimo") {
    return (
      <AcronimoMode
        sessionId={sessionId}
        onOpenMagician={handleOpenMagician}
      />
    );
  }

  if (currentView === "desenho") {
    return (
      <DrawingPeekApp
        sessionId={sessionId}
        onOpenMagician={handleOpenMagician}
      />
    );
  }

  if (currentView === "wiki") {
    return (
      <WikipediaClone
        sessionId={sessionId}
        onOpenMagician={handleOpenMagician}
        onSwitchToAcronimo={handleSwitchToAcronimo}
      />
    );
  }

  if (currentView === "prediction") {
    return (
      <PredictionMode
        sessionId={sessionId}
        onOpenMagician={handleOpenMagician}
      />
    );
  }

  return (
    <GoogleClone
      sessionId={sessionId}
      onOpenMagician={handleOpenMagician}
    />
  );
}
