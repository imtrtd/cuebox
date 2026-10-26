"use client";

import { useSyncExternalStore } from "react";

export type ThemePref = "system" | "light" | "dark";
export const THEME_KEY = "cuebox-theme";

/** Inline, render-blocking: applies the stored theme before first paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();`;

const listeners = new Set<() => void>();

function readPref(): ThemePref {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setPref(next: ThemePref) {
  const root = document.documentElement;
  try {
    if (next === "system") {
      delete root.dataset.theme;
      localStorage.removeItem(THEME_KEY);
    } else {
      root.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
    }
  } catch {
    /* storage unavailable: theme still applies for this page */
  }
  listeners.forEach((cb) => cb());
}

const ORDER: ThemePref[] = ["system", "light", "dark"];
const LABELS: Record<ThemePref, string> = {
  system: "Тема: как в системе",
  light: "Тема: светлая",
  dark: "Тема: тёмная",
};

export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as ThemePref);
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];

  return (
    <button
      type="button"
      className="btn btn-ghost theme-toggle"
      onClick={() => setPref(next)}
      title={`${LABELS[pref]} — переключить`}
      aria-label={`${LABELS[pref]}. Переключить`}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        {pref === "light" ? (
          <>
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" strokeLinecap="round" />
          </>
        ) : pref === "dark" ? (
          <path d="M13.5 9.5A5.5 5.5 0 1 1 6.5 2.5a4.5 4.5 0 0 0 7 7Z" strokeLinejoin="round" />
        ) : (
          <>
            <circle cx="8" cy="8" r="5.5" />
            <path d="M8 2.5v11A5.5 5.5 0 0 0 8 2.5Z" fill="currentColor" />
          </>
        )}
      </svg>
    </button>
  );
}
