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
    // Check initial route / hash / query params
    const checkRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      
      const isMagicianParam =
        params.get("mode") === "peek" ||
        params.get("mode") === "magico" ||
        params.get("peek") === "1" ||
        params.get("magico") === "1" ||
        window.location.pathname.includes("/peek") ||
        window.location.pathname.includes("/magico");

      const isPredictionParam =
        params.get("mode") === "previsao" ||
        params.get("mode") === "prediction" ||
        params.get("previsao") === "1" ||
        params.get("prediction") === "1" ||
        window.location.pathname.includes("/previsao") ||
        window.location.pathname.includes("/prediction");

      const isWikiParam =
        hash === "#wiki" ||
        hash === "#wikipedia" ||
        params.get("mode") === "wiki" ||
        params.get("mode") === "wikipedia" ||
        params.get("wiki") === "1" ||
        window.location.pathname.includes("/wiki");

      const isDrawingParam =
        hash === "#desenho" ||
        hash === "#drawing" ||
        hash === "#paint" ||
        params.get("mode") === "desenho" ||
        params.get("mode") === "drawing" ||
        params.get("mode") === "paint" ||
        params.get("desenho") === "1" ||
        window.location.pathname.includes("/desenho");

      const isAcronimoParam =
        hash === "#acronimo" ||
        hash === "#acronym" ||
        hash === "#letras" ||
        params.get("mode") === "acronimo" ||
        params.get("mode") === "acronym" ||
        params.get("acronimo") === "1" ||
        window.location.pathname.includes("/acronimo");

      const session = params.get("s") || params.get("session") || "default";
      setSessionId(session);

      if (isAcronimoParam) {
        setCurrentView("acronimo");
      } else if (isDrawingParam) {
        setCurrentView("desenho");
      } else if (isWikiParam) {
        setCurrentView("wiki");
      } else if (hash === "#prediction" || hash === "#previsao" || isPredictionParam) {
        setCurrentView("prediction");
      } else if (hash === "#peek" || hash === "#magico" || hash === "#control" || isMagicianParam) {
        setCurrentView("magician");
      } else {
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
    window.location.hash = "peek";
    setCurrentView("magician");
  };

  const handleSwitchToSpectator = () => {
    window.location.hash = "";
    setCurrentView("spectator");
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
