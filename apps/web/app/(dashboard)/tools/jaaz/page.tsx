"use client";

import { useState, useCallback } from "react";
import { Palette, RefreshCw, WifiOff, ExternalLink } from "lucide-react";

// Marketing Studio page — Jaaz AI generátor social media assets
// Jaaz beží cez Next.js proxy: /tools/jaaz/* → http://jaaz-server:5174/*
// Prístup je same-origin, takže CSP frame-ancestors 'none' zostáva nedotknuté.
// Autentifikácia je zabezpečená Next.js middleware (session token musí existovať).

type LoadState = "loading" | "ready" | "error";

export default function MarketingStudioPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [key, setKey] = useState(0); // key reset spôsobí znovunačítanie iframe

  const handleLoad = useCallback(() => {
    setLoadState("ready");
  }, []);

  const handleError = useCallback(() => {
    setLoadState("error");
  }, []);

  const handleReload = useCallback(() => {
    setLoadState("loading");
    setKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Hlavička stránky — štýl konzistentný s ostatnými dashboard stránkami */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold">
              Marketing Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              AI generátor grafík pre sociálne siete
            </p>
          </div>
        </div>

        {/* Tlačidlo na obnovenie — viditeľné vždy, užitočné ak Jaaz zamrzne */}
        <button
          onClick={handleReload}
          aria-label="Obnoviť Marketing Studio"
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Obnoviť
        </button>
      </div>

      {/* Kontajner pre iframe — zaberá zvyšok dostupnej výšky */}
      <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface">

        {/* Loading skeleton — zobrazuje sa počas načítavania Jaaz UI */}
        {loadState === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surface">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Palette className="h-6 w-6 animate-pulse text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium">Načítavam Marketing Studio…</p>
              <p className="text-xs text-muted-foreground">
                Spúšťa sa Jaaz AI server
              </p>
            </div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-border">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        )}

        {/* Error state — zobrazuje sa ak Jaaz server nie je dostupný */}
        {loadState === "error" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surface">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <WifiOff className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">Marketing Studio nie je dostupné</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Jaaz server neodpovedá. Skontrolujte, či je spustený pomocou{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                  docker compose --profile jaaz up
                </code>
              </p>
            </div>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Skúsiť znova
            </button>
            {/* Odkaz pre debug — otvorí /jaaz-proxy priamo v novej záložke */}
            <a
              href="/jaaz-proxy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              Otvoriť v novom okne
            </a>
          </div>
        )}

        {/* Jaaz iframe — same-origin vďaka Next.js proxy rewrites v next.config.js
            Proxy rule: /jaaz-proxy/:path* → ${JAAZ_SERVER_URL}/:path*
            Nie je to externý iframe — X-Frame-Options/CSP frame-ancestors zostávajú. */}
        <iframe
          key={key}
          src="/jaaz-proxy"
          title="Marketing Studio — Jaaz AI"
          className="h-full w-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          aria-label="Marketing Studio — AI nástroj pre tvorbu grafík"
        />
      </div>
    </div>
  );
}
